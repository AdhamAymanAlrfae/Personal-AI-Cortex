import pytest
from app.providers.ingestion.chunking import (
    MarkdownChunker,
    RecursiveCharacterChunker,
)
from langchain_core.documents import Document


def test_markdown_chunker_records_nested_header_path_and_metadata(
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level("DEBUG", logger="app.providers.ingestion.chunking.markdown")
    document = Document(
        page_content="# Project\n## Design\n### Retrieval\nRelevant details.",
        metadata={"source": "notes.md", "category": "engineering"},
    )

    chunks = MarkdownChunker(chunk_size=1000, chunk_overlap=0).split_documents(
        [document]
    )

    assert len(chunks) == 1
    assert chunks[0].metadata["header_path"] == "Project > Design > Retrieval"
    assert chunks[0].metadata["source"] == "notes.md"
    assert chunks[0].metadata["category"] == "engineering"
    assert chunks[0].metadata["chunk_index"] == 0
    assert "Chunking 1 documents with Markdown chunker" in caplog.text
    assert "Markdown chunker generated 1 chunks" in caplog.text


def test_markdown_chunker_keeps_header_paths_for_split_sections() -> None:
    document = Document(
        page_content=(
            "# Guide\n## First\nfirst section content\n"
            "## Second\nsecond section content"
        )
    )

    chunks = MarkdownChunker(chunk_size=1000, chunk_overlap=0).split_documents(
        [document]
    )

    assert [chunk.metadata["header_path"] for chunk in chunks] == [
        "Guide > First",
        "Guide > Second",
    ]
    assert [chunk.metadata["chunk_index"] for chunk in chunks] == [0, 1]


def test_markdown_chunker_retains_header_path_after_content_splitting() -> None:
    document = Document(
        page_content="# Guide\n## Details\n" + ("Long content. " * 20)
    )

    chunks = MarkdownChunker(chunk_size=30, chunk_overlap=0).split_documents(
        [document]
    )

    assert len(chunks) > 1
    assert all(chunk.metadata["header_path"] == "Guide > Details" for chunk in chunks)
    assert [chunk.metadata["chunk_index"] for chunk in chunks] == list(
        range(len(chunks))
    )


def test_recursive_character_chunker_remains_available(
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(
        "DEBUG", logger="app.providers.ingestion.chunking.recursive_character"
    )
    chunker = RecursiveCharacterChunker(chunk_size=1000, chunk_overlap=0)

    assert chunker.split_documents([Document(page_content="Existing behavior.")])
    assert "Chunking 1 documents with recursive character chunker" in caplog.text
    assert "Recursive character chunker generated 1 chunks" in caplog.text
