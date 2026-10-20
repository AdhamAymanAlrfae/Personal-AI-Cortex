import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from shutil import copyfileobj
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Query, Response, UploadFile, status
from qdrant_client import models

from app.core.config import RAW_DATA_DIR, settings
from app.providers.embeddings.base import BaseEmbeddingProvider
from app.providers.embeddings.fastembed_sparse import (
    FastEmbedSparseEmbeddingProvider,
)
from app.providers.embeddings.ollama import OllamaEmbeddingProvider
from app.providers.embeddings.sparse_base import BaseSparseEmbeddingProvider
from app.providers.ingestion.chunking import BaseChunker, MarkdownChunker
from app.providers.vector_store.base import BaseVectorStore
from app.providers.vector_store.qdrant.store import QdrantVectorStore
from app.schemas.data import UploadBatchResult, UploadedFileResult
from app.services.ingestion import DocumentIngestionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["data"])


@dataclass(frozen=True)
class IngestionComponents:
    dense_embeddings: BaseEmbeddingProvider
    sparse_embeddings: BaseSparseEmbeddingProvider
    vector_store: BaseVectorStore[models.PointStruct, models.ScoredPoint]
    chunker: BaseChunker


@dataclass(frozen=True)
class PendingUpload:
    file: UploadFile
    filename: str
    extension: str
    size: int
    destination: Path


@lru_cache(maxsize=1)
def get_ingestion_components() -> IngestionComponents:
    """Initialize reusable embedding providers and the Qdrant collection."""
    return IngestionComponents(
        dense_embeddings=OllamaEmbeddingProvider(),
        sparse_embeddings=FastEmbedSparseEmbeddingProvider(),
        vector_store=QdrantVectorStore(),
        chunker=MarkdownChunker(),
    )


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    response_model=UploadBatchResult,
)
def upload_data(
    files: Annotated[list[UploadFile], File()],
) -> UploadBatchResult:
    """Save multiple supported documents without ingesting them."""
    pending_uploads = _validate_uploads(files)
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

    for upload in pending_uploads:
        try:
            with upload.destination.open("xb") as output:
                copyfileobj(upload.file.file, output)
        except FileExistsError as exc:
            logger.warning("Rejected duplicate upload %s", upload.filename)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A file named '{upload.filename}' already exists.",
            ) from exc
        logger.info("Saved uploaded file %s (%d bytes)", upload.filename, upload.size)

    return UploadBatchResult(
        files=[
            UploadedFileResult(
                filename=upload.filename,
                path=f"data/raw/{upload.filename}",
                status="uploaded",
            )
            for upload in pending_uploads
        ]
    )


@router.post("/ingest", response_model=UploadBatchResult)
def ingest_data(
    response: Response,
    recreate_collection: Annotated[
        bool,
        Query(
            description=(
                "Delete and recreate the Qdrant collection before ingesting. "
                "This removes all currently indexed vectors."
            )
        ),
    ] = False,
) -> UploadBatchResult:
    """Ingest all supported files in the raw data directory."""
    paths = _get_ingest_files()
    try:
        if recreate_collection:
            vector_store = QdrantVectorStore()
            existed = vector_store.recreate_collection()
            logger.info(
                "Qdrant collection %s %s before ingestion",
                vector_store.collection_name,
                "recreated" if existed else "created",
            )

        if not paths:
            logger.info("No supported files found in %s", RAW_DATA_DIR)
            return UploadBatchResult(files=[])

        components = get_ingestion_components()
        ingestion = DocumentIngestionService(
            components.dense_embeddings,
            components.sparse_embeddings,
            components.vector_store,
            components.chunker,
        )
        ingestion_results = ingestion.ingest_files(paths)
    except Exception:
        logger.exception(
            "Failed to ingest raw data directory containing %d files", len(paths)
        )
        response.status_code = (
            status.HTTP_207_MULTI_STATUS
            if paths
            else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        return UploadBatchResult(
            files=[
                UploadedFileResult(
                    filename=path.name,
                    path=f"data/raw/{path.name}",
                    status="ingestion_failed",
                    error="Ingestion failed. See backend logs for details.",
                )
                for path in paths
            ]
        )

    results = [
        UploadedFileResult(
            filename=path.name,
            path=f"data/raw/{path.name}",
            status="ingested",
        )
        for path, result in zip(paths, ingestion_results, strict=True)
    ]

    return UploadBatchResult(files=results)


def _get_ingest_files() -> list[Path]:
    """Return supported regular files in the raw data directory in stable order."""
    allowed_extensions = {item.lower() for item in settings.upload_allowed_extensions}
    if not RAW_DATA_DIR.is_dir():
        return []

    return sorted(
        (
            path
            for path in RAW_DATA_DIR.iterdir()
            if path.is_file() and path.suffix.lower() in allowed_extensions
        ),
        key=lambda path: path.name.casefold(),
    )


def _validate_uploads(files: list[UploadFile]) -> list[PendingUpload]:
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one file is required.",
        )

    allowed_extensions = {item.lower() for item in settings.upload_allowed_extensions}
    seen_filenames: set[str] = set()
    pending_uploads: list[PendingUpload] = []
    for file in files:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Every uploaded file must have a filename.",
            )

        filename = file.filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
        if not filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Every uploaded file must have a filename.",
            )

        extension = Path(filename).suffix.lower()
        if extension not in allowed_extensions:
            allowed = ", ".join(sorted(allowed_extensions))
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=(
                    f"Unsupported file type for '{filename}'. "
                    f"Allowed extensions: {allowed}."
                ),
            )

        if filename.casefold() in seen_filenames:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Duplicate filename '{filename}' in upload request.",
            )
        seen_filenames.add(filename.casefold())

        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        if file_size > settings.upload_max_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail=(
                    f"'{filename}' is too large. Maximum size is "
                    f"{settings.upload_max_size_bytes} bytes."
                ),
            )

        destination = RAW_DATA_DIR / filename
        if destination.exists():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A file named '{filename}' already exists.",
            )
        pending_uploads.append(
            PendingUpload(
                file=file,
                filename=filename,
                extension=extension,
                size=file_size,
                destination=destination,
            )
        )

    return pending_uploads
