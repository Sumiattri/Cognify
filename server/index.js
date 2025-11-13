import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { InferenceClient } from "@huggingface/inference";
import cloudinary from "./cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const HF_API_KEY = process.env.HF_API_KEY;
const hf = new InferenceClient(HF_API_KEY);

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {},
});

const queue = new Queue("file-upload-queue", { connection });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "NotebookLM_PDFs",
    allowed_formats: ["pdf"],
    resource_type: "raw",
  },
});

const upload = multer({ storage });

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Upload failed." });
    }

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
  } catch (err) {
    return res.status(500).json({ message: "Upload failed on server." });
  }
});

app.get("/chat", async (req, res) => {
  try {
    const userQuery = req.query.message;
    if (!userQuery) {
      return res.status(400).json({ message: "Message query missing." });
    }

    const embeddings = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      apiKey: HF_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: "langchainjs-testing",
        apiKey: process.env.QDRANT_API_KEY,
      }
    );

    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(userQuery);

    const SYSTEM_PROMPT = `You are a helpful AI Assistant.
Use only the information in the provided context.

Context:
${JSON.stringify(result, null, 2)}
`;

    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.1",
      inputs: `${SYSTEM_PROMPT}\nUser: ${userQuery}\nAssistant:`,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.2,
      },
    });

    const aiMessage = response[0]?.generated_text?.trim() || "No response.";

    return res.json({
      message: aiMessage,
      docs: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error. HF model could not be reached.",
    });
  }
});

app.get("/", (req, res) => {
  return res.json({ status: "All Good" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
