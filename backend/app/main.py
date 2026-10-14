from fastapi import FastAPI

from app.core.logging import configure_logging

configure_logging()

app = FastAPI(title="Personal AI Cortex")


@app.get("/health")
def health_check() -> dict[str, str]:
    """Report that the API process is running."""
    return {"status": "ok"}
