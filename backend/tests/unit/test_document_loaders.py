import pytest
from app.providers.ingestion.loaders.loader import load_document
from app.providers.ingestion.loaders.pdf_loader import load_pdf
from app.providers.ingestion.loaders.txt_loader import load_txt
from pypdf import PdfWriter


def test_load_txt_returns_document_with_source(tmp_path) -> None:
    text_file = tmp_path / "notes.txt"
    text_file.write_text("Plain text.", encoding="utf-8")

    documents = load_txt(text_file)

    assert len(documents) == 1
    assert documents[0].page_content == "Plain text."
    assert documents[0].metadata == {"source": str(text_file)}


def test_load_pdf_returns_document_per_page(tmp_path) -> None:
    pdf_file = tmp_path / "pages.pdf"
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    writer.add_blank_page(width=72, height=72)
    with pdf_file.open("wb") as output:
        writer.write(output)

    documents = load_pdf(pdf_file)

    assert len(documents) == 2
    assert [document.metadata for document in documents] == [
        {"source": str(pdf_file), "page": 0},
        {"source": str(pdf_file), "page": 1},
    ]


def test_dispatcher_loads_by_extension(tmp_path) -> None:
    text_file = tmp_path / "notes.TXT"
    text_file.write_text("Plain text.", encoding="utf-8")

    documents = load_document(text_file)

    assert documents[0].page_content == "Plain text."


def test_dispatcher_rejects_unsupported_extension(tmp_path) -> None:
    document_file = tmp_path / "notes.docx"
    document_file.touch()

    with pytest.raises(ValueError, match="Unsupported document type: .docx"):
        load_document(document_file)
