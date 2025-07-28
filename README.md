# 📚 NotebookLM

NotebookLM is a full-stack web app inspired by Google's NotebookLM. It allows users to upload PDFs, process them using LangChain and HuggingFace embeddings, store and retrieve vector representations using Qdrant, and chat with the document using an AI model powered by the HugingFace API.

---

## 🚀 Features

- 📤 PDF upload and cloud storage (Cloudinary)
- 🧠 Embedding generation using HuggingFace Transformers
- 🗃️ Vector database integration with Qdrant
- 💬 AI-powered chat interface for querying document content
- ⚙️ Background processing using BullMQ + Redis queues
- 🔒 User authentication (Clerk)

---

## 📦 Usage

1. Visit the frontend URL.
2. Upload a `.pdf` file using the upload button.
3. Wait for the file to be processed in the background.
4. Once ready, start chatting with the AI about the document content.

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express, LangChain
- **AI Models:** HuggingFace
- **Database:** Qdrant (Vector DB)
- **Queue System:** BullMQ + Redis
- **Cloud Storage:** Cloudinary
- **Hosting:** Vercel (frontend) & Render (backend)

---

## 🧑‍💻 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Sumiattri/NotebookLM
cd server && npm install
cd ../client && npm install
```
