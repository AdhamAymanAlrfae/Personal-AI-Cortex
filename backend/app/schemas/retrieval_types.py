from enum import Enum


class RetrievalMode(str, Enum):
    """Vector search strategy used to retrieve relevant chunks."""

    DENSE = "dense"
    SPARSE = "sparse"
    HYBRID = "hybrid"
