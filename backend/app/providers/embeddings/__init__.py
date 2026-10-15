"""Interchangeable embedding providers for documents and queries."""

from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.ollama import OllamaEmbeddingProvider

__all__ = [
    "BaseEmbeddingProvider",
    "OllamaEmbeddingProvider",
]
