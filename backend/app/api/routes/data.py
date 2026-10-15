import logging
from pathlib import Path
from shutil import copyfileobj
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import RAW_DATA_DIR, settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["data"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_data(file: Annotated[UploadFile, File()]) -> dict[str, str]:
    """Save an uploaded file to the raw data directory."""
    if not file.filename:
        logger.warning("Rejected upload without a filename")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A filename is required.",
        )

    filename = file.filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    if not filename:
        logger.warning("Rejected upload with an empty filename")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A filename is required.",
        )

    extension = Path(filename).suffix.lower()
    allowed_extensions = {item.lower() for item in settings.upload_allowed_extensions}
    if extension not in allowed_extensions:
        logger.warning("Rejected upload with unsupported extension %s", extension)
        allowed = ", ".join(sorted(allowed_extensions))
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed extensions: {allowed}.",
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > settings.upload_max_size_bytes:
        logger.warning(
            "Rejected upload of %d bytes; maximum allowed is %d bytes",
            file_size,
            settings.upload_max_size_bytes,
        )
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=(
                "File is too large. Maximum size is "
                f"{settings.upload_max_size_bytes} bytes."
            ),
        )

    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    destination = RAW_DATA_DIR / filename

    try:
        with destination.open("xb") as output:
            copyfileobj(file.file, output)
    except FileExistsError as exc:
        logger.warning("Rejected duplicate upload with extension %s", extension)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A file with that name already exists.",
        ) from exc

    logger.info("Saved uploaded file with extension %s (%d bytes)", extension, file_size)
    return {"filename": filename, "path": f"data/raw/{filename}"}
