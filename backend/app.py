from flask import Flask, request, jsonify, make_response
import os
from pdf_handler import extract_text_from_pdf
from rag_pipeline import create_vectorstore, ask_question

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://pdfmind-ai-rag-chatbot.vercel.app"
]

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")

    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin

    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = make_response()
        origin = request.headers.get("Origin")

        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin

        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response, 200

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "RAG PDF Chatbot API is running!"})


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "" or not file.filename.endswith(".pdf"):
        return jsonify({"error": "Please upload a valid PDF file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    text = extract_text_from_pdf(file_path)
    if not text.strip():
        return jsonify({"error": "Could not extract text from PDF"}), 400

    create_vectorstore(text)
    return jsonify({
        "message": "PDF uploaded and processed successfully!",
        "filename": file.filename,
        "characters_extracted": len(text)
    })


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"error": "No question provided"}), 400

    question = data["question"].strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400

    try:
        answer = ask_question(question)
        return jsonify({"question": question, "answer": answer})
    except Exception as e:
        print(f"❌ Error in /ask: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)