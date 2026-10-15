import sys
from collections.abc import Iterator
from types import ModuleType
from typing import Any

import pytest

from app.providers.embeddings import (
    BaseEmbeddingProvider,
    BaseSparseEmbeddingProvider,
    FastEmbedSparseEmbeddingProvider,
    OllamaEmbeddingProvider,
)


def test_base_embedding_provider_defines_embedding_contract() -> None:
    with pytest.raises(TypeError):
        BaseEmbeddingProvider()

    with pytest.raises(TypeError):
        BaseSparseEmbeddingProvider()


def test_ollama_provider_delegates_query_and_document_embeddings(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: dict[str, Any] = {}

    class FakeOllamaEmbeddings:
        def __init__(self, **kwargs: Any) -> None:
            calls["init"] = kwargs

        def embed_documents(self, texts: list[str]) -> list[list[float]]:
            calls["documents"] = texts
            return [[1.0] for _ in texts]

        def embed_query(self, text: str) -> list[float]:
            calls["query"] = text
            return [2.0]

    module = ModuleType("langchain_ollama")
    module.OllamaEmbeddings = FakeOllamaEmbeddings  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "langchain_ollama", module)

    embeddings = OllamaEmbeddingProvider("nomic-embed-text", base_url="http://ollama")

    assert embeddings.embed_documents(["chunk"]) == [[1.0]]
    assert embeddings.embed_query("question") == [2.0]
    assert calls == {
        "init": {"model": "nomic-embed-text", "base_url": "http://ollama"},
        "documents": ["chunk"],
        "query": "question",
    }


def test_fastembed_sparse_provider_converts_document_and_query_embeddings(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: dict[str, Any] = {}

    class FakeArray:
        def __init__(self, values: list[int] | list[float]) -> None:
            self._values = values

        def tolist(self) -> list[int] | list[float]:
            return self._values

    class FakeSparseEmbedding:
        indices = FakeArray([1, 3])
        values = FakeArray([0.25, 0.75])

    class FakeSparseTextEmbedding:
        def __init__(self, *, model_name: str) -> None:
            calls["init"] = model_name

        def embed(self, texts: list[str]) -> list[FakeSparseEmbedding]:
            calls["documents"] = texts
            return [FakeSparseEmbedding() for _ in texts]

        def query_embed(self, text: str) -> Iterator[FakeSparseEmbedding]:
            calls["query"] = text
            yield FakeSparseEmbedding()

    module = ModuleType("fastembed")
    module.SparseTextEmbedding = FakeSparseTextEmbedding  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "fastembed", module)

    embeddings = FastEmbedSparseEmbeddingProvider("Qdrant/bm25")

    documents = embeddings.embed_documents(["chunk"])
    query = embeddings.embed_query("question")

    assert documents[0].indices == [1, 3]
    assert documents[0].values == [0.25, 0.75]
    assert query.indices == [1, 3]
    assert query.values == [0.25, 0.75]
    assert calls == {
        "init": "Qdrant/bm25",
        "documents": ["chunk"],
        "query": "question",
    }
