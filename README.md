# 🤖 AI PDF Chatbot — RAG Project

A Retrieval-Augmented Generation (RAG) chatbot that answers questions from uploaded PDFs using FAISS + Gemini.

---

## 📁 Folder Structure

```
rag-pdf-chatbot/
├── backend/
│   ├── app.py              ← Flask routes (upload, ask)
│   ├── pdf_handler.py      ← PDF text extraction
│   ├── rag_pipeline.py     ← Core RAG: chunks, embeddings, FAISS, Gemini
│   ├── requirements.txt    ← Python packages
│   ├── .env                ← Your Gemini API key (DO NOT commit to GitHub)
│   └── uploads/            ← Auto-created when you upload a PDF
│
└── frontend/
    └── src/
        └── App.jsx         ← React UI (upload + chat)
```

---

## ⚙️ Backend Setup

### 1. Go into backend folder
```bash
cd backend
```

### 2. Install packages
```bash
pip install -r requirements.txt
```

### 3. Create `.env` file
```
GOOGLE_API_KEY=your_gemini_api_key_here
```
Get key from: https://aistudio.google.com/app/apikey

### 4. Run Flask
```bash
python app.py
```
Flask runs at: http://localhost:5000

---

## ⚛️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
React runs at: http://localhost:5173

---

## 🔄 How It Works (RAG Flow)

```
User uploads PDF
      ↓
Extract text (pypdf)
      ↓
Split into chunks (500 chars, 50 overlap)
      ↓
Convert chunks → Embedding vectors (sentence-transformers)
      ↓
Store vectors in FAISS index
      ↓
User asks question
      ↓
Convert question → embedding
      ↓
Search FAISS for top 3 similar chunks
      ↓
Send context + question to Gemini
      ↓
Return AI answer
```

---

## 🧪 Test Endpoints (Without Frontend)

### Test Upload (use Postman or curl):
```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@your_file.pdf"
```

### Test Ask:
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this PDF about?"}'
```

---

## 📝 Resume Line

> Built a Retrieval-Augmented Generation (RAG) PDF chatbot using Python, Flask, FAISS, Sentence Transformers, and Gemini API — capable of answering contextual questions from any uploaded document.

---

## 🎯 Interview Q&A You Can Answer

| Question | Answer |
|---|---|
| What is RAG? | Retrieve relevant context from documents, then pass to LLM for grounded answers |
| Why FAISS? | Fast vector similarity search — finds most relevant text chunks instantly |
| What are embeddings? | Numerical vector representations of text — similar text has similar vectors |
| Why chunking? | LLMs have token limits; smaller chunks also improve search precision |
| Difference from normal chatbot? | Normal chatbot uses training data; RAG uses YOUR documents |
