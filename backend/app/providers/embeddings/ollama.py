import logging

from app.core.config import settings
from app.providers.embeddings.base import BaseEmbeddingProvider

logger = logging.getLogger(__name__)


class OllamaEmbeddingProvider(BaseEmbeddingProvider):
    """Embeddings provider that uses the Ollama API."""

    def __init__(self) -> None:
        logger.info("Loading Ollama embedding model %s", settings.embed_model)

        from langchain_ollama import OllamaEmbeddings

        self._embeddings = OllamaEmbeddings(
            model=settings.embed_model, base_url=settings.embed_base_url
        )

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        logger.debug("Generating embeddings for %d documents", len(texts))
        embeddings = self._embeddings.embed_documents(texts)
        return embeddings

    def embed_query(self, text: str) -> list[float]:
        logger.info("Generating embedding for query")
        embedding = self._embeddings.embed_query(text)
        return embedding
