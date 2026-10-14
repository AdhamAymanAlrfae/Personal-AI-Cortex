import pytest
from langchain_core.documents import Document

from app.core.config import settings
from app.providers.chunking import BaseChunker, RecursiveCharacterChunker


def test_recursive_character_chunker_uses_configured_defaults() -> None:
    document = Document(page_content="x" * 630, metadata={"source": "notes.txt"})

    chunks = RecursiveCharacterChunker().split_documents([document])

    assert settings.chunk_size == 300
    assert settings.chunk_overlap == 30
    assert [len(chunk.page_content) for chunk in chunks] == [300, 300, 90]
    assert chunks[0].page_content[-30:] == chunks[1].page_content[:30]
    assert chunks[1].page_content[-30:] == chunks[2].page_content[:30]
    assert [chunk.metadata for chunk in chunks] == [
        {"source": "notes.txt", "chunk_index": 0},
        {"source": "notes.txt", "chunk_index": 1},
        {"source": "notes.txt", "chunk_index": 2},
    ]


def test_chunk_index_restarts_for_each_document() -> None:
    documents = [
        Document(page_content="a" * 301, metadata={"source": "first.txt"}),
        Document(page_content="b" * 301, metadata={"source": "second.txt"}),
    ]

    chunks = RecursiveCharacterChunker().split_documents(documents)

    assert [chunk.metadata for chunk in chunks] == [
        {"source": "first.txt", "chunk_index": 0},
        {"source": "first.txt", "chunk_index": 1},
        {"source": "second.txt", "chunk_index": 0},
        {"source": "second.txt", "chunk_index": 1},
    ]


def test_chunker_can_be_replaced_with_another_implementation() -> None:
    class IdentityChunker(BaseChunker):
        def split_documents(
            self, documents: list[Document]
        ) -> list[Document]:
            return list(documents)

    document = Document(page_content="Keep this document intact.")

    assert IdentityChunker().split_documents([document]) == [document]


def test_base_chunker_cannot_be_instantiated() -> None:
    with pytest.raises(TypeError, match="abstract"):
        BaseChunker()
