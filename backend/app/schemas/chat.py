from pydantic import BaseModel, Field, field_validator

from app.services.retrieval import RetrievalMode


class ChatRequest(BaseModel):
    """Question and retrieval controls for one RAG chat turn."""

    question: str = Field(min_length=1, max_length=10_000)
    limit: int = Field(default=5, ge=1, le=20)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)
    mode: RetrievalMode = RetrievalMode.HYBRID

    @field_validator("question")
    @classmethod
    def strip_question(cls, question: str) -> str:
        question = question.strip()
        if not question:
            raise ValueError("Question must not be empty.")
        return question


class ChatSource(BaseModel):
    """A retrieved source chunk included as evidence for a chat answer."""

    citation: str
    source: str
    path: str
    page: int | None = None
    header_path: str | None = None
    score: float
    content: str


class ChatResponse(BaseModel):
    """Grounded answer and the source chunks retrieved for it."""

    answer: str
    sources: list[ChatSource]
