from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = BACKEND_ROOT.parent / "data" / "raw"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application settings
    app_env: str = "development"
    log_level: str = "DEBUG"

    # Data uploads
    upload_allowed_extensions: set[str] = {".txt", ".pdf", ".md"}
    upload_max_size_bytes: int = 10 * 1024 * 1024

    # Document chunking
    chunk_size: int = 300
    chunk_overlap: int = 30

    # Langfuse settings
    langfuse_secret_key: SecretStr | None = None
    langfuse_public_key: SecretStr | None = None
    langfuse_base_url: str | None = None

    # Qdrant settings
    qdrant_api_key: SecretStr
    qdrant_url: str
    qdrant_collection_name: str = "personal-ai-cortex"

    # Embedding model
    embed_model: str = "qwen3-embedding:0.6b"
    embed_dim: int = 1024
    embed_context: int = 32_000

    # Sparse model
    sparse_model: str = "Qdrant/bm25"

    # LLM model
    llm_model: str = "gemma4:e4b"
    llm_context: int = 128_000
    llm_max_tokens: int = 4096
    llm_temperature: float = 0.7


settings = Settings()  # pyright: ignore[reportCallIssue] # Loaded from environment/.env

APP_ENV = settings.app_env
LOG_LEVEL = settings.log_level.upper()
