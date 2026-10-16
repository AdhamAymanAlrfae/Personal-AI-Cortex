from functools import lru_cache

from langfuse import Langfuse

from app.core.config import settings


def get_langfuse_client() -> Langfuse | None:
    """Return the configured Langfuse client, or None when tracing is disabled."""
    public_key = (
        settings.langfuse_public_key.get_secret_value().strip()
        if settings.langfuse_public_key is not None
        else ""
    )
    secret_key = (
        settings.langfuse_secret_key.get_secret_value().strip()
        if settings.langfuse_secret_key is not None
        else ""
    )
    if not public_key and not secret_key:
        return None
    if not public_key or not secret_key:
        raise ValueError(
            "Both LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY must be configured."
        )

    base_url = settings.langfuse_base_url
    return _get_cached_langfuse_client(
        public_key,
        secret_key,
        base_url.strip() if base_url and base_url.strip() else None,
    )


@lru_cache(maxsize=4)
def _get_cached_langfuse_client(
    public_key: str,
    secret_key: str,
    base_url: str | None,
) -> Langfuse:
    return Langfuse(
        public_key=public_key,
        secret_key=secret_key,
        base_url=base_url,
    )
