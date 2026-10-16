from typing import Literal

from pydantic import BaseModel


class UploadedFileResult(BaseModel):
    """Outcome of uploading or ingesting one file."""

    filename: str
    path: str
    status: Literal["uploaded", "ingested", "ingestion_failed"]
    documents_loaded: int | None = None
    chunks_created: int | None = None
    points_added: int | None = None
    error: str | None = None


class UploadBatchResult(BaseModel):
    """Outcomes for all files in one upload request."""

    files: list[UploadedFileResult]
