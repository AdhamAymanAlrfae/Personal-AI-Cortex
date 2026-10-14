from pathlib import Path

from langchain_core.documents import Document


def load_txt(file_path: str | Path) -> list[Document]:
    """Load a UTF-8 text file as a LangChain document."""
    path = Path(file_path)
    return [
        Document(
            page_content=path.read_text(encoding="utf-8"),
            metadata={"source": str(path)},
        )
    ]
