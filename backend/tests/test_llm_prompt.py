from typing import Any

import pytest
from app.providers.llm import LLMPromptHandler
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import SecretStr


def test_prompt_handler_uses_default_fallback_without_langfuse_credentials(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.providers.llm import prompt as prompt_module

    monkeypatch.setattr(prompt_module.settings, "langfuse_public_key", None)
    monkeypatch.setattr(prompt_module.settings, "langfuse_secret_key", None)

    messages = LLMPromptHandler().build_messages(
        question="What is in the notes?",
        context="The notes mention a project.",
    )

    assert isinstance(messages[0], SystemMessage)
    assert isinstance(messages[1], HumanMessage)
    assert "only the supplied context" in messages[0].content
    assert "What is in the notes?" in messages[1].content
    assert "The notes mention a project." in messages[1].content


def test_prompt_handler_loads_chat_prompt_from_langfuse(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.providers.llm import prompt as prompt_module

    calls: dict[str, Any] = {}

    class FakeLangfuse:
        def get_prompt(self, name: str, *, type: str) -> "FakePrompt":
            calls["get_prompt"] = (name, type)
            return FakePrompt()

    class FakePrompt:
        def get_langchain_prompt(self) -> list[tuple[str, str]]:
            return [("system", "Use this context: {context}"), ("human", "{question}")]

    monkeypatch.setattr(prompt_module, "get_langfuse_client", FakeLangfuse)
    monkeypatch.setattr(prompt_module.settings, "llm_prompt_name", "answer")

    messages = LLMPromptHandler().build_messages(
        question="Question?", context="Context."
    )

    assert calls == {
        "get_prompt": ("answer", "chat"),
    }
    assert messages[0].content == "Use this context: Context."
    assert messages[1].content == "Question?"


def test_prompt_handler_rejects_partial_langfuse_credentials(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.providers.llm import prompt as prompt_module

    monkeypatch.setattr(
        prompt_module.settings, "langfuse_public_key", SecretStr("public")
    )
    monkeypatch.setattr(prompt_module.settings, "langfuse_secret_key", None)

    with pytest.raises(ValueError, match="Both LANGFUSE_PUBLIC_KEY"):
        LLMPromptHandler()


def test_prompt_handler_uses_a_custom_fallback_prompt(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.providers.llm import prompt as prompt_module

    monkeypatch.setattr(prompt_module.settings, "langfuse_public_key", None)
    monkeypatch.setattr(prompt_module.settings, "langfuse_secret_key", None)
    fallback = ChatPromptTemplate.from_messages([("human", "Hello {name}")])

    messages = LLMPromptHandler(fallback_prompt=fallback).build_messages(name="Ada")

    assert len(messages) == 1
    assert messages[0].content == "Hello Ada"
