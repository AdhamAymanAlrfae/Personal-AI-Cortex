from pathlib import Path

from langchain_core.documents import Document

from app.providers.ingestion.loaders.md_loader import load_markdown
from app.providers.ingestion.loaders.pdf_loader import load_pdf
from app.providers.ingestion.loaders.txt_loader import load_txt


def load_document(file_path: str | Path) -> list[Document]:
    """Load a supported document based on its file extension."""
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".md":
        return load_markdown(path)
    if extension == ".pdf":
        return load_pdf(path)
    if extension == ".txt":
        return load_txt(path)

    raise ValueError(f"Unsupported document type: {extension or 'no extension'}")
