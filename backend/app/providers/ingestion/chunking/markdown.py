import logging
from collections.abc import Sequence

from langchain_core.documents import Document
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

from app.core.config import settings
from app.providers.ingestion.chunking.base import BaseChunker

logger = logging.getLogger(__name__)

_MARKDOWN_HEADERS = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
    ("####", "Header 4"),
    ("#####", "Header 5"),
    ("######", "Header 6"),
]


class MarkdownChunker(BaseChunker):
    """Split Markdown at heading boundaries and retain each chunk's heading path."""

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ) -> None:

        # TODO: Consider using a strip_headers=False option and retaining the headers in the chunk content, but this would require a more complex approach to ensure that the headers are not duplicated across chunks.
        self._header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=_MARKDOWN_HEADERS,
            strip_headers=True,
        )
        self._content_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size if chunk_size is None else chunk_size,
            chunk_overlap=(
                settings.chunk_overlap if chunk_overlap is None else chunk_overlap
            ),
        )

    def split_documents(self, documents: Sequence[Document]) -> list[Document]:
        """Split each document and attach its heading hierarchy and chunk index."""
        logger.debug("Chunking %d documents with Markdown chunker", len(documents))
        chunks: list[Document] = []
        for document in documents:
            document_chunk_index = 0
            sections = self._header_splitter.split_text(document.page_content)
            for section in sections:
                header_path = " > ".join(
                    section.metadata[header_name]
                    for _, header_name in _MARKDOWN_HEADERS
                    if header_name in section.metadata
                )
                section_document = Document(
                    page_content=section.page_content,
                    metadata={
                        **document.metadata,
                        **section.metadata,
                        "header_path": header_path,
                    },
                )
                section_chunks = self._content_splitter.split_documents(
                    [section_document]
                )
                for chunk in section_chunks:
                    chunk.metadata["chunk_index"] = document_chunk_index
                    chunks.append(chunk)
                    document_chunk_index += 1
        logger.debug("Markdown chunker generated %d chunks", len(chunks))
        return chunks
