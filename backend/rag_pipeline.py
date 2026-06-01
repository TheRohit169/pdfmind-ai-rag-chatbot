import os
import faiss
import numpy as np
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

load_dotenv()
key = os.getenv("GOOGLE_API_KEY")
print(f"🔑 API Key loaded: {'YES ✅' if key else 'NO ❌ — check your .env file'}")
genai.configure(api_key=key)

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
faiss_index = None
text_chunks = []


def split_text_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    print(f"✅ Split text into {len(chunks)} chunks")
    return chunks


def create_vectorstore(text: str):
    global faiss_index, text_chunks
    text_chunks = split_text_into_chunks(text)
    print("⏳ Creating embeddings...")
    embeddings = embedding_model.encode(text_chunks, show_progress_bar=True)
    embeddings = np.array(embeddings).astype("float32")
    dimension = embeddings.shape[1]
    faiss_index = faiss.IndexFlatL2(dimension)
    faiss_index.add(embeddings)
    print(f"✅ FAISS index created with {faiss_index.ntotal} vectors")


def retrieve_relevant_chunks(question: str, top_k: int = 5) -> list:
    question_embedding = embedding_model.encode([question])
    question_embedding = np.array(question_embedding).astype("float32")
    distances, indices = faiss_index.search(question_embedding, top_k)
    return [text_chunks[i] for i in indices[0] if i < len(text_chunks)]


def ask_question(question: str) -> str:
    global faiss_index
    if faiss_index is None or len(text_chunks) == 0:
        return "❌ No PDF uploaded yet. Please upload a PDF first."

    overview_keywords = [
        "overview", "summary", "summarize", "summarise",
        "what is inside", "what's inside", "about this pdf",
        "tell me about", "what does this pdf", "give me overview",
        "describe this", "explain this pdf", "what is this pdf"
    ]
    is_overview = any(word in question.lower() for word in overview_keywords)

    if is_overview:
        top_k = min(15, len(text_chunks))
        prompt_instruction = """Provide a concise but complete overview of the entire document.
Cover all main topics including: projects, skills, education, experience, certifications, and key highlights.
Structure your answer in a readable way."""
    else:
        top_k = 5
        prompt_instruction = """Answer the user's question ONLY based on the context provided below.
If the answer is not found in the context, say "I couldn't find this information in the uploaded PDF." """

    relevant_chunks = retrieve_relevant_chunks(question, top_k=top_k)
    context = "\n\n".join(relevant_chunks)

    prompt = f"""You are a helpful assistant analyzing a PDF document.
{prompt_instruction}

Context from PDF:
{context}

User Question: {question}

Answer:"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"⚠️ gemini-1.5-flash failed: {e}")
        try:
            available = [
                m.name for m in genai.list_models()
                if "generateContent" in m.supported_generation_methods
                and "flash" in m.name
            ]
            print(f"Available flash models: {available}")
            if not available:
                return "❌ No Gemini models available for your API key."
            model = genai.GenerativeModel(available[0])
            response = model.generate_content(prompt)
            return response.text
        except Exception as e2:
            print(f"❌ Fallback also failed: {e2}")
            return f"❌ AI error: {str(e2)}"