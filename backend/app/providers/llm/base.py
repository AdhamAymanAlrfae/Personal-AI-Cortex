from abc import ABC, abstractmethod
from collections.abc import Sequence

from langchain_core.messages import AIMessage, BaseMessage


class BaseLLMProvider(ABC):
    """Interface for chat language model providers."""

    @abstractmethod
    def invoke(self, messages: Sequence[BaseMessage]) -> AIMessage:
        """Generate a response to a conversation, preserving message order."""
        raise NotImplementedError
