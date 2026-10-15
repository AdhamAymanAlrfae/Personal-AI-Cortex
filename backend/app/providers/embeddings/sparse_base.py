from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class SparseVectorEmbedding:
    """Backend-neutral sparse vector representation."""

    indices: list[int]
    values: list[float]


class BaseSparseEmbeddingProvider(ABC):
    """Interface for providers that create sparse document and query embeddings."""

    @abstractmethod
    def embed_documents(self, texts: list[str]) -> list[SparseVectorEmbedding]:
        """Embed multiple document texts, preserving their input order."""
        raise NotImplementedError

    @abstractmethod
    def embed_query(self, text: str) -> SparseVectorEmbedding:
        """Embed a single search query."""
        raise NotImplementedError
