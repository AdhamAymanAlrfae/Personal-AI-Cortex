from collections.abc import Sequence
from pathlib import Path

import pytest
from app.api.routes import data
from app.main import app
from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.sparse_base import (
    BaseSparseEmbeddingProvider,
    SparseVectorEmbedding,
)
from app.providers.vector_store.base import BaseVectorStore
from fastapi.testclient import TestClient
from qdrant_client import models


class FakeDenseEmbeddings(BaseEmbeddingProvider):
    def __init__(self) -> None:
        self.calls: list[list[str]] = []

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        self.calls.append(texts)
        if any("fail ingestion" in text for text in texts):
            raise RuntimeError("simulated embedding failure")
        return [[0.1, 0.2] for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        raise NotImplementedError


class FakeSparseEmbeddings(BaseSparseEmbeddingProvider):
    def __init__(self) -> None:
        self.calls: list[list[str]] = []

    def embed_documents(self, texts: list[str]) -> list[SparseVectorEmbedding]:
        self.calls.append(texts)
        return [SparseVectorEmbedding(indices=[1], values=[0.5]) for _ in texts]

    def embed_query(self, text: str) -> SparseVectorEmbedding:
        raise NotImplementedError


class FakeVectorStore(BaseVectorStore[models.PointStruct, models.ScoredPoint]):
    def __init__(self) -> None:
        self.points: list[models.PointStruct] = []
        self.add_calls: list[list[models.PointStruct]] = []

    def add_points(self, points: Sequence[models.PointStruct]) -> None:
        batch = list(points)
        self.add_calls.append(batch)
        self.points.extend(batch)

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
        threshold: float = 0.5,
    ) -> list[models.ScoredPoint]:
        raise NotImplementedError

    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.5,
    ) -> list[models.ScoredPoint]:
        raise NotImplementedError


@pytest.fixture
def fake_components() -> data.IngestionComponents:
    return data.IngestionComponents(
        dense_embeddings=FakeDenseEmbeddings(),
        sparse_embeddings=FakeSparseEmbeddings(),
        vector_store=FakeVectorStore(),
    )


@pytest.fixture
def client(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    fake_components: data.IngestionComponents,
) -> TestClient:
    monkeypatch.setattr(data, "RAW_DATA_DIR", tmp_path)
    monkeypatch.setattr(data, "get_ingestion_components", lambda: fake_components)
    return TestClient(app)


def test_upload_multiple_files_saves_without_ingesting(
    client: TestClient,
    fake_components: data.IngestionComponents,
) -> None:
    response = client.post(
        "/data/upload",
        files=[
            (
                "files",
                (
                    "guide.md",
                    b"# Guide\n## Details\nSome useful details.",
                    "text/markdown",
                ),
            ),
            ("files", ("notes.txt", b"Some text notes.", "text/plain")),
        ],
    )

    assert response.status_code == 201
    results = response.json()["files"]
    assert [result["filename"] for result in results] == ["guide.md", "notes.txt"]
    assert [result["status"] for result in results] == ["uploaded", "uploaded"]
    assert all(result["points_added"] is None for result in results)
    assert len(fake_components.dense_embeddings.calls) == 0
    assert len(fake_components.sparse_embeddings.calls) == 0
    store = fake_components.vector_store
    assert isinstance(store, FakeVectorStore)
    assert store.points == []
    assert store.add_calls == []


def test_ingest_uploads_separately_and_adds_points_to_store(
    client: TestClient,
    fake_components: data.IngestionComponents,
) -> None:
    upload_response = client.post(
        "/data/upload",
        files=[
            (
                "files",
                (
                    "guide.md",
                    b"# Guide\n## Details\nSome useful details.",
                    "text/markdown",
                ),
            ),
            ("files", ("notes.txt", b"Some text notes.", "text/plain")),
        ],
    )
    assert upload_response.status_code == 201

    response = client.post("/data/ingest")

    assert response.status_code == 200
    results = response.json()["files"]
    assert [result["filename"] for result in results] == ["guide.md", "notes.txt"]
    assert [result["status"] for result in results] == ["ingested", "ingested"]
    assert all(result["points_added"] > 0 for result in results)
    store = fake_components.vector_store
    assert isinstance(store, FakeVectorStore)
    assert len(store.points) == 2
    assert len(store.add_calls) == 1
    assert len(fake_components.dense_embeddings.calls) == 1
    assert len(fake_components.sparse_embeddings.calls) == 1


