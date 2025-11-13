import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import cloudinary from "./cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const HF_API_KEY = process.env.HF_API_KEY; // ONLY for embeddings
const GEMINI_API_KEY = process.env.Gemini_Api_Key;

// Redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {},
});

const queue = new Queue("file-upload-queue", { connection });

// Cloudinary Upload
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "NotebookLM_PDFs",
    allowed_formats: ["pdf"],
    resource_type: "raw",
  },
});
const upload = multer({ storage });

// Upload Route
app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file?.path) {
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

// Chat Route (Gemini)
app.get("/chat", async (req, res) => {
  try {
    const userQuery = req.query.message;

    // 1️⃣ VECTOR SEARCH (same as before)
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

    // 2️⃣ BUILD PROMPT
    const SYSTEM_PROMPT = `
Use the following PDF context to answer the user question.

Context:
${JSON.stringify(result)}

User: ${userQuery}
Assistant:
`;

    // 3️⃣ CALL GEMINI
    const geminiURL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      GEMINI_API_KEY;

    const geminiRes = await fetch(geminiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: SYSTEM_PROMPT }],
          },
        ],
      }),
    });

    const data = await geminiRes.json();

    console.log("GEMINI RAW:", data);

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

    return res.json({
      message: answer,
      docs: result,
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      message: "Server error. Gemini model failed.",
    });
  }
});

app.get("/", (req, res) => res.json({ status: "All Good" }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
