from abc import ABC, abstractmethod
from collections.abc import Sequence

from langchain_core.documents import Document


class BaseChunker(ABC):
    """Interface for interchangeable document chunking strategies."""

    @abstractmethod
    def split_documents(self, documents: Sequence[Document]) -> list[Document]:
        """Split documents into smaller documents."""
        raise NotImplementedError