def test_upload_rejects_invalid_batch_before_saving_any_file(
    client: TestClient,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def unexpected_provider_initialization() -> data.IngestionComponents:
        raise AssertionError("invalid uploads must be rejected before initialization")

    monkeypatch.setattr(
        data, "get_ingestion_components", unexpected_provider_initialization
    )
    response = client.post(
        "/data/upload",
        files=[
            ("files", ("valid.txt", b"Valid text.", "text/plain")),
            (
                "files",
                ("unsupported.exe", b"Not supported.", "application/octet-stream"),
            ),
        ],
    )

    assert response.status_code == 415
    assert not list(tmp_path.iterdir())


def test_upload_reports_shared_batch_ingestion_failure(
    client: TestClient,
    fake_components: data.IngestionComponents,
) -> None:
    upload_response = client.post(
        "/data/upload",
        files=[
            ("files", ("bad.txt", b"fail ingestion", "text/plain")),
            ("files", ("good.txt", b"Successful content.", "text/plain")),
        ],
    )
    assert upload_response.status_code == 201

    response = client.post("/data/ingest")

    assert response.status_code == 207
    results = response.json()["files"]
    assert [result["status"] for result in results] == [
        "ingestion_failed",
        "ingestion_failed",
    ]
    assert results[0]["error"] == "Ingestion failed. See backend logs for details."
    assert results[1]["error"] == "Ingestion failed. See backend logs for details."
    assert len(fake_components.dense_embeddings.calls) == 1
    store = fake_components.vector_store
    assert isinstance(store, FakeVectorStore)
    assert store.points == []


def test_ingest_empty_raw_directory_returns_empty_without_initializing_providers(
    client: TestClient,
    fake_components: data.IngestionComponents,
) -> None:
    response = client.post("/data/ingest")

    assert response.status_code == 200
    assert response.json() == {"files": []}
    assert fake_components.dense_embeddings.calls == []
    assert fake_components.sparse_embeddings.calls == []


def test_ingest_can_recreate_collection_before_ingesting_files(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    fake_components: data.IngestionComponents,
) -> None:
    class FakeCollectionManager:
        collection_name = "personal-ai-cortex"

        def __init__(self) -> None:
            self.recreate_calls = 0

        def recreate_collection(self) -> bool:
            self.recreate_calls += 1
            return True

    manager = FakeCollectionManager()
    monkeypatch.setattr(data, "QdrantVectorStore", lambda _: manager)
    upload_response = client.post(
        "/data/upload",
        files=[("files", ("notes.txt", b"Some text notes.", "text/plain"))],
    )
    assert upload_response.status_code == 201

    response = client.post("/data/ingest?recreate_collection=true")

    assert response.status_code == 200
    assert manager.recreate_calls == 1
    assert response.json()["files"][0]["status"] == "ingested"
    store = fake_components.vector_store
    assert isinstance(store, FakeVectorStore)
    assert len(store.points) == 1


def test_upload_rejects_duplicate_names_within_batch(
    client: TestClient,
    tmp_path: Path,
) -> None:
    response = client.post(
        "/data/upload",
        files=[
            ("files", ("notes.txt", b"First.", "text/plain")),
            ("files", ("NOTES.TXT", b"Second.", "text/plain")),
        ],
    )

    assert response.status_code == 409
    assert not list(tmp_path.iterdir())


def test_upload_openapi_schema_declares_file_picker_items() -> None:
    schema = app.openapi()
    upload_schema = schema["paths"]["/data/upload"]["post"]["requestBody"]["content"][
        "multipart/form-data"
    ]["schema"]

    if "$ref" in upload_schema:
        upload_schema = schema["components"]["schemas"][
            upload_schema["$ref"].rsplit("/", 1)[-1]
        ]

    assert upload_schema["properties"]["files"]["type"] == "array"
    assert upload_schema["properties"]["files"]["items"] == {
        "type": "string",
        "format": "binary",
    }


def test_ingest_openapi_schema_has_no_request_body() -> None:
    schema = app.openapi()

    assert "requestBody" not in schema["paths"]["/data/ingest"]["post"]
    assert any(
        parameter["name"] == "recreate_collection" and parameter["in"] == "query"
        for parameter in schema["paths"]["/data/ingest"]["post"]["parameters"]
    )
    assert "/data/recreate-collection" not in schema["paths"]
