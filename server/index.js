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

    // Vector Search
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

    // Prompt
    const SYSTEM_PROMPT = `Context:\n${JSON.stringify(result)}`;

    // FREE MODEL (Works reliably)
    const HF_URL =
      "https://router.huggingface.co/hf-inference/HuggingFaceH4/zephyr-7b-beta";

    const hfResponse = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: `${SYSTEM_PROMPT}\nUser: ${userQuery}\nAssistant:`,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.25,
        },
      }),
    });

    const text = await hfResponse.text();
    console.log("HF RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        message: "HF returned non-JSON response.",
        raw: text,
      });
    }

    return res.json({
      message: data.generated_text || data[0]?.generated_text || "No response.",
      docs: result,
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({
      message: "Server error. HF model not reachable.",
    });
  }
});

app.get("/", (req, res) => {
  return res.json({ status: "All Good" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
