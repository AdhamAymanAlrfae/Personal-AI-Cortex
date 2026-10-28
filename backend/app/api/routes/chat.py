from functools import lru_cache
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.routes.data import get_ingestion_components
from app.providers.llm import LLMPromptHandler, create_llm_provider
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import ChatService
from app.services.retrieval import DocumentRetrievalService

router = APIRouter(tags=["chat"])


@lru_cache(maxsize=1)
def get_chat_service() -> ChatService:
    """Build a reusable chat pipeline from the configured providers."""
    components = get_ingestion_components()
    retrieval = DocumentRetrievalService(
        components.dense_embeddings,
        components.sparse_embeddings,
        components.vector_store,
    )
    return ChatService(
        retrieval=retrieval,
        llm=create_llm_provider(),
        prompt_handler=LLMPromptHandler(),
    )


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    service: Annotated[ChatService, Depends(get_chat_service)],
) -> ChatResponse:
    """Answer a question using retrieved knowledge and return supporting sources."""
    return service.answer(request.question)
