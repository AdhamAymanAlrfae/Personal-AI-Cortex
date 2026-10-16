from typing import Any

from app.providers.vector_store.qdrant.store import QdrantVectorStore
from qdrant_client import models


class FakeQdrantClient:
    def __init__(self, collection_exists: bool) -> None:
        self.exists = collection_exists
        self.create_calls: list[dict[str, Any]] = []
        self.delete_calls: list[dict[str, Any]] = []
        self.upsert_calls: list[dict[str, Any]] = []

    def collection_exists(self, *, collection_name: str) -> bool:
        return self.exists

    def create_collection(self, **kwargs: Any) -> None:
        self.create_calls.append(kwargs)
        self.exists = True

    def delete_collection(self, **kwargs: Any) -> None:
        self.delete_calls.append(kwargs)
        self.exists = False

    def upsert(self, **kwargs: Any) -> None:
        self.upsert_calls.append(kwargs)


def test_create_collection_does_not_recreate_existing_collection() -> None:
    vector_store = object.__new__(QdrantVectorStore)
    vector_store.collection_name = "existing"
    client = FakeQdrantClient(collection_exists=True)
    vector_store.client = client  # type: ignore[assignment]

    vector_store.create_collection()

    assert client.create_calls == []


def test_create_collection_creates_missing_collection() -> None:
    vector_store = object.__new__(QdrantVectorStore)
    vector_store.collection_name = "new"
    client = FakeQdrantClient(collection_exists=False)
    vector_store.client = client  # type: ignore[assignment]

    vector_store.create_collection()

    assert len(client.create_calls) == 1
    assert client.create_calls[0]["collection_name"] == "new"
    assert "vectors_config" in client.create_calls[0]
    assert "sparse_vectors_config" in client.create_calls[0]


def test_recreate_collection_deletes_existing_collection_before_creating() -> None:
    vector_store = object.__new__(QdrantVectorStore)
    vector_store.collection_name = "existing"
    client = FakeQdrantClient(collection_exists=True)
    vector_store.client = client  # type: ignore[assignment]

    existed = vector_store.recreate_collection()

    assert existed is True
    assert client.delete_calls == [{"collection_name": "existing"}]
    assert len(client.create_calls) == 1
    assert client.exists is True


def test_recreate_collection_creates_missing_collection_without_deleting() -> None:
    vector_store = object.__new__(QdrantVectorStore)
    vector_store.collection_name = "missing"
    client = FakeQdrantClient(collection_exists=False)
    vector_store.client = client  # type: ignore[assignment]

    existed = vector_store.recreate_collection()

    assert existed is False
    assert client.delete_calls == []
    assert len(client.create_calls) == 1
    assert client.exists is True


def test_add_points_upserts_all_points_in_one_call() -> None:
    vector_store = object.__new__(QdrantVectorStore)
    vector_store.collection_name = "documents"
    client = FakeQdrantClient(collection_exists=True)
    vector_store.client = client  # type: ignore[assignment]
    points = [
        models.PointStruct(id="first", vector=[0.1], payload={}),
        models.PointStruct(id="second", vector=[0.2], payload={}),
    ]

    vector_store.add_points(points)

    assert len(client.upsert_calls) == 1
    assert client.upsert_calls[0] == {
        "collection_name": "documents",
        "points": points,
    }


def test_add_points_creates_missing_collection_before_upsert() -> None:
    vector_store = object.__new__(QdrantVectorStore)
    vector_store.collection_name = "documents"
    client = FakeQdrantClient(collection_exists=False)
    vector_store.client = client  # type: ignore[assignment]
    points = [models.PointStruct(id="first", vector=[0.1], payload={})]

    vector_store.add_points(points)

    assert len(client.create_calls) == 1
    assert len(client.upsert_calls) == 1
