from app.api.routes import data
from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_upload_saves_file_in_raw_directory(tmp_path, monkeypatch) -> None:
    raw_directory = tmp_path / "raw"
    monkeypatch.setattr(data, "RAW_DATA_DIR", raw_directory)
    app = FastAPI()
    app.include_router(data.router)

    response = TestClient(app).post(
        "/data/upload",
        files={"file": ("../notes.txt", b"document contents")},
    )

    assert response.status_code == 201
    assert response.json() == {
        "filename": "notes.txt",
        "path": "data/raw/notes.txt",
    }
    assert (raw_directory / "notes.txt").read_bytes() == b"document contents"


def test_upload_does_not_overwrite_existing_file(tmp_path, monkeypatch) -> None:
    raw_directory = tmp_path / "raw"
    raw_directory.mkdir()
    existing_file = raw_directory / "notes.txt"
    existing_file.write_bytes(b"original")
    monkeypatch.setattr(data, "RAW_DATA_DIR", raw_directory)
    app = FastAPI()
    app.include_router(data.router)

    response = TestClient(app).post(
        "/data/upload",
        files={"file": ("notes.txt", b"replacement")},
    )

    assert response.status_code == 409
    assert existing_file.read_bytes() == b"original"


def test_upload_rejects_unsupported_file_type(tmp_path, monkeypatch) -> None:
    raw_directory = tmp_path / "raw"
    monkeypatch.setattr(data, "RAW_DATA_DIR", raw_directory)
    app = FastAPI()
    app.include_router(data.router)

    response = TestClient(app).post(
        "/data/upload",
        files={"file": ("archive.zip", b"file contents")},
    )

    assert response.status_code == 415
    assert not raw_directory.exists()


def test_upload_rejects_file_over_configured_size(tmp_path, monkeypatch) -> None:
    raw_directory = tmp_path / "raw"
    monkeypatch.setattr(data, "RAW_DATA_DIR", raw_directory)
    monkeypatch.setattr(data.settings, "upload_max_size_bytes", 4)
    app = FastAPI()
    app.include_router(data.router)

    response = TestClient(app).post(
        "/data/upload",
        files={"file": ("notes.txt", b"12345")},
    )

    assert response.status_code == 413
    assert not raw_directory.exists()
