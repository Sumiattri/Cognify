import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { InferenceClient } from "@huggingface/inference";
import path from "path";
import { fileURLToPath } from "url";

import cloudinary from "./cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HF_API_KEY = process.env.HF_API_KEY;
const hf = new InferenceClient(HF_API_KEY);

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage: storage });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "NotebookLM_PDFs",
    allowed_formats: ["pdf"],
    resource_type: "raw", // important for non-image files
  },
});

const upload = multer({ storage });

const app = express();
app.use(cors());

// Serve static files from the 'uploads' directory ---
// This makes files in 'uploads/' accessible via 'http://localhost:8000/pdfs/your-unique-filename.pdf'
// app.use("/pdfs", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  return res.json({ status: "All Good" });
});

// app.post("/upload/pdf", upload.single("pdf"), async (req, res, next) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No PDF file uploaded." });
//   }

//   await queue.add(
//     "file-ready",
//     JSON.stringify({
//       filename: req.file.originalname,
//       destination: req.file.destination,
//       path: req.file.path,
//     })
//   );
//   return res.json({
//     message: "file uploaded",
//     uploadedFilename: req.file.filename, // <--- THIS IS THE UNIQUE FILENAME
//     originalFileName: req.file.originalname, // <--- OPTIONAL: original name for display
//   });
// });

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Upload failed." });
  }

  // This is your Cloudinary file URL
  const fileUrl = req.file.path;

  await queue.add(
    "file-ready",
    JSON.stringify({
      originalFileName: req.file.originalname,
      cloudinaryUrl: fileUrl,
    })
  );

  return res.json({
    message: "File uploaded to Cloudinary",
    cloudinaryUrl: fileUrl,
    originalFileName: req.file.originalname,
  });
});

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;
  // const userQuery = "who is this resume about?";

  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: HF_API_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "langchainjs-testing",
    }
  );
  const retriever = vectorStore.asRetriever({
    k: 2,
  });
  const result = await retriever.invoke(userQuery);

  const SYSTEM_PROMPT = `
  You are helfull AI Assistant who answeres the user query in a very precise and concise manner based on the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;

  const inputText = `${SYSTEM_PROMPT}\nUser: ${userQuery}\nAI:`;

  const chatResult = await hf.chatCompletion({
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  return res.json({
    message: chatResult.choices[0].message.content,
    docs: result,
  });
});

app.listen(8000, () => console.log(`Server started at PORT ${8000}`));
