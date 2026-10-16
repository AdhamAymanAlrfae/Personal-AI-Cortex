from typing import Literal

from app.core.config import settings
from app.providers.llm.base import BaseLLMProvider
from app.providers.llm.google_genai import GoogleLLMProvider
from app.providers.llm.openai_compatible import (
    GroqLLMProvider,
    OllamaLLMProvider,
    OpenRouterLLMProvider,
)

LLMProviderName = Literal["ollama", "groq", "openrouter", "google"]


def create_llm_provider(
    provider: LLMProviderName | None = None,
) -> BaseLLMProvider:
    """Create the configured LLM provider, validating required credentials."""
    provider_name = provider or settings.llm_provider
    if provider_name == "ollama":
        return OllamaLLMProvider()
    if provider_name == "groq":
        return GroqLLMProvider()
    if provider_name == "openrouter":
        return OpenRouterLLMProvider()
    if provider_name == "google":
        return GoogleLLMProvider()
    raise ValueError(f"Unsupported LLM provider: {provider_name}")
