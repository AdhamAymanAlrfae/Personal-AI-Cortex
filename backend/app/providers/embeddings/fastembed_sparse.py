import logging

from app.core.config import settings
from app.providers.embeddings.sparse_base import (
    BaseSparseEmbeddingProvider,
    SparseVectorEmbedding,
)

logger = logging.getLogger(__name__)


class FastEmbedSparseEmbeddingProvider(BaseSparseEmbeddingProvider):
    """Sparse embedding provider backed by FastEmbed."""

    def __init__(self, model: str = settings.sparse_model) -> None:
        from fastembed import SparseTextEmbedding

        self._embeddings = SparseTextEmbedding(model_name=model)

    def embed_documents(self, texts: list[str]) -> list[SparseVectorEmbedding]:
        return [self._convert_embedding(item) for item in self._embeddings.embed(texts)]

    def embed_query(self, text: str) -> SparseVectorEmbedding:
        embedding = next(iter(self._embeddings.query_embed(text)))
        return self._convert_embedding(embedding)

    @staticmethod
    def _convert_embedding(embedding) -> SparseVectorEmbedding:
        return SparseVectorEmbedding(
            indices=embedding.indices.tolist(),
            values=embedding.values.tolist(),
        )
