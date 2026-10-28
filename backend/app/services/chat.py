import logging
import re
from collections.abc import Sequence
from pathlib import PurePath
from typing import Any

from langchain_core.messages import BaseMessage
from langfuse import propagate_attributes
from qdrant_client import models

from app.core.config import settings
from app.providers.llm.base import BaseLLMProvider
from app.providers.llm.langfuse_client import get_langfuse_client
from app.providers.llm.prompt import LLMPromptHandler
from app.schemas.chat import ChatResponse, ChatSource
from app.services.retrieval import DocumentRetrievalService

logger = logging.getLogger(__name__)


class ChatService:
    """Run retrieval-augmented generation for a user question."""

    def __init__(
        self,
        retrieval: DocumentRetrievalService,
        llm: BaseLLMProvider,
        prompt_handler: LLMPromptHandler,
    ) -> None:
        self._retrieval = retrieval
        self._llm = llm
        self._prompt_handler = prompt_handler

    def answer(
        self,
        question: str,
    ) -> ChatResponse:
        """Retrieve evidence, build a prompt, invoke the LLM, and return citations."""
        if not question.strip():
            raise ValueError("Chat question must not be empty.")

        langfuse = get_langfuse_client()
        if langfuse is None:
            return self._answer(question)

        with langfuse.start_as_current_observation(
            as_type="span",
            name="chat",
            input={"question": question},
        ) as root_observation:
            with propagate_attributes(
                trace_name="chat",
                environment=settings.app_env,
            ):
                response = self._answer(
                    question,
                )
            root_observation.update(output={"answer": response.answer})
            return response

    def _answer(
        self,
        question: str,
    ) -> ChatResponse:
        points = self._retrieval.retrieve(
            question,
            mode=settings.retrieval_mode,
        )
        sources = self._build_sources(points)
        context = self._format_context(sources)
        messages: Sequence[BaseMessage] = self._prompt_handler.build_messages(
            question=question,
            context=context,
        )
        response = self._llm.invoke(messages)
        if not isinstance(response.content, str):
            raise TypeError("The LLM provider returned a non-text answer.")
        answer = self._remove_unretrieved_citations(response.content, sources)
        cited_citations = set(re.findall(r"\[(S\d+)\]", answer))
        cited_sources = [
            source for source in sources if source.citation in cited_citations
        ]

        logger.info(
            "Answered chat question citing %d of %d retrieved sources",
            len(cited_sources),
            len(sources),
        )
        return ChatResponse(answer=answer, sources=cited_sources)

    @staticmethod
    def _remove_unretrieved_citations(
        answer: str,
        sources: Sequence[ChatSource],
    ) -> str:
        valid_citations = {source.citation for source in sources}
        removed_citations: set[str] = set()

        def keep_retrieved_citation(match: re.Match[str]) -> str:
            citation = match.group("citation")
            if citation in valid_citations:
                return f"{match.group('prefix')}[{citation}]"
            removed_citations.add(f"[{citation}]")
            return ""

        validated_answer = re.sub(
            r"(?P<prefix>[ \t]*)[【\[](?P<citation>S\d+)[】\]]",
            keep_retrieved_citation,
            answer,
        )
        for citation in sorted(removed_citations):
            logger.warning("Removed citation to an unretrieved source: %s", citation)
        return validated_answer

    @staticmethod
    def _build_sources(points: Sequence[models.ScoredPoint]) -> list[ChatSource]:
        sources: list[ChatSource] = []
        for citation_number, point in enumerate(points, start=1):
            payload = point.payload
            if not isinstance(payload, dict):
                raise TypeError(f"Retrieved point {point.id} has no payload.")

            content = payload.get("page_content")
            metadata: Any = payload.get("metadata")
            if not isinstance(content, str) or not isinstance(metadata, dict):
                raise TypeError(
                    f"Retrieved point {point.id} has invalid document content or metadata."
                )

            path = metadata.get("source")
            if not isinstance(path, str) or not path:
                raise ValueError(f"Retrieved point {point.id} has no source path.")

            page = metadata.get("page")
            if page is not None and (
                not isinstance(page, int) or isinstance(page, bool)
            ):
                raise ValueError(f"Retrieved point {point.id} has an invalid page.")
            header_path = metadata.get("header_path")
            if header_path is not None and not isinstance(header_path, str):
                raise ValueError(f"Retrieved point {point.id} has an invalid header.")

            sources.append(
                ChatSource(
                    citation=f"S{citation_number}",
                    source=PurePath(path).name,
                    path=path,
                    page=page + 1 if page is not None else None,
                    header_path=header_path,
                    score=point.score,
                    content=content,
                )
            )
        return sources

    @staticmethod
    def _format_context(sources: Sequence[ChatSource]) -> str:
        if not sources:
            return "No relevant source chunks were found."

        source_context = "\n\n".join(
            f"[{source.citation}] Source: {source.source}"
            + (f", page {source.page}" if source.page is not None else "")
            + (f", section {source.header_path}" if source.header_path else "")
            + f"\n{source.content}"
            for source in sources
        )
        return (
            "Cite supporting facts with the provided source labels, "
            "such as [S1]. Do not invent citations.\n\n"
            f"{source_context}"
        )
