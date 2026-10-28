from collections.abc import Sequence
from typing import cast

from langchain_core.messages import AIMessage, BaseMessage, convert_to_openai_messages
from langfuse.openai import OpenAI as LangfuseOpenAI  # pyright: ignore[reportPrivateImportUsage]
from openai import OpenAI
from openai.types.chat import ChatCompletionMessageParam

from app.core.config import settings
from app.providers.llm.base import BaseLLMProvider
from app.providers.llm.langfuse_client import get_langfuse_client


class OpenAICompatibleLLMProvider(BaseLLMProvider):
    """Chat provider for APIs that implement the OpenAI chat completions format."""

    def __init__(
        self,
        *,
        provider_name: str,
        model: str,
        api_key: str,
        base_url: str,
    ) -> None:
        if not api_key.strip():
            raise ValueError(
                f"An API key is required for the {provider_name} provider."
            )
        if not model.strip():
            raise ValueError(
                f"A model name is required for the {provider_name} provider."
            )

        langfuse_client = get_langfuse_client()
        client_type = LangfuseOpenAI if langfuse_client is not None else OpenAI
        self._client = client_type(api_key=api_key, base_url=base_url)
        self._model = model

    def invoke(self, messages: Sequence[BaseMessage]) -> AIMessage:
        """Generate a chat completion and return it as a LangChain AI message."""
        response = self._client.responses.create(
            model=self._model,
            input=cast(
                list[ChatCompletionMessageParam],
                convert_to_openai_messages(messages),
            ),
            max_output_tokens=settings.llm_max_tokens,
            temperature=settings.llm_temperature,
            top_p=settings.llm_top_p,
        )
        if not hasattr(response, "output_text") or response.output_text is None:
            raise ValueError("The LLM response did not contain a text completion.")

        return AIMessage(content=response.output_text)


class OllamaLLMProvider(OpenAICompatibleLLMProvider):
    """Ollama chat provider using its OpenAI-compatible API."""

    def __init__(
        self,
        *,
        model: str | None = None,
        api_key: str | None = None,
        base_url: str | None = None,
    ) -> None:
        super().__init__(
            provider_name="Ollama",
            model=model if model is not None else settings.ollama_model,
            api_key=(
                api_key
                if api_key is not None
                else settings.ollama_api_key.get_secret_value()
            ),
            base_url=base_url if base_url is not None else settings.ollama_base_url,
        )


class GroqLLMProvider(OpenAICompatibleLLMProvider):
    """Groq chat provider."""

    def __init__(
        self,
        *,
        model: str | None = None,
        api_key: str | None = None,
        base_url: str | None = None,
    ) -> None:
        super().__init__(
            provider_name="Groq",
            model=model if model is not None else settings.groq_model,
            api_key=(
                api_key
                if api_key is not None
                else (
                    settings.groq_api_key.get_secret_value()
                    if settings.groq_api_key is not None
                    else ""
                )
            ),
            base_url=base_url if base_url is not None else settings.groq_base_url,
        )


class OpenRouterLLMProvider(OpenAICompatibleLLMProvider):
    """OpenRouter chat provider."""

    def __init__(
        self,
        *,
        model: str | None = None,
        api_key: str | None = None,
        base_url: str | None = None,
    ) -> None:
        super().__init__(
            provider_name="OpenRouter",
            model=model if model is not None else settings.openrouter_model,
            api_key=(
                api_key
                if api_key is not None
                else (
                    settings.openrouter_api_key.get_secret_value()
                    if settings.openrouter_api_key is not None
                    else ""
                )
            ),
            base_url=(
                base_url if base_url is not None else settings.openrouter_base_url
            ),
        )
