from app.core.config import settings
from app.providers.embeddings.base import BaseEmbeddingProvider


class OllamaEmbeddingProvider(BaseEmbeddingProvider):
    """Embeddings provider that uses the Ollama API."""

    def __init__(
        self, model: str = settings.embed_model, *, base_url: str | None = None
    ) -> None:
        from langchain_ollama import OllamaEmbeddings

        self._embeddings = OllamaEmbeddings(model=model, base_url=base_url)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._embeddings.embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self._embeddings.embed_query(text)
