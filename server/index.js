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

const HF_API_KEY = process.env.HF_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

// ----------------------- UPLOAD PDF -----------------------
app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Upload failed." });
    }

    await queue.add(
      "file-ready",
      JSON.stringify({
        originalFileName: req.file.originalname,
        cloudinaryUrl: req.file.path,
      })
    );

    return res.json({
      message: "File uploaded to Cloudinary",
      cloudinaryUrl: req.file.path,
      originalFileName: req.file.originalname,
    });
  } catch (err) {
    return res.status(500).json({ message: "Upload failed on server." });
  }
});

// ----------------------- CHAT ROUTE -----------------------
app.get("/chat", async (req, res) => {
  try {
    const userQuery = req.query.message;

    // EMBEDDINGS WITH HF KEY (FIXED)
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

    const retriever = vectorStore.asRetriever({ k: 3 });
    const result = await retriever.invoke(userQuery);

    const context = JSON.stringify(result);

    // ---------------- GEMINI CALL ----------------
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Use the following context from the PDF: ${context}\n\nQuestion: ${userQuery}\n\nAnswer clearly and concisely.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const json = await geminiResponse.json();
    console.log("GEMINI RAW:", json);

    if (!json.candidates || !json.candidates[0]) {
      return res.status(500).json({
        message: "Gemini returned no response.",
        raw: json,
      });
    }

    const msg = json.candidates[0].content.parts[0].text;

    return res.json({
      message: msg,
      docs: result,
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      message: "Server error. Gemini model failed.",
    });
  }
});

// ----------------------- HEALTH CHECK -----------------------
app.get("/", (req, res) => {
  return res.json({ status: "All Good" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
