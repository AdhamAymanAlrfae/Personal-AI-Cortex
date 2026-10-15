"""Interchangeable embedding providers for documents and queries."""

from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.fastembed_sparse import FastEmbedSparseEmbeddingProvider
from app.providers.embeddings.ollama import OllamaEmbeddingProvider
from app.providers.embeddings.sparse_base import (
    BaseSparseEmbeddingProvider,
    SparseVectorEmbedding,
)

__all__ = [
    "BaseEmbeddingProvider",
    "BaseSparseEmbeddingProvider",
    "FastEmbedSparseEmbeddingProvider",
    "OllamaEmbeddingProvider",
    "SparseVectorEmbedding",
]
