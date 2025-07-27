import { Worker } from "bullmq";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/qdrant-js";

import dotenv from "dotenv";
dotenv.config();
const HF_API_KEY = process.env.HF_API_KEY;

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      console.log("Job started:", job.data);
      const data = JSON.parse(job.data);

      const QDRANT_URL = "http://localhost:6333";
      const COLLECTION_NAME = "langchainjs-testing";

      const qdrantClient = new QdrantClient({ host: "localhost", port: 6333 });

      console.log(
        `Checking and deleting existing collection: ${COLLECTION_NAME}`
      );
      try {
        // Use the correct method for deleting a collection
        // Check if the collection exists first to avoid error if it's already gone
        const { collections } = await qdrantClient.getCollections();
        const collectionExists = collections.some(
          (col) => col.name === COLLECTION_NAME
        );

        if (collectionExists) {
          await qdrantClient.deleteCollection(COLLECTION_NAME); // Correct method
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

      console.log("Loading PDF from path:", data.path);
      //Load the pdf
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();
      console.log(`Loaded ${docs.length} documents from PDF`);

      console.log("Initializing OpenAI embeddings...");

      const embeddings = new HuggingFaceInferenceEmbeddings({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        apiKey: HF_API_KEY,
      });

      console.log("Connecting to Qdrant vector store...");

      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: "http://localhost:6333",
          collectionName: "langchainjs-testing",
        }
      );
      await vectorStore.addDocuments(docs);
      console.log("All docs are added to vector store");

      return { success: true, documentsProcessed: docs.length };
    } catch (error) {
      console.error("Error processing job:", error);
      throw error;
    }
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
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
