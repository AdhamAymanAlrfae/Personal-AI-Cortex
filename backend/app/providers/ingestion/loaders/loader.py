import logging
from pathlib import Path

from langchain_core.documents import Document

from app.providers.ingestion.loaders.md_loader import load_markdown
from app.providers.ingestion.loaders.pdf_loader import load_pdf
from app.providers.ingestion.loaders.txt_loader import load_txt

logger = logging.getLogger(__name__)


def load_document(file_path: str | Path) -> list[Document]:
    """Load a supported document based on its file extension."""
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".md":
        loader = load_markdown
    elif extension == ".pdf":
        loader = load_pdf
    elif extension == ".txt":
        loader = load_txt
    else:
        logger.warning("Rejected unsupported document extension %s", extension)
        raise ValueError(f"Unsupported document type: {extension or 'no extension'}")

    logger.debug("Loading document with extension %s", extension)
    try:
        documents = loader(path)
    except Exception:
        logger.exception("Failed to load document with extension %s", extension)
        raise

    logger.info(
        "Loaded document with extension %s into %d documents",
        extension,
        len(documents),
    )
    return documents
