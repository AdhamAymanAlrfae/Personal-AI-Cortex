import logging
from enum import Enum

from qdrant_client import models

from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.sparse_base import BaseSparseEmbeddingProvider
from app.providers.vector_store.base import BaseVectorStore

logger = logging.getLogger(__name__)


class RetrievalMode(str, Enum):
    """Vector search strategy used to retrieve relevant chunks."""

    DENSE = "dense"
    SPARSE = "sparse"
    HYBRID = "hybrid"


class DocumentRetrievalService:
    """Embed a query and retrieve matching points from a vector store."""

    def __init__(
        self,
        dense_embeddings: BaseEmbeddingProvider,
        sparse_embeddings: BaseSparseEmbeddingProvider,
        vector_store: BaseVectorStore[models.PointStruct, models.ScoredPoint],
    ) -> None:
        self._dense_embeddings = dense_embeddings
        self._sparse_embeddings = sparse_embeddings
        self._vector_store = vector_store

    def retrieve(
        self,
        query: str,
        *,
        mode: RetrievalMode = RetrievalMode.HYBRID,
        limit: int = 5,
        threshold: float = 0.7,
    ) -> list[models.ScoredPoint]:
        """Return ranked points for a query using the selected search strategy."""
        if not query.strip():
            raise ValueError("Search query must not be empty.")
        if limit <= 0:
            raise ValueError("Search limit must be greater than zero.")

        logger.info("Retrieving up to %d points using %s search", limit, mode.value)
        if mode is RetrievalMode.DENSE:
            dense_vector = self._dense_embeddings.embed_query(query)
            return self._vector_store.dense_search(
                dense_vector,
                limit=limit,
                threshold=threshold,
            )
        if mode is RetrievalMode.SPARSE:
            sparse_vector = self._sparse_embeddings.embed_query(query)
            return self._vector_store.sparse_search(
                sparse_vector.indices,
                sparse_vector.values,
                limit=limit,
                threshold=threshold,
            )

        dense_vector = self._dense_embeddings.embed_query(query)
        sparse_vector = self._sparse_embeddings.embed_query(query)
        return self._vector_store.hybrid_search(
            dense_vector,
            sparse_vector.indices,
            sparse_vector.values,
            limit=limit,
            threshold=threshold,
        )
