import { useState } from "react";
import axios from "axios";

// For local Flask backend
const API = "http://localhost:5000";

// For deployed backend, use this later:
// const API = "https://pdfmind-ai-rag-chatbot-backend.onrender.com";

export default function UploadPDF({ onReady }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (selected) => {
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setStatus({ type: "error", msg: "Only PDF files are supported." });
      return;
    }

    setFile(selected);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus({
      type: "loading",
      msg: "Extracting text and building vector index...",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", res.data);

      setStatus({
        type: "success",
        msg: `✓ PDF uploaded and indexed successfully.`,
      });

      onReady(file.name);
    } catch (err) {
      console.error("Upload error:", err);

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please check backend connection.";

      setStatus({ type: "error", msg: `✗ ${msg}` });
    }
  };

  return (
    <div className="card">
      <div className="card-label">01 — Upload document</div>

      <div
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="drop-icon">📄</div>

        <p className="drop-text">
          Drag & drop a PDF here or <span>browse files</span>
        </p>

        {file && (
          <div className="file-selected">
            📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleUpload}
        disabled={!file || status?.type === "loading" || status?.type === "success"}
      >
        {status?.type === "loading"
          ? "⏳ Processing..."
          : "⬆ Upload & Index PDF"}
      </button>

      {status?.type === "loading" && (
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
      )}

      {status && <div className={`status ${status.type}`}>{status.msg}</div>}
    </div>
  );
}