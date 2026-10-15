import logging
from collections.abc import Sequence
from uuid import NAMESPACE_URL, uuid5

from app.providers.embeddings.sparse_base import SparseVectorEmbedding
from langchain_core.documents import Document
from qdrant_client import models

logger = logging.getLogger(__name__)


def build_qdrant_points(
    documents: Sequence[Document],
    dense_vectors: Sequence[Sequence[float]],
    sparse_vectors: Sequence[SparseVectorEmbedding],
) -> list[models.PointStruct]:
    """Build Qdrant points from chunks and their aligned dense and sparse vectors."""
    document_count = len(documents)
    if len(dense_vectors) != document_count or len(sparse_vectors) != document_count:
        raise ValueError(
            "Documents, dense vectors, and sparse vectors must have matching "
            f"lengths; got {document_count}, {len(dense_vectors)}, "
            f"and {len(sparse_vectors)}."
        )

    points: list[models.PointStruct] = []
    point_ids: set[str] = set()
    for document, dense_vector, sparse_vector in zip(
        documents, dense_vectors, sparse_vectors, strict=True
    ):
        source = document.metadata.get("source")
        chunk_index = document.metadata.get("chunk_index")
        if not isinstance(source, str) or not source:
            raise ValueError(
                "Each chunk must have a non-empty 'source' metadata value."
            )
        if chunk_index is None:
            raise ValueError(
                "Each chunk must have an integer 'chunk_index' metadata value."
            )
        if not isinstance(chunk_index, int) or isinstance(chunk_index, bool):
            raise TypeError(
                "Each chunk's 'chunk_index' metadata value must be an integer."
            )
        if len(sparse_vector.indices) != len(sparse_vector.values):
            raise ValueError(
                "Sparse vector indices and values must have matching lengths."
            )

        page = document.metadata.get("page", "")
        point_id = str(uuid5(NAMESPACE_URL, f"{source}\0{page}\0{chunk_index}"))
        if point_id in point_ids:
            raise ValueError(
                "Chunks must have unique source, page, and chunk_index metadata."
            )
        point_ids.add(point_id)

        points.append(
            models.PointStruct(
                id=point_id,
                vector={
                    "dense_vector": list(dense_vector),
                    "sparse_vector": models.SparseVector(
                        indices=sparse_vector.indices,
                        values=sparse_vector.values,
                    ),
                },
                payload={
                    "page_content": document.page_content,
                    "metadata": dict(document.metadata),
                },
            )
        )

    logger.debug("Built %d Qdrant points", len(points))
    return points
