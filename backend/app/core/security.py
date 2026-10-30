import secrets
from typing import Annotated

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import settings

app_api_key_header = APIKeyHeader(name="X-App-API-Key", auto_error=False)


def verify_api_key(app_api_key: Annotated[str | None, Security(app_api_key_header)]):
    if not app_api_key or not secrets.compare_digest(
        app_api_key, settings.app_api_key.get_secret_value()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
