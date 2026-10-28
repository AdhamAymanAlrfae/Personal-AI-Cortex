from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    """Question and retrieval controls for one RAG chat turn."""

    question: str = Field(min_length=1, max_length=10_000)

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


class ResponseModelInfo(BaseModel):
    LLM_PROVIDER: str
    LLM_TEMPERATURE: float
    LLM_TOP_P: float
    EMBED_MODEL: str
    EMBED_DIM: int


class ChatResponse(BaseModel):
    """Grounded answer and the source chunks retrieved for it."""

    answer: str
    sources: list[ChatSource]
    model_info: ResponseModelInfo
