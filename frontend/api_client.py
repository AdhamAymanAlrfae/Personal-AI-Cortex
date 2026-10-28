from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

REQUEST_TIMEOUT_SECONDS = 60


class APIError(Exception):
    """A user-safe error raised when the backend cannot serve a chat request."""


@dataclass(frozen=True)
class ChatSource:
    citation: str
    source: str
    path: str
    page: int | None
    header_path: str | None
    score: float
    content: str


@dataclass(frozen=True)
class ChatResponse:
    answer: str
    sources: list[ChatSource]


def ask_question(question: str, backend_url: str) -> ChatResponse:
    """Send a chat question and validate the backend response contract."""
    try:
        response = requests.post(
            f"{backend_url.rstrip('/')}/chat",
            json={"question": question},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.Timeout as error:
        raise APIError(
            "The assistant took too long to respond. Please try again."
        ) from error
    except requests.ConnectionError as error:
        raise APIError(
            "The assistant is currently unavailable. Please try again later."
        ) from error
    except requests.RequestException as error:
        raise APIError(
            "We couldn't reach the assistant. Please try again later."
        ) from error

    if not response.ok:
        raise APIError(
            "The assistant couldn't process that question. Please try again."
        )

    try:
        payload: Any = response.json()
    except requests.exceptions.JSONDecodeError as error:
        raise APIError("The assistant returned an unreadable response.") from error

    if not isinstance(payload, dict) or not isinstance(payload.get("answer"), str):
        raise APIError("The assistant returned an unexpected response.")

    raw_sources = payload.get("sources")
    if not isinstance(raw_sources, list):
        raise APIError("The assistant returned an unexpected response.")

    return ChatResponse(
        answer=payload["answer"],
        sources=[_parse_source(source) for source in raw_sources],
    )


def _parse_source(value: Any) -> ChatSource:
    if not isinstance(value, dict):
        raise APIError("The assistant returned invalid source information.")

    citation = value.get("citation")
    source = value.get("source")
    path = value.get("path")
    content = value.get("content")
    page = value.get("page")
    header_path = value.get("header_path")
    score = value.get("score")

    if not all(isinstance(item, str) for item in (citation, source, path, content)):
        raise APIError("The assistant returned invalid source information.")
    if page is not None and (not isinstance(page, int) or isinstance(page, bool)):
        raise APIError("The assistant returned invalid source information.")
    if header_path is not None and not isinstance(header_path, str):
        raise APIError("The assistant returned invalid source information.")
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        raise APIError("The assistant returned invalid source information.")

    return ChatSource(
        citation=citation,
        source=source,
        path=path,
        page=page,
        header_path=header_path,
        score=float(score),
        content=content,
    )
