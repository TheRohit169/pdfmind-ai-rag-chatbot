import { useState } from "react";
import UploadPDF from "./components/UploadPDF";
import ChatBox from "./components/ChatBox";
import "./App.css";

export default function App() {
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfName, setPdfName] = useState("");

  return (
    <div className="app">
      <div className="bg-grid" />

      <div className="layout">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="header-icon">⬡</div>
            <div>
              <h1 className="header-title">
                PDF<span className="accent">Mind</span>
              </h1>
              <p className="header-sub">RAG-powered document intelligence</p>
            </div>
          </div>

          {pdfReady && (
            <div className="pdf-badge">
              <span className="badge-dot" />
              {pdfName}
            </div>
          )}
        </header>

        {/* Main */}
        <main className="main">
          <UploadPDF
            onReady={(name) => {
              setPdfReady(true);
              setPdfName(name);
            }}
          />
          <ChatBox pdfReady={pdfReady} />
        </main>

        <footer className="footer">
          Built with Flask · FAISS · Sentence Transformers · Gemini
        </footer>
      </div>
    </div>
  );
}
