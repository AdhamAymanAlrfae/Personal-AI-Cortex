import logging
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

from langchain_core.documents import Document
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
    """Load, chunk, embed, and store documents using injected providers."""

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

    def ingest_files(self, file_paths: Sequence[str | Path]) -> list[IngestionResult]:
        """Chunk files individually, then embed and store all chunks in one batch."""
        paths = [Path(file_path) for file_path in file_paths]
        documents_loaded: list[int] = []
        chunks_by_file: list[list[Document]] = []
        for path in paths:
            logger.info("Starting ingestion for %s", path)
            documents = load_document(path)
            chunks = self._chunker.split_documents(documents)
            documents_loaded.append(len(documents))
            chunks_by_file.append(chunks)

        all_chunks = [chunk for chunks in chunks_by_file for chunk in chunks]

        if not all_chunks:
            logger.warning("No chunks created; skipping embedding and storage")
            return [
                IngestionResult(
                    source=str(path),
                    documents_loaded=document_count,
                    chunks_created=0,
                    points_added=0,
                )
                for path, document_count in zip(paths, documents_loaded, strict=True)
            ]

        texts = [chunk.page_content for chunk in all_chunks]
        dense_vectors = self._dense_embeddings.embed_documents(texts)
        sparse_vectors = self._sparse_embeddings.embed_documents(texts)
        points = build_qdrant_points(all_chunks, dense_vectors, sparse_vectors)
        self._vector_store.add_points(points)

        results: list[IngestionResult] = []
        for path, document_count, chunks in zip(
            paths, documents_loaded, chunks_by_file, strict=True
        ):
            result = IngestionResult(
                source=str(path),
                documents_loaded=document_count,
                chunks_created=len(chunks),
                points_added=len(chunks),
            )
            logger.info(
                "Completed ingestion for %s: %d documents, %d chunks, %d points",
                path,
                result.documents_loaded,
                result.chunks_created,
                result.points_added,
            )
            results.append(result)
        return results
