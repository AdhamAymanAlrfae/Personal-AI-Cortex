import logging
from collections.abc import Sequence

from app.core.config import settings
from app.providers.vector_store.base import BaseVectorStore
from qdrant_client import QdrantClient, models

logger = logging.getLogger(__name__)


class QdrantVectorStore(BaseVectorStore[models.PointStruct, models.ScoredPoint]):
    def __init__(self):
        self.collection_name = settings.qdrant_collection_name
        self.client = QdrantClient(
            url=settings.qdrant_url, api_key=settings.qdrant_api_key.get_secret_value()
        )
        logger.info(
            "Initialized Qdrant vector store for collection %s", self.collection_name
        )

    def create_collection(self) -> None:
        if self.client.collection_exists(collection_name=self.collection_name):
            logger.info("Qdrant collection %s already exists", self.collection_name)
            return

        logger.info("Creating Qdrant collection %s", self.collection_name)
        self.client.create_collection(
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
        logger.info("Created Qdrant collection %s", self.collection_name)

    def recreate_collection(self) -> bool:
        existed = self.client.collection_exists(collection_name=self.collection_name)
        if existed:
            logger.warning("Deleting Qdrant collection %s", self.collection_name)
            self.client.delete_collection(collection_name=self.collection_name)

        self.create_collection()
        return existed

    def add_points(self, points: Sequence[models.PointStruct]) -> None:
        self.create_collection()  # TODO: Do i really need to chuck it every time.
        logger.debug(
            "Adding %d points into Qdrant collection %s",
            len(points),
            self.collection_name,
        )
        self.client.upsert(
            collection_name=self.collection_name,
            points=points,
        )
        logger.info(
            "Added %d points into Qdrant collection %s",
            len(points),
            self.collection_name,
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
        points = search_result.points
        logger.debug(
            "Dense search in Qdrant collection %s returned %d points "
            "(limit=%d, threshold=%s)",
            self.collection_name,
            len(points),
            limit,
            threshold,
        )
        return points

    def sparse_search(
        self,
        query_indices: list[int],
        query_values: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.5,
    ) -> list[models.ScoredPoint]:
        search_result = self.client.query_points(
            collection_name=self.collection_name,
            query=models.SparseVector(indices=query_indices, values=query_values),
            limit=limit,
            using="sparse_vector",
            score_threshold=threshold,
        )
        points = search_result.points
        logger.debug(
            "Sparse search in Qdrant collection %s returned %d points (limit=%d)",
            self.collection_name,
            len(points),
            limit,
        )
        return points

    def hybrid_search(
        self,
        dense_vector: list[float],
        sparse_indices: list[int],
        sparse_values: list[float],
        *,
        limit: int = 5,
        threshold: float = 0.5,
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
            score_threshold=threshold,
        )
        points = search_result.points
        logger.debug(
            "Hybrid search in Qdrant collection %s returned %d points (limit=%d)",
            self.collection_name,
            len(points),
            limit,
        )
        return points
