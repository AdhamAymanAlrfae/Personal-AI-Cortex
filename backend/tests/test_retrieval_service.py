from collections.abc import Sequence

import pytest
from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.sparse_base import (
    BaseSparseEmbeddingProvider,
    SparseVectorEmbedding,
)
from app.providers.vector_store.base import BaseVectorStore
from app.services.retrieval import DocumentRetrievalService, RetrievalMode
from qdrant_client import models


class FakeDenseEmbeddings(BaseEmbeddingProvider):
    def __init__(self) -> None:
        self.queries: list[str] = []

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError

    def embed_query(self, text: str) -> list[float]:
        self.queries.append(text)
        return [0.1, 0.2]


class FakeSparseEmbeddings(BaseSparseEmbeddingProvider):
    def __init__(self) -> None:
        self.queries: list[str] = []

    def embed_documents(self, texts: list[str]) -> list[SparseVectorEmbedding]:
        raise NotImplementedError

    def embed_query(self, text: str) -> SparseVectorEmbedding:
        self.queries.append(text)
        return SparseVectorEmbedding(indices=[1, 3], values=[0.25, 0.75])


class FakeVectorStore(BaseVectorStore[models.PointStruct, models.ScoredPoint]):
    def __init__(self) -> None:
        self.calls: list[tuple[str, tuple[object, ...], dict[str, object]]] = []
        self.results = [
            models.ScoredPoint(
                id="point-1",
                version=1,
                score=0.9,
                payload={"page_content": "Relevant chunk"},
            )
        ]

    def add_points(self, points: Sequence[models.PointStruct]) -> None:
        raise NotImplementedError

    def dense_search(
        self,
        query_vector: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.7,
    ) -> list[models.ScoredPoint]:
        self.calls.append(
            ("dense", (query_vector,), {"limit": limit, "threshold": threshold})
        )
        return self.results

    def sparse_search(
        self,
        query_indices: list[int],
        query_values: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.5,
    ) -> list[models.ScoredPoint]:
        self.calls.append(
            (
                "sparse",
                (query_indices, query_values),
                {"limit": limit, "threshold": threshold},
            )
        )
        return self.results

    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.5,
    ) -> list[models.ScoredPoint]:
        self.calls.append(
            (
                "hybrid",
                (dense_vector, sparse_indices, sparse_values),
                {"limit": limit, "threshold": threshold},
            )
        )
        return self.results


@pytest.fixture
def retrieval_dependencies() -> tuple[
    FakeDenseEmbeddings, FakeSparseEmbeddings, FakeVectorStore
]:
    return FakeDenseEmbeddings(), FakeSparseEmbeddings(), FakeVectorStore()


def test_retrieve_uses_hybrid_search_by_default(
    retrieval_dependencies: tuple[
        FakeDenseEmbeddings, FakeSparseEmbeddings, FakeVectorStore
    ],
) -> None:
    dense, sparse, store = retrieval_dependencies
    service = DocumentRetrievalService(dense, sparse, store)

    results = service.retrieve(
        "Where is retrieval used?",
        limit=3,
        threshold=0.44,
    )

    assert results == store.results
    assert dense.queries == ["Where is retrieval used?"]
    assert sparse.queries == ["Where is retrieval used?"]
    assert store.calls == [
        (
            "hybrid",
            ([0.1, 0.2], [1, 3], [0.25, 0.75]),
            {"limit": 3, "threshold": 0.44},
        )
    ]


def test_retrieve_dense_uses_dense_embedding_and_threshold(
    retrieval_dependencies: tuple[
        FakeDenseEmbeddings, FakeSparseEmbeddings, FakeVectorStore
    ],
) -> None:
    dense, sparse, store = retrieval_dependencies
    service = DocumentRetrievalService(dense, sparse, store)

    service.retrieve(
        "dense query",
        mode=RetrievalMode.DENSE,
        limit=4,
        threshold=0.82,
    )

    assert dense.queries == ["dense query"]
    assert sparse.queries == []
    assert store.calls == [("dense", ([0.1, 0.2],), {"limit": 4, "threshold": 0.82})]


def test_retrieve_sparse_uses_sparse_embedding_and_threshold(
    retrieval_dependencies: tuple[
        FakeDenseEmbeddings, FakeSparseEmbeddings, FakeVectorStore
    ],
) -> None:
    dense, sparse, store = retrieval_dependencies
    service = DocumentRetrievalService(dense, sparse, store)

    service.retrieve(
        "sparse query",
        mode=RetrievalMode.SPARSE,
        limit=2,
        threshold=0.35,
    )

    assert dense.queries == []
    assert sparse.queries == ["sparse query"]
    assert store.calls == [
        ("sparse", ([1, 3], [0.25, 0.75]), {"limit": 2, "threshold": 0.35})
    ]


@pytest.mark.parametrize(
    ("query", "limit", "message"),
    [
        ("  \n", 5, "query must not be empty"),
        ("query", 0, "limit must be greater than zero"),
        ("query", -1, "limit must be greater than zero"),
    ],
)
def test_retrieve_rejects_invalid_query_parameters(
    retrieval_dependencies: tuple[
        FakeDenseEmbeddings, FakeSparseEmbeddings, FakeVectorStore
    ],
    query: str,
    limit: int,
    message: str,
) -> None:
    dense, sparse, store = retrieval_dependencies
    service = DocumentRetrievalService(dense, sparse, store)

    with pytest.raises(ValueError, match=message):
        service.retrieve(query, limit=limit)

    assert dense.queries == []
    assert sparse.queries == []
    assert store.calls == []
