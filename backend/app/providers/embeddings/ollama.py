import logging

from app.core.config import settings
from app.providers.embeddings.base import BaseEmbeddingProvider

logger = logging.getLogger(__name__)


class OllamaEmbeddingProvider(BaseEmbeddingProvider):
    """Embeddings provider that uses the Ollama API."""

    def __init__(
        self, model: str = settings.embed_model, *, base_url: str | None = None
    ) -> None:
        logger.info("Loading Ollama embedding model %s", model)
        from langchain_ollama import OllamaEmbeddings

        self._embeddings = OllamaEmbeddings(model=model, base_url=base_url)
        logger.info("Loaded Ollama embedding model %s", model)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        logger.debug("Generating embeddings for %d documents", len(texts))
        embeddings = self._embeddings.embed_documents(texts)
        logger.debug("Generated embeddings for %d documents", len(embeddings))
        return embeddings

    def embed_query(self, text: str) -> list[float]:
        logger.debug("Generating embedding for query")
        embedding = self._embeddings.embed_query(text)
        logger.debug("Generated embedding for query")
        return embedding
