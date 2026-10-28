from __future__ import annotations

import os
from collections.abc import Sequence
from pathlib import Path

import streamlit as st
from api_client import APIError, ChatResponse, ChatSource, ask_question
from dotenv import load_dotenv
from streamlit.errors import StreamlitSecretNotFoundError

load_dotenv(Path(__file__).resolve().parent / ".env")

SUGGESTED_QUESTIONS = (
    "What is your technical background?",
    "Tell me about his AI and machine learning projects.",
    "What experience does he have with healthcare AI?",
    "What technical decisions went into Personal AI Cortex?",
    "What research experience does he have?",
)


def _backend_url() -> str:
    app_env = os.getenv("APP_ENV", "dev").strip().casefold()
    if app_env in {"dev", "development"}:
        return "http://localhost:8000"
    if app_env not in {"pro", "prod", "production"}:
        raise APIError("APP_ENV must be set to 'dev' or 'pro'.")

    backend_url = os.getenv("BACKEND_URL", "").strip()
    if not backend_url:
        try:
            backend_url = str(st.secrets.get("BACKEND_URL", "")).strip()
        except StreamlitSecretNotFoundError:
            backend_url = ""
    if not backend_url:
        raise APIError(
            "BACKEND_URL is not configured for production. "
            "Set it in frontend/.env or the deployment secrets."
        )
    return backend_url


def _render_sources(sources: Sequence[ChatSource]) -> None:
    if not sources:
        return

    with st.expander(f"Sources · {len(sources)}"):
        for source_index, source in enumerate(sources):
            st.markdown(f"**[{source.citation}] {source.source}**")
            metadata = []
            if source.header_path:
                metadata.append(source.header_path)
            if source.page is not None:
                metadata.append(f"Page {source.page}")
            metadata.append(f"Relevance {source.score:.2f}")
            st.markdown(
                f'<div class="source-meta">{" · ".join(metadata)}</div>',
                unsafe_allow_html=True,
            )
            excerpt = source.content.strip()
            if len(excerpt) > 700:
                excerpt = excerpt[:700].rsplit(" ", 1)[0] + "…"
            st.caption(excerpt)
            if source_index < len(sources) - 1:
                st.divider()


st.set_page_config(
    page_title="Personal AI Cortex",
    page_icon="✳",
    layout="centered",
    initial_sidebar_state="collapsed",
)

styles = Path(__file__).with_name("styles.css").read_text(encoding="utf-8")
st.html(f"<style>{styles}</style>")

if "messages" not in st.session_state:
    st.session_state.messages = []
if "pending_question" not in st.session_state:
    st.session_state.pending_question = None

header, reset = st.columns([5, 1], vertical_alignment="center")
with header:
    st.markdown(
        '<div class="brand"><span class="brand-mark">✳</span>Personal AI Cortex</div>',
        unsafe_allow_html=True,
    )
with reset:
    if st.button("New chat", use_container_width=True, help="Start a new conversation"):
        st.session_state.messages = []
        st.session_state.pending_question = None
        st.rerun()

st.markdown(
    """
    <section class="hero">
      <div class="eyebrow">A grounded portfolio assistant</div>
      <h1>Explore the work behind the ideas.</h1>
      <p>Ask me about my background, projects, and research. Answers are
      generated from retrieved portfolio materials and include source evidence
      when available.</p>
    </section>
    """,
    unsafe_allow_html=True,
)

if not st.session_state.messages:
    st.markdown(
        '<div class="conversation-label">Try asking</div>', unsafe_allow_html=True
    )
    question_columns = st.columns(2, gap="small")
    for index, question in enumerate(SUGGESTED_QUESTIONS):
        if question_columns[index % 2].button(
            question,
            key=f"suggestion_{index}",
            use_container_width=True,
        ):
            st.session_state.pending_question = question
            st.rerun()
else:
    st.markdown(
        '<div class="conversation-label">Conversation</div>',
        unsafe_allow_html=True,
    )

    for message in st.session_state.messages:
        if message["role"] == "error":
            with st.chat_message("assistant"):
                st.error(message["content"])
            continue

        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if message["role"] == "assistant":
                _render_sources(message.get("sources", []))

question = st.session_state.pending_question
if question is None:
    question = st.chat_input("Ask a question about your work...")
else:
    st.session_state.pending_question = None

if question:
    st.session_state.messages.append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.markdown(question)

    response: ChatResponse | None = None
    with st.chat_message("assistant"):
        with st.spinner("Searching the portfolio and preparing an answer..."):
            try:
                response = ask_question(question, _backend_url())
            except APIError as error:
                st.session_state.messages.append(
                    {"role": "error", "content": str(error)}
                )
                st.error(str(error))
            else:
                st.session_state.messages.append(
                    {
                        "role": "assistant",
                        "content": response.answer,
                        "sources": response.sources,
                    }
                )
        if response is not None:
            st.markdown(response.answer)
            _render_sources(response.sources)

st.markdown(
    '<div class="footer-note">Answers may be incomplete; review the cited '
    "source excerpts for context.</div>",
    unsafe_allow_html=True,
)
