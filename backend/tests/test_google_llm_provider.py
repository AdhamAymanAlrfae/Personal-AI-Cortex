from collections.abc import Iterator
from contextlib import AbstractContextManager, contextmanager
from types import SimpleNamespace
from typing import Any

import pytest
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from pydantic import SecretStr

from app.providers.llm import GoogleLLMProvider, create_llm_provider
from app.providers.llm import google_genai as google_genai_module


def test_google_provider_uses_native_sdk_and_records_langfuse_generation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: dict[str, Any] = {}

    class FakeGeneration:
        def update(self, **kwargs: object) -> None:
            calls["generation_update"] = kwargs

    @contextmanager
    def fake_generation() -> Iterator[FakeGeneration]:
        try:
            yield FakeGeneration()
        finally:
            calls["generation_end"] = True

    class FakeGoogleClient:
        def __init__(self, *, api_key: str) -> None:
            calls["api_key"] = api_key
            self.models = SimpleNamespace(generate_content=self.generate_content)

        def generate_content(self, **kwargs: object) -> object:
            calls["generate_content"] = kwargs
            return SimpleNamespace(
                text="A native Gemini answer",
                usage_metadata=SimpleNamespace(
                    prompt_token_count=12,
                    candidates_token_count=5,
                ),
            )

    class FakeLangfuse:
        def start_as_current_observation(
            self, **kwargs: object
        ) -> AbstractContextManager[FakeGeneration]:
            calls["generation_start"] = kwargs
            return fake_generation()

    monkeypatch.setattr(google_genai_module.genai, "Client", FakeGoogleClient)
    monkeypatch.setattr(
        google_genai_module, "get_langfuse_client", lambda: FakeLangfuse()
    )
    monkeypatch.setattr(google_genai_module.settings, "google_model", "gemini-test")
    monkeypatch.setattr(google_genai_module.settings, "llm_temperature", 0.3)
    monkeypatch.setattr(google_genai_module.settings, "llm_max_tokens", 256)

    provider = GoogleLLMProvider(api_key="google-test-key")
    response = provider.invoke(
        [
            SystemMessage(content="Answer with evidence."),
            HumanMessage(content="What is RAG?"),
            AIMessage(content="A previous answer."),
        ]
    )

    assert response == AIMessage(content="A native Gemini answer")
    assert calls["api_key"] == "google-test-key"
    trace_input = calls["generation_start"]
    assert isinstance(trace_input, dict)
    assert trace_input["name"] == "google-genai"
    assert trace_input["as_type"] == "generation"
    assert trace_input["model"] == "gemini-test"
    request = calls["generate_content"]
    assert isinstance(request, dict)
    assert request["model"] == "gemini-test"
    assert [(item.role, item.parts[0].text) for item in request["contents"]] == [
        ("user", "What is RAG?"),
        ("model", "A previous answer."),
    ]
    config = request["config"]
    assert config.system_instruction == "Answer with evidence."
    assert config.temperature == 0.3
    assert config.max_output_tokens == 256
    trace_update = calls["generation_update"]
    assert isinstance(trace_update, dict)
    assert trace_update["output"] == "A native Gemini answer"
    assert trace_update["usage_details"] == {"input": 12, "output": 5}
    assert calls["generation_end"] is True


def test_google_provider_does_not_create_a_langfuse_generation_when_disabled(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeGoogleClient:
        def __init__(self, *, api_key: str) -> None:
            self.models = SimpleNamespace(
                generate_content=lambda **kwargs: SimpleNamespace(text="Answer")
            )

    monkeypatch.setattr(google_genai_module.genai, "Client", FakeGoogleClient)
    monkeypatch.setattr(google_genai_module, "get_langfuse_client", lambda: None)

    response = GoogleLLMProvider(api_key="google-test-key").invoke(
        [HumanMessage(content="Question?")]
    )

    assert response.content == "Answer"


def test_google_provider_requires_an_api_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(google_genai_module.settings, "google_api_key", None)

    with pytest.raises(ValueError, match="API key is required"):
        GoogleLLMProvider()


def test_google_provider_rejects_tool_messages(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeGoogleClient:
        def __init__(self, *, api_key: str) -> None:
            self.models = SimpleNamespace()

    monkeypatch.setattr(google_genai_module.genai, "Client", FakeGoogleClient)
    monkeypatch.setattr(google_genai_module, "get_langfuse_client", lambda: None)
    provider = GoogleLLMProvider(api_key="google-test-key")

    with pytest.raises(TypeError, match="does not support ToolMessage"):
        provider.invoke(
            [
                HumanMessage(content="Question?"),
                ToolMessage(content="Tool result", tool_call_id="call-1"),
            ]
        )


def test_factory_creates_google_provider_with_google_sdk(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeGoogleClient:
        def __init__(self, *, api_key: str) -> None:
            self.models = SimpleNamespace()

    monkeypatch.setattr(google_genai_module.genai, "Client", FakeGoogleClient)
    monkeypatch.setattr(google_genai_module, "get_langfuse_client", lambda: None)
    monkeypatch.setattr(
        google_genai_module.settings, "google_api_key", SecretStr("google-test-key")
    )

    provider = create_llm_provider("google")

    assert isinstance(provider, GoogleLLMProvider)
