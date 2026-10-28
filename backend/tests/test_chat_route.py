from collections.abc import Iterator

import pytest
from app.api.routes import chat as chat_route
from app.main import app
from app.schemas.chat import ChatResponse, ChatSource, ResponseModelInfo
from app.services.retrieval import RetrievalMode
from fastapi.testclient import TestClient


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    def fake_service() -> object:
        class Service:
            def answer(
                self,
                question: str,
                *,
                limit: int,
                threshold: float,
                mode: RetrievalMode,
            ) -> ChatResponse:
                return ChatResponse(
                    answer=f"Answer for: {question}",
                    sources=[
                        ChatSource(
                            citation="S1",
                            source="notes.md",
                            path="data/raw/notes.md",
                            score=0.9,
                            content="Supporting chunk.",
                        )
                    ],
                    model_info=ResponseModelInfo(
                        LLM_PROVIDER="ollama",
                        LLM_TEMPERATURE=0.7,
                        LLM_TOP_P=0.9,
                        EMBED_MODEL="qwen3-embedding:0.6b",
                        EMBED_DIM=1024,
                    ),
                )

        return Service()

    app.dependency_overrides[chat_route.get_chat_service] = fake_service
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.pop(chat_route.get_chat_service, None)


def test_chat_route_returns_answer_and_citations(client: TestClient) -> None:
    response = client.post(
        "/chat",
        json={
            "question": "What does the note say?",
            "limit": 3,
            "threshold": 0.4,
            "mode": "dense",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Answer for: What does the note say?",
        "sources": [
            {
                "citation": "S1",
                "source": "notes.md",
                "path": "data/raw/notes.md",
                "page": None,
                "header_path": None,
                "score": 0.9,
                "content": "Supporting chunk.",
            }
        ],
        "model_info": {
            "LLM_PROVIDER": "ollama",
            "LLM_TEMPERATURE": 0.7,
            "LLM_TOP_P": 0.9,
            "EMBED_MODEL": "qwen3-embedding:0.6b",
            "EMBED_DIM": 1024,
        },
    }


@pytest.mark.parametrize(
    "body",
    [
        {"question": "   "},
        {"question": "question", "limit": 0},
        {"question": "question", "limit": 21},
        {"question": "question", "threshold": 2},
        {"question": "question", "mode": "unknown"},
    ],
)
def test_chat_route_validates_request_options(
    client: TestClient,
    body: dict[str, object],
) -> None:
    response = client.post("/chat", json=body)

    assert response.status_code == 422
