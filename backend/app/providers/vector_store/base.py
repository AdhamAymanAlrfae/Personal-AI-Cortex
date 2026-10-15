from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import Generic, TypeVar

PointType = TypeVar("PointType")
PointScore = TypeVar("PointScore")


class BaseVectorStore(ABC, Generic[PointType, PointScore]):
    """Interface for vector storage and retrieval."""

    @abstractmethod
    def add_points(
        self,
        points: Sequence[PointType],
    ) -> None:
        """Insert or update points in the vector store."""
        ...

    @abstractmethod
    def dense_search(
        self,
        query_vector: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.7,
        # filters: dict[str, Any] | None = None, TODO: Implement filtering for dense search
    ) -> list[PointScore]:
        """Search using dense vector similarity."""
        ...

    @abstractmethod
    def sparse_search(
        self,
        query_indices: list[int],
        query_values: list[float],
        *,
        limit: int = 5,
        # filters: dict[str, Any] | None = None, TODO: Implement filtering for sparse search
    ) -> list[PointScore]:
        """Search using sparse vector similarity."""
        ...

    @abstractmethod
    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
        *,
        limit: int = 5,
        # filters: dict[str, Any] | None = None, TODO: Implement filtering for hybrid search
    ) -> list[PointScore]:
        """Combine dense and sparse search results."""
        ...
