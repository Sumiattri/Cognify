import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { QdrantVectorStore } from "@langchain/qdrant";
import cloudinary from "./cloudinaryConfig.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

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

    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: "langchainjs-testing",
        apiKey: process.env.QDRANT_API_KEY,
      }
    );

    const retriever = vectorStore.asRetriever({ k: 3 });
    const result = await retriever.invoke(userQuery);

    const SYSTEM_PROMPT = `Use the following context only:\n${JSON.stringify(
      result
    )}`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\nUser: ${userQuery}\nAssistant:`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiResp.json();

    return res.json({
      message:
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.",
      docs: result,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error. Gemini model failed.",
    });
  }
});

app.get("/", (req, res) => {
  return res.json({ status: "All Good" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
