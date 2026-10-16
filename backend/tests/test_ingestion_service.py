from collections.abc import Sequence
from pathlib import Path

from langchain_core.documents import Document
from qdrant_client import models

from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.sparse_base import (
    BaseSparseEmbeddingProvider,
    SparseVectorEmbedding,
)
from app.providers.ingestion.chunking import MarkdownChunker, RecursiveCharacterChunker
from app.providers.ingestion.chunking.base import BaseChunker
from app.providers.vector_store.base import BaseVectorStore
from app.services.ingestion import DocumentIngestionService, IngestionResult


class FakeDenseEmbeddings(BaseEmbeddingProvider):
    def __init__(self) -> None:
        self.calls: list[list[str]] = []

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        self.calls.append(texts)
        return [[float(index), 1.0] for index, _ in enumerate(texts)]

    def embed_query(self, text: str) -> list[float]:
        raise NotImplementedError


class FakeSparseEmbeddings(BaseSparseEmbeddingProvider):
    def __init__(self) -> None:
        self.calls: list[list[str]] = []

    def embed_documents(self, texts: list[str]) -> list[SparseVectorEmbedding]:
        self.calls.append(texts)
        return [
            SparseVectorEmbedding(indices=[index], values=[1.0])
            for index, _ in enumerate(texts)
        ]

    def embed_query(self, text: str) -> SparseVectorEmbedding:
        raise NotImplementedError


class FakeVectorStore(BaseVectorStore[models.PointStruct, models.ScoredPoint]):
    def __init__(self) -> None:
        self.points: list[models.PointStruct] = []
        self.add_calls: list[list[models.PointStruct]] = []

    def add_points(self, points: Sequence[models.PointStruct]) -> None:
        self.add_calls.append(list(points))
        self.points.extend(points)

    def dense_search(
        self,
        query_vector: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.7,
    ) -> list[models.ScoredPoint]:
        raise NotImplementedError

    def sparse_search(
        self,
        query_indices: list[int],
        query_values: list[float],
        *,
        limit: int = 5,
    ) -> list[models.ScoredPoint]:
        raise NotImplementedError

    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
        *,
        limit: int = 5,
    ) -> list[models.ScoredPoint]:
        raise NotImplementedError


def test_ingest_markdown_file_chunks_embeds_builds_and_stores_points(
    tmp_path: Path,
) -> None:
    source = tmp_path / "guide.md"
    source.write_text(
        "# Guide\n## First\nFirst section content.\n## Second\nSecond section content.",
        encoding="utf-8",
    )
    dense = FakeDenseEmbeddings()
    sparse = FakeSparseEmbeddings()
    store = FakeVectorStore()
    service = DocumentIngestionService(dense, sparse, store, chunker=MarkdownChunker())

    result = service.ingest_file(source)

    assert result == IngestionResult(
        source=str(source),
        documents_loaded=1,
        chunks_created=2,
        points_added=2,
    )
    assert dense.calls == [["First section content.", "Second section content."]]
    assert sparse.calls == dense.calls
    assert len(store.points) == 2
    assert store.points[0].payload == {
        "page_content": "First section content.",
        "metadata": {
            "source": str(source),
            "Header 1": "Guide",
            "Header 2": "First",
            "header_path": "Guide > First",
            "chunk_index": 0,
        },
    }


def test_ingest_files_batches_embeddings_and_storage(tmp_path: Path) -> None:
    first = tmp_path / "first.md"
    first.write_text("# First\nFirst file content.", encoding="utf-8")
    second = tmp_path / "second.md"
    second.write_text("# Second\nSecond file content.", encoding="utf-8")
    dense = FakeDenseEmbeddings()
    sparse = FakeSparseEmbeddings()
    store = FakeVectorStore()
    service = DocumentIngestionService(dense, sparse, store, chunker=MarkdownChunker())

    results = service.ingest_files([first, second])

    assert [result.source for result in results] == [str(first), str(second)]
    assert [result.chunks_created for result in results] == [1, 1]
    assert [result.points_added for result in results] == [1, 1]
    assert dense.calls == [["First file content.", "Second file content."]]
    assert sparse.calls == dense.calls
    assert len(store.add_calls) == 1
    assert len(store.points) == 2


def test_ingest_file_skips_embedding_and_storage_when_no_chunks(
    tmp_path: Path,
) -> None:
    source = tmp_path / "empty.txt"
    source.write_text("", encoding="utf-8")
    dense = FakeDenseEmbeddings()
    sparse = FakeSparseEmbeddings()
    store = FakeVectorStore()
    service = DocumentIngestionService(
        dense, sparse, store, chunker=RecursiveCharacterChunker()
    )

    result = service.ingest_file(source)

    assert result.documents_loaded == 1
    assert result.chunks_created == 0
    assert result.points_added == 0
    assert dense.calls == []
    assert sparse.calls == []
    assert store.points == []


def test_ingest_file_uses_the_required_chunker(tmp_path: Path) -> None:
    class FixedChunker(BaseChunker):
        def split_documents(self, documents: Sequence[Document]) -> list[Document]:
            document = documents[0]
            return [
                Document(
                    page_content="custom chunk",
                    metadata={**document.metadata, "chunk_index": 0},
                )
            ]

    source = tmp_path / "notes.txt"
    source.write_text("Original content.", encoding="utf-8")
    dense = FakeDenseEmbeddings()
    sparse = FakeSparseEmbeddings()
    store = FakeVectorStore()
    service = DocumentIngestionService(
        dense,
        sparse,
        store,
        chunker=FixedChunker(),
    )

    result = service.ingest_file(source)

    assert result.chunks_created == 1
    assert dense.calls == [["custom chunk"]]
    assert store.points[0].payload["page_content"] == "custom chunk"
