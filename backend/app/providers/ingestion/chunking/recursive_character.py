from collections.abc import Sequence

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.providers.ingestion.chunking.base import BaseChunker


class RecursiveCharacterChunker(BaseChunker):
    """Chunk LangChain documents using recursive character splitting."""

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ) -> None:
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size if chunk_size is None else chunk_size,
            chunk_overlap=(
                settings.chunk_overlap if chunk_overlap is None else chunk_overlap
            ),
        )

    def split_documents(self, documents: Sequence[Document]) -> list[Document]:
        """Split documents, retaining metadata and adding a per-document index."""
        chunks: list[Document] = []
        for document in documents:
            document_chunks = self._splitter.split_documents([document])
            for chunk_index, chunk in enumerate(document_chunks):
                chunk.metadata["chunk_index"] = chunk_index
                chunks.append(chunk)
        return chunks
