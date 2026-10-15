import logging
from dataclasses import dataclass
from pathlib import Path

from qdrant_client import models

from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.sparse_base import BaseSparseEmbeddingProvider
from app.providers.ingestion.chunking.base import BaseChunker
from app.providers.ingestion.loaders.loader import load_document
from app.providers.vector_store.base import BaseVectorStore
from app.providers.vector_store.qdrant.point_builder import build_qdrant_points

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class IngestionResult:
    """Counts produced by ingesting one source file."""

    source: str
    documents_loaded: int
    chunks_created: int
    points_added: int


class DocumentIngestionService:
    """Load, chunk, embed, and store a document using injected providers."""

    def __init__(
        self,
        dense_embeddings: BaseEmbeddingProvider,
        sparse_embeddings: BaseSparseEmbeddingProvider,
        vector_store: BaseVectorStore[models.PointStruct, models.ScoredPoint],
        chunker: BaseChunker,
    ) -> None:
        self._dense_embeddings = dense_embeddings
        self._sparse_embeddings = sparse_embeddings
        self._vector_store = vector_store
        self._chunker = chunker

    def ingest_file(self, file_path: str | Path) -> IngestionResult:
        """Ingest one supported file and upsert its chunks into the vector store."""
        path = Path(file_path)
        logger.info("Starting ingestion for %s", path)

        documents = load_document(path)
        chunks = self._chunker.split_documents(documents)
        if not chunks:
            logger.info(
                "No chunks created for %s; skipping embedding and storage", path
            )
            return IngestionResult(
                source=str(path),
                documents_loaded=len(documents),
                chunks_created=0,
                points_added=0,
            )

        texts = [chunk.page_content for chunk in chunks]
        dense_vectors = self._dense_embeddings.embed_documents(texts)
        sparse_vectors = self._sparse_embeddings.embed_documents(texts)
        points = build_qdrant_points(chunks, dense_vectors, sparse_vectors)
        self._vector_store.add_points(points)

        result = IngestionResult(
            source=str(path),
            documents_loaded=len(documents),
            chunks_created=len(chunks),
            points_added=len(points),
        )
        logger.info(
            "Completed ingestion for %s: %d documents, %d chunks, %d points",
            path,
            result.documents_loaded,
            result.chunks_created,
            result.points_added,
        )
        return result
