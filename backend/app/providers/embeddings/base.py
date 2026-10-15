from abc import ABC, abstractmethod

from langchain_core.embeddings import Embeddings


class BaseEmbeddingProvider(Embeddings, ABC):
    """Interface for providers that embed document text and search queries."""

    @abstractmethod
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple document texts, preserving their input order."""
        raise NotImplementedError

    @abstractmethod
    def embed_query(self, text: str) -> list[float]:
        """Embed a single search query."""
        raise NotImplementedError
