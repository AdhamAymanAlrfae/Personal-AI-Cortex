from collections.abc import Sequence
from typing import Any, cast

from google import genai
from google.genai import types
from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    SystemMessage,
)

from app.core.config import settings
from app.providers.llm.base import BaseLLMProvider
from app.providers.llm.langfuse_client import get_langfuse_client


class GoogleLLMProvider(BaseLLMProvider):
    """Google Gemini chat provider using the native Google Gen AI SDK."""

    def __init__(
        self,
        *,
        model: str | None = None,
        api_key: str | None = None,
    ) -> None:
        configured_api_key = (
            api_key
            if api_key is not None
            else (
                settings.google_api_key.get_secret_value()
                if settings.google_api_key is not None
                else ""
            )
        )
        if not configured_api_key.strip():
            raise ValueError("An API key is required for the Google provider.")

        self._model = model if model is not None else settings.google_model
        if not self._model.strip():
            raise ValueError("A model name is required for the Google provider.")

        self._client = genai.Client(api_key=configured_api_key)
        self._langfuse = get_langfuse_client()

    def invoke(self, messages: Sequence[BaseMessage]) -> AIMessage:
        """Generate a Gemini response and record a Langfuse generation if enabled."""
        system_instructions: list[str] = []
        contents: list[types.ContentUnion] = []
        for message in messages:
            if not isinstance(message.content, str):
                raise TypeError(
                    "Google Gemini provider currently supports text messages only."
                )
            if isinstance(message, SystemMessage):
                system_instructions.append(message.content)
            elif isinstance(message, HumanMessage):
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=message.content)],
                    )
                )
            elif isinstance(message, AIMessage | AIMessageChunk):
                contents.append(
                    types.Content(
                        role="model",
                        parts=[types.Part.from_text(text=message.content)],
                    )
                )
            else:
                raise TypeError(
                    f"Google Gemini provider does not support {type(message).__name__} messages."
                )

        if not contents:
            raise ValueError("At least one user or assistant message is required.")

        if self._langfuse is None:
            result, _ = self._generate_content(system_instructions, contents)
            return result

        with self._langfuse.start_as_current_observation(
            name="google-genai",
            as_type="generation",
            model=self._model,
            model_parameters={
                "temperature": str(settings.llm_temperature),
                "max_output_tokens": settings.llm_max_tokens,
            },
            input=self._serialize_messages(messages),
        ) as generation:
            try:
                response, usage_details = self._generate_content(
                    system_instructions,
                    contents,
                )
                generation.update(
                    output=response.content,
                    usage_details=usage_details,
                )
                return response
            except Exception:
                generation.update(
                    level="ERROR",
                    status_message="Google Gen AI request failed.",
                )
                raise

    def _generate_content(
        self,
        system_instructions: list[str],
        contents: list[types.ContentUnion],
    ) -> tuple[AIMessage, dict[str, int]]:
        response = self._client.models.generate_content(
            model=self._model,
            contents=cast(types.ContentListUnionDict, contents),
            config=types.GenerateContentConfig(
                system_instruction="\n\n".join(system_instructions) or None,
                temperature=settings.llm_temperature,
                max_output_tokens=settings.llm_max_tokens,
            ),
        )
        answer = response.text
        if not answer:
            raise ValueError("The Google Gen AI response did not contain text.")
        return AIMessage(content=answer), self._usage_details(response)

    @staticmethod
    def _serialize_messages(messages: Sequence[BaseMessage]) -> list[dict[str, str]]:
        """Convert chat messages to a safe, JSON-serializable trace input."""
        return [
            {"role": message.type, "content": message.content}
            for message in messages
            if isinstance(message.content, str)
        ]

    @staticmethod
    def _usage_details(response: Any) -> dict[str, int]:
        usage_metadata = getattr(response, "usage_metadata", None)
        if usage_metadata is None:
            return {}

        usage_details: dict[str, int] = {}
        prompt_tokens = getattr(usage_metadata, "prompt_token_count", None)
        output_tokens = getattr(usage_metadata, "candidates_token_count", None)
        if isinstance(prompt_tokens, int):
            usage_details["input"] = prompt_tokens
        if isinstance(output_tokens, int):
            usage_details["output"] = output_tokens
        return usage_details
