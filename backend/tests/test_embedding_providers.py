import sys
from types import ModuleType
from typing import Any

import pytest

from app.providers.embeddings import (
    BaseEmbeddingProvider,
    OllamaEmbeddingProvider,
)


def test_base_embedding_provider_defines_embedding_contract() -> None:
    with pytest.raises(TypeError):
        BaseEmbeddingProvider()


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
