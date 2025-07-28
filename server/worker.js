import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantClient } from "@qdrant/qdrant-js";
import IORedis from "ioredis";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import dotenv from "dotenv";
dotenv.config();
const HF_API_KEY = process.env.HF_API_KEY;

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {},

  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      console.log("Job started:", job.data);
      const data = JSON.parse(job.data);

      const COLLECTION_NAME = "langchainjs-testing";

      const qdrantClient = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
      });

      console.log(
        `Checking and deleting existing collection: ${COLLECTION_NAME}`
      );
      try {
        const { collections } = await qdrantClient.getCollections();
        const collectionExists = collections.some(
          (col) => col.name === COLLECTION_NAME
        );

        if (collectionExists) {
          await qdrantClient.deleteCollection(COLLECTION_NAME);
          console.log(`Collection '${COLLECTION_NAME}' deleted successfully.`);
        } else {
          console.log(`Collection '${COLLECTION_NAME}' did not exist.`);
        }
      } catch (error) {
        console.warn(
          `Could not delete collection '${COLLECTION_NAME}' (it might not exist or another issue occurred):`,
          error.message
        );
      }

      console.log("Processing Cloudinary URL:", data.cloudinaryUrl);

      const response = await fetch(data.cloudinaryUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch PDF from Cloudinary: ${response.statusText}`
        );
      }
      const pdfBlob = await response.blob();

      const loader = new PDFLoader(pdfBlob);

      const docs = await loader.load();
      console.log(`Loaded ${docs.length} documents from PDF`);

      console.log("Initializing HuggingFace embeddings...");
      const embeddings = new HuggingFaceInferenceEmbeddings({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        apiKey: HF_API_KEY,
      });

      console.log("Connecting to Qdrant vector store and adding documents...");
      const vectorStore = await QdrantVectorStore.fromDocuments(
        docs,
        embeddings,
        {
          url: process.env.QDRANT_URL,
          collectionName: COLLECTION_NAME,
          apiKey: process.env.QDRANT_API_KEY,
        }
      );
      console.log("All docs are added to vector store");

      return { success: true, documentsProcessed: docs.length };
    } catch (error) {
      console.error("Error processing job:", error);
      throw error;
    }
  },
  {
    concurrency: 100,
    connection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

worker.on("ready", () => {
  console.log("Worker is ready and waiting for jobs");
});

console.log("Worker started and listening for jobs...");
