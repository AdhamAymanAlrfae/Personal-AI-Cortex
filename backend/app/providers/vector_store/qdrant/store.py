import logging
from collections.abc import Sequence

from app.core.config import settings
from app.providers.vector_store.base import BaseVectorStore
from qdrant_client import QdrantClient, models

logger = logging.getLogger(__name__)

logger.info("init")


class QdrantVectorStore(BaseVectorStore[models.PointStruct, models.ScoredPoint]):
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.client = QdrantClient(
            url=settings.qdrant_url, api_key=settings.qdrant_api_key.get_secret_value()
        )

    def create_collection(self) -> None:
        self.client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config={
                "dense_vector": models.VectorParams(
                    size=settings.embed_dim,
                    distance=models.Distance.COSINE,
                )
            },
            sparse_vectors_config={
                "sparse_vector": models.SparseVectorParams(modifier=models.Modifier.IDF)
            },
        )

    def add_points(self, points: Sequence[models.PointStruct]) -> None:
        self.client.upsert(
            collection_name=self.collection_name,
            points=points,
        )

    def dense_search(
        self, query_vector: list[float], *, limit: int = 5, threshold: float = 0.7
    ) -> list[models.ScoredPoint]:

        search_result = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit,
            using="dense_vector",
            threshold=threshold,
        )
        return search_result.points

    def sparse_search(
        self,
        query_indices: list[int],
        query_values: list[float],
        *,
        limit: int = 5,
    ) -> list[models.ScoredPoint]:

        search_result = self.client.query_points(
            collection_name=self.collection_name,
            query=models.SparseVector(indices=query_indices, values=query_values),
            limit=limit,
            using="sparse_vector",
        )
        return search_result.points

    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
        *,
        limit: int = 5,
    ) -> list[models.ScoredPoint]:

        search_result = self.client.query_points(
            collection_name=self.collection_name,
            prefetch=[
                models.Prefetch(
                    query=models.SparseVector(
                        indices=sparse_indices, values=sparse_values
                    ),
                    limit=limit,
                    using="sparse_vector",
                ),
                models.Prefetch(
                    query=dense_vector,
                    limit=limit,
                    using="dense_vector",
                ),
            ],
            query=models.FusionQuery(fusion=models.Fusion.RRF),
            limit=limit,
        )
        return search_result.points
