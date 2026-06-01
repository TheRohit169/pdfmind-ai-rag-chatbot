import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Message from "./Message";

const API = "https://pdfmind-ai-rag-chatbot-backend.onrender.com";

export default function ChatBox({ pdfReady }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAsking]);

  const sendQuestion = async () => {
    const q = question.trim();
    if (!q || isAsking) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setIsAsking(true);

    try {
      const res = await axios.post(`${API}/ask`, { question: q });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.answer }]);
    } catch (err) {
      const msg = err.response?.data?.error || "Could not get a response. Is Flask running?";
      setMessages((prev) => [...prev, { role: "bot", text: `✗ ${msg}` }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div className="card chat-card">
      <div className="card-label">02 — Ask questions</div>

      {/* Messages area */}
      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>
              {pdfReady
                ? "PDF indexed! Type a question below."
                : "Upload a PDF first, then ask anything about it."}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => <Message key={i} role={msg.role} text={msg.text} />)
        )}

        {/* Typing indicator */}
        {isAsking && (
          <div className="message bot">
            <span className="msg-label">AI</span>
            <div className="typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="input-row">
        <input
          className="chat-input"
          type="text"
          placeholder={pdfReady ? "Ask something about your PDF..." : "Upload a PDF to start..."}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!pdfReady || isAsking}
        />
        <button
          className="btn-send"
          onClick={sendQuestion}
          disabled={!pdfReady || isAsking || !question.trim()}
          title="Send (Enter)"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
