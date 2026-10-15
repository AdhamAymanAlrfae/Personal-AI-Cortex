from uuid import UUID

import pytest
from app.providers.embeddings.sparse_base import SparseVectorEmbedding
from app.providers.vector_store.qdrant.point_builder import build_qdrant_points
from langchain_core.documents import Document


def test_build_qdrant_points_maps_chunks_and_vectors() -> None:
    documents = [
        Document(
            page_content="Chunk one",
            metadata={"source": "notes.md", "chunk_index": 0, "category": "notes"},
        ),
        Document(
            page_content="Chunk two",
            metadata={"source": "notes.md", "chunk_index": 1, "category": "notes"},
        ),
    ]
    dense_vectors = [[0.1, 0.2], [0.3, 0.4]]
    sparse_vectors = [
        SparseVectorEmbedding(indices=[1, 3], values=[0.25, 0.75]),
        SparseVectorEmbedding(indices=[2], values=[1.0]),
    ]

    points = build_qdrant_points(documents, dense_vectors, sparse_vectors)

    assert len(points) == 2
    assert all(UUID(point.id) for point in points)
    assert points[0].vector["dense_vector"] == dense_vectors[0]
    sparse_vector = points[0].vector["sparse_vector"]
    assert sparse_vector.indices == [1, 3]
    assert sparse_vector.values == [0.25, 0.75]
    assert points[0].payload == {
        "page_content": "Chunk one",
        "metadata": documents[0].metadata,
    }
    assert points[1].payload["page_content"] == "Chunk two"


def test_build_qdrant_points_generates_stable_distinct_ids() -> None:
    document = Document(
        page_content="Chunk",
        metadata={"source": "notes.md", "chunk_index": 0},
    )
    vectors = [[0.1]]
    sparse_vectors = [SparseVectorEmbedding(indices=[1], values=[1.0])]

    first = build_qdrant_points([document], vectors, sparse_vectors)
    second = build_qdrant_points([document], vectors, sparse_vectors)

    assert first[0].id == second[0].id

    second_chunk = Document(
        page_content="Another chunk",
        metadata={"source": "notes.md", "chunk_index": 1},
    )
    distinct = build_qdrant_points(
        [document, second_chunk], vectors * 2, sparse_vectors * 2
    )
    assert distinct[0].id != distinct[1].id

    second_page = Document(
        page_content="Another page chunk",
        metadata={"source": "notes.pdf", "page": 1, "chunk_index": 0},
    )
    first_page = Document(
        page_content="First page chunk",
        metadata={"source": "notes.pdf", "page": 0, "chunk_index": 0},
    )
    page_points = build_qdrant_points(
        [first_page, second_page], vectors * 2, sparse_vectors * 2
    )
    assert page_points[0].id != page_points[1].id


def test_build_qdrant_points_rejects_misaligned_embeddings() -> None:
    document = Document(
        page_content="Chunk",
        metadata={"source": "notes.md", "chunk_index": 0},
    )

    with pytest.raises(ValueError, match="matching lengths"):
        build_qdrant_points(
            [document],
            [],
            [SparseVectorEmbedding(indices=[], values=[])],
        )


@pytest.mark.parametrize(
    ("metadata", "message"),
    [
        ({"chunk_index": 0}, "source"),
        ({"source": "notes.md"}, "chunk_index"),
    ],
)
def test_build_qdrant_points_requires_stable_chunk_identity(
    metadata: dict[str, object], message: str
) -> None:
    document = Document(page_content="Chunk", metadata=metadata)

    with pytest.raises(ValueError, match=message):
        build_qdrant_points(
            [document],
            [[0.1]],
            [SparseVectorEmbedding(indices=[], values=[])],
        )


def test_build_qdrant_points_rejects_malformed_sparse_vectors() -> None:
    document = Document(
        page_content="Chunk",
        metadata={"source": "notes.md", "chunk_index": 0},
    )

    with pytest.raises(ValueError, match="indices and values"):
        build_qdrant_points(
            [document],
            [[0.1]],
            [SparseVectorEmbedding(indices=[1], values=[])],
        )


def test_build_qdrant_points_rejects_duplicate_chunk_identity() -> None:
    document = Document(
        page_content="Chunk",
        metadata={"source": "notes.md", "chunk_index": 0},
    )

    with pytest.raises(ValueError, match="unique source, page, and chunk_index"):
        build_qdrant_points(
            [document, document],
            [[0.1], [0.2]],
            [
                SparseVectorEmbedding(indices=[], values=[]),
                SparseVectorEmbedding(indices=[], values=[]),
            ],
        )
