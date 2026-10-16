from collections.abc import Sequence
from typing import cast

import pytest
from langchain_core.messages import AIMessage, BaseMessage
from qdrant_client import models

from app.providers.llm.base import BaseLLMProvider
from app.providers.llm.prompt import LLMPromptHandler
from app.schemas.chat import ChatSource
from app.services.chat import ChatService
from app.services.retrieval import DocumentRetrievalService, RetrievalMode


class FakeRetrieval:
    def __init__(self, points: list[models.ScoredPoint]) -> None:
        self.points = points
        self.calls: list[tuple[str, dict[str, object]]] = []

    def retrieve(
        self,
        query: str,
        *,
        mode: RetrievalMode,
        limit: int,
        threshold: float,
    ) -> list[models.ScoredPoint]:
        self.calls.append(
            (
                query,
                {"mode": mode, "limit": limit, "threshold": threshold},
            )
        )
        return self.points


class FakeLLM(BaseLLMProvider):
    def __init__(self, answer: str = "A cited answer [S1].") -> None:
        self.messages: Sequence[BaseMessage] = []
        self.answer = answer

    def invoke(self, messages: Sequence[BaseMessage]) -> AIMessage:
        self.messages = messages
        return AIMessage(content=self.answer)


class FakePromptHandler:
    def __init__(self) -> None:
        self.variables: dict[str, object] = {}

    def build_messages(self, **variables: object) -> list[BaseMessage]:
        self.variables = variables
        return [AIMessage(content=str(variables["context"]))]


def _point(
    *,
    content: str = "Relevant knowledge.",
    source: str = "data/raw/notes.md",
    page: int | None = None,
    header_path: str | None = None,
) -> models.ScoredPoint:
    metadata: dict[str, object] = {"source": source}
    if page is not None:
        metadata["page"] = page
    if header_path is not None:
        metadata["header_path"] = header_path
    return models.ScoredPoint(
        id="point-1",
        version=1,
        score=0.92,
        payload={"page_content": content, "metadata": metadata},
    )


def test_chat_service_retrieves_builds_prompt_invokes_llm_and_returns_citations() -> (
    None
):
    retrieval = FakeRetrieval([_point(page=2, header_path="Overview > Goals")])
    llm = FakeLLM()
    prompt_handler = FakePromptHandler()
    service = ChatService(
        cast(DocumentRetrievalService, retrieval),
        llm,
        cast(LLMPromptHandler, prompt_handler),
    )

    response = service.answer(
        "What are the goals?",
        limit=3,
        threshold=0.42,
        mode=RetrievalMode.DENSE,
    )

    assert retrieval.calls == [
        (
            "What are the goals?",
            {"mode": RetrievalMode.DENSE, "limit": 3, "threshold": 0.42},
        )
    ]
    assert prompt_handler.variables == {
        "question": "What are the goals?",
        "context": (
            "Cite supporting facts with the provided source labels, "
            "such as [S1]. Do not invent citations.\n\n"
            "[S1] Source: notes.md, page 3, section Overview > Goals\n"
            "Relevant knowledge."
        ),
    }
    prompt_context = prompt_handler.variables["context"]
    assert isinstance(prompt_context, str)
    assert llm.messages == [AIMessage(content=prompt_context)]
    assert response.answer == "A cited answer [S1]."
    assert response.sources == [
        ChatSource(
            citation="S1",
            source="notes.md",
            path="data/raw/notes.md",
            page=3,
            header_path="Overview > Goals",
            score=0.92,
            content="Relevant knowledge.",
        )
    ]


def test_chat_service_handles_no_retrieved_sources() -> None:
    prompt_handler = FakePromptHandler()
    service = ChatService(
        cast(DocumentRetrievalService, FakeRetrieval([])),
        FakeLLM(),
        cast(LLMPromptHandler, prompt_handler),
    )

    response = service.answer("Unknown question")

    assert (
        prompt_handler.variables["context"] == "No relevant source chunks were found."
    )
    assert response.sources == []


def test_chat_service_removes_citations_to_unretrieved_sources() -> None:
    service = ChatService(
        cast(DocumentRetrievalService, FakeRetrieval([_point()])),
        FakeLLM(
            "Supported [S1], unsupported [S2], hallucinated [S25] "
            "and legacy-style 【S26】."
        ),
        cast(LLMPromptHandler, FakePromptHandler()),
    )

    response = service.answer("Question")

    assert response.answer == (
        "Supported [S1], unsupported, hallucinated and legacy-style."
    )


def test_chat_service_removes_citations_when_no_sources_were_retrieved() -> None:
    service = ChatService(
        cast(DocumentRetrievalService, FakeRetrieval([])),
        FakeLLM("Unsupported [S1]."),
        cast(LLMPromptHandler, FakePromptHandler()),
    )

    response = service.answer("Unknown question")

    assert response.answer == "Unsupported."


def test_chat_service_returns_only_sources_cited_in_the_answer() -> None:
    points = [
        _point(content=f"Evidence from source {number}.", source=f"notes{number}.md")
        for number in range(1, 5)
    ]
    service = ChatService(
        cast(DocumentRetrievalService, FakeRetrieval(points)),
        FakeLLM("Evidence one [S1] and two [S2]."),
        cast(LLMPromptHandler, FakePromptHandler()),
    )

    response = service.answer("Question")

    assert response.answer == "Evidence one [S1] and two [S2]."
    assert [source.citation for source in response.sources] == ["S1", "S2"]
    assert [source.source for source in response.sources] == ["notes1.md", "notes2.md"]


@pytest.mark.parametrize(
    ("payload", "exception"),
    [
        (None, TypeError),
        ({"page_content": "Missing metadata"}, TypeError),
        ({"page_content": "Missing source", "metadata": {}}, ValueError),
    ],
)
def test_chat_service_rejects_malformed_retrieved_points(
    payload: dict[str, object] | None,
    exception: type[Exception],
) -> None:
    point = models.ScoredPoint(
        id="bad-point",
        version=1,
        score=0.1,
        payload=payload,
    )
    service = ChatService(
        cast(DocumentRetrievalService, FakeRetrieval([point])),
        FakeLLM(),
        cast(LLMPromptHandler, FakePromptHandler()),
    )

    with pytest.raises(exception, match="Retrieved point bad-point"):
        service.answer("Question")


def test_chat_service_rejects_blank_questions_before_retrieval() -> None:
    retrieval = FakeRetrieval([])
    service = ChatService(
        cast(DocumentRetrievalService, retrieval),
        FakeLLM(),
        cast(LLMPromptHandler, FakePromptHandler()),
    )

    with pytest.raises(ValueError, match="question must not be empty"):
        service.answer(" \n")
    assert retrieval.calls == []
