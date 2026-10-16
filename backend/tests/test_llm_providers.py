from collections.abc import Sequence
from inspect import isabstract
from types import SimpleNamespace
from typing import Any, cast

import pytest
from app.providers.llm import BaseLLMProvider, factory
from app.providers.llm import openai_compatible as providers
from app.providers.llm.factory import LLMProviderName
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from pydantic import SecretStr


def test_base_llm_provider_defines_chat_contract() -> None:
    assert isabstract(BaseLLMProvider)


def test_base_llm_provider_accepts_a_conversation() -> None:
    class FakeLLMProvider(BaseLLMProvider):
        def __init__(self) -> None:
            self.messages: Sequence[BaseMessage] = []

        def invoke(self, messages: Sequence[BaseMessage]) -> AIMessage:
            self.messages = messages
            return AIMessage(content="A response")

    provider = FakeLLMProvider()
    messages = [HumanMessage(content="A question")]

    response = provider.invoke(messages)

    assert provider.messages == messages
    assert response.content == "A response"


def test_openai_compatible_provider_sends_messages_and_generation_settings(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: dict[str, Any] = {}

    class FakeClient:
        def __init__(self, **kwargs: object) -> None:
            calls["init"] = kwargs
            self.chat = SimpleNamespace(
                completions=SimpleNamespace(create=self.create_completion)
            )

        def create_completion(self, **kwargs: object) -> object:
            calls["completion"] = kwargs
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(
                        message=SimpleNamespace(content="A grounded answer")
                    )
                ]
            )

    monkeypatch.setattr(providers, "OpenAI", FakeClient)
    monkeypatch.setattr(providers, "LangfuseOpenAI", FakeClient)
    monkeypatch.setattr(providers, "get_langfuse_client", lambda: None)

    provider = providers.OpenAICompatibleLLMProvider(
        provider_name="test",
        model="test-model",
        api_key="test-key",
        base_url="https://provider.example/v1",
    )
    messages = [
        SystemMessage(content="Use evidence."),
        HumanMessage(content="Question?"),
    ]

    response = provider.invoke(messages)

    assert response == AIMessage(content="A grounded answer")
    assert calls["init"] == {
        "api_key": "test-key",
        "base_url": "https://provider.example/v1",
    }
    completion = calls["completion"]
    assert isinstance(completion, dict)
    assert completion["model"] == "test-model"
    assert completion["messages"] == [
        {"role": "system", "content": "Use evidence."},
        {"role": "user", "content": "Question?"},
    ]
    assert "max_tokens" in completion
    assert "temperature" in completion


def test_openai_compatible_provider_uses_langfuse_instrumented_client(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: list[str] = []

    class FakeClient:
        def __init__(self, **kwargs: object) -> None:
            calls.append("langfuse")

    monkeypatch.setattr(providers, "OpenAI", lambda **kwargs: calls.append("openai"))
    monkeypatch.setattr(providers, "LangfuseOpenAI", FakeClient)
    monkeypatch.setattr(providers, "get_langfuse_client", lambda: object())

    providers.OpenAICompatibleLLMProvider(
        provider_name="test",
        model="test-model",
        api_key="test-key",
        base_url="https://provider.example/v1",
    )

    assert calls == ["langfuse"]


def test_openai_compatible_provider_rejects_response_without_choices(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeClient:
        def __init__(self, **kwargs: object) -> None:
            self.chat = SimpleNamespace(
                completions=SimpleNamespace(
                    create=lambda **kwargs: SimpleNamespace(choices=[])
                )
            )

    monkeypatch.setattr(providers, "OpenAI", FakeClient)
    monkeypatch.setattr(providers, "get_langfuse_client", lambda: None)
    provider = providers.OpenAICompatibleLLMProvider(
        provider_name="test",
        model="test-model",
        api_key="test-key",
        base_url="https://provider.example/v1",
    )

    with pytest.raises(ValueError, match="did not contain any choices"):
        provider.invoke([HumanMessage(content="Question?")])


@pytest.mark.parametrize(
    ("provider_name", "api_key_setting"),
    [
        ("groq", "groq_api_key"),
        ("openrouter", "openrouter_api_key"),
    ],
)
def test_cloud_provider_requires_its_api_key(
    monkeypatch: pytest.MonkeyPatch,
    provider_name: LLMProviderName,
    api_key_setting: str,
) -> None:
    monkeypatch.setattr(factory.settings, api_key_setting, None)
    monkeypatch.setattr(providers, "get_langfuse_client", lambda: None)

    with pytest.raises(ValueError, match="API key is required"):
        factory.create_llm_provider(provider_name)


@pytest.mark.parametrize(
    ("provider", "provider_setting", "key_setting"),
    [
        ("ollama", "ollama_model", "ollama_api_key"),
        ("groq", "groq_model", "groq_api_key"),
        ("openrouter", "openrouter_model", "openrouter_api_key"),
    ],
)
def test_factory_creates_selected_provider(
    monkeypatch: pytest.MonkeyPatch,
    provider: str,
    provider_setting: str,
    key_setting: str,
) -> None:
    monkeypatch.setattr(factory.settings, "llm_provider", provider)
    monkeypatch.setattr(factory.settings, key_setting, SecretStr("provider-key"))
    monkeypatch.setattr(providers, "get_langfuse_client", lambda: None)
    monkeypatch.setattr(providers, "OpenAI", lambda **kwargs: object())

    instance = factory.create_llm_provider()

    assert isinstance(instance, providers.OpenAICompatibleLLMProvider)
    assert instance._model == getattr(factory.settings, provider_setting)


@pytest.mark.parametrize(
    ("provider", "class_name"),
    [
        ("ollama", "OllamaLLMProvider"),
        ("groq", "GroqLLMProvider"),
        ("openrouter", "OpenRouterLLMProvider"),
    ],
)
def test_factory_honors_explicit_provider_selection(
    monkeypatch: pytest.MonkeyPatch,
    provider: str,
    class_name: str,
) -> None:
    monkeypatch.setattr(factory.settings, "groq_api_key", SecretStr("provider-key"))
    monkeypatch.setattr(
        factory.settings, "openrouter_api_key", SecretStr("provider-key")
    )
    monkeypatch.setattr(providers, "get_langfuse_client", lambda: None)
    monkeypatch.setattr(providers, "OpenAI", lambda **kwargs: object())

    instance = factory.create_llm_provider(cast(LLMProviderName, provider))

    assert type(instance).__name__ == class_name
