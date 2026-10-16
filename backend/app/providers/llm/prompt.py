import logging

from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.providers.llm.langfuse_client import get_langfuse_client

logger = logging.getLogger(__name__)


def _default_fallback_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "You are a careful assistant. Answer using only the supplied "
                    "context. If the context does not contain the answer, say that "
                    "you do not have enough information. Cite supporting chunks "
                    "using their provided labels (for example, [S1]). Never invent "
                    "facts or citations."
                ),
            ),
            (
                "human",
                "Question:\n{question}\n\nRetrieved context:\n{context}",
            ),
        ]
    )


class LLMPromptHandler:
    """Load a chat prompt from Langfuse or use a local fallback prompt."""

    def __init__(
        self,
        *,
        fallback_prompt: ChatPromptTemplate | None = None,
    ) -> None:
        self._prompt = (
            fallback_prompt
            if fallback_prompt is not None
            else _default_fallback_prompt()
        )

        client = get_langfuse_client()
        if client is None:
            logger.warning(
                "Langfuse credentials are not configured; using the fallback prompt"
            )
            return

        prompt = client.get_prompt(settings.llm_prompt_name, type="chat")
        self._prompt = ChatPromptTemplate.from_messages(prompt.get_langchain_prompt())
        logger.info("Loaded chat prompt %s from Langfuse", settings.llm_prompt_name)

    def build_messages(self, **variables: object) -> list[BaseMessage]:
        """Format the selected prompt into ordered LangChain chat messages."""
        messages = self._prompt.format_messages(**variables)
        logger.debug("Built %d messages for the LLM", len(messages))
        return messages
