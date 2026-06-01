from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    """
    Reads a PDF file and extracts all text from every page.

    Args:
        file_path: Path to the uploaded PDF file

    Returns:
        Full text content as a single string
    """
    reader = PdfReader(file_path)
    full_text = ""

    for page_number, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            full_text += page_text + "\n"
        else:
            print(f"Warning: No text found on page {page_number + 1}")

    print(f"✅ Extracted {len(full_text)} characters from {len(reader.pages)} pages")
    return full_text
