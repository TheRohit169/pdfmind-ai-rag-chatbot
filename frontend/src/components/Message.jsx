export default function Message({ role, text }) {
  return (
    <div className={`message ${role}`}>
      <span className="msg-label">{role === "user" ? "You" : "AI"}</span>
      <div className="msg-bubble">{text}</div>
    </div>
  );
}
