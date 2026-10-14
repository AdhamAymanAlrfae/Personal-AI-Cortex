from app.providers.ingestion.loaders.md_loader import load_markdown


def test_load_markdown_returns_body_and_front_matter(tmp_path) -> None:
    markdown_file = tmp_path / "notes.md"
    markdown_file.write_text(
        "---\ntitle: Project Notes\ntags:\n  - ai\n  - docs\n---\n\nMarkdown body.\n",
        encoding="utf-8",
    )

    documents = load_markdown(markdown_file)

    assert len(documents) == 1
    assert documents[0].page_content == "Markdown body."
    assert documents[0].metadata == {
        "title": "Project Notes",
        "tags": ["ai", "docs"],
        "source": str(markdown_file),
    }


def test_load_markdown_without_front_matter(tmp_path) -> None:
    markdown_file = tmp_path / "plain.md"
    markdown_file.write_text("Just Markdown.\n", encoding="utf-8")

    documents = load_markdown(markdown_file)

    assert len(documents) == 1
    assert documents[0].page_content == "Just Markdown."
    assert documents[0].metadata == {"source": str(markdown_file)}
