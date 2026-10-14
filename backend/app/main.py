from fastapi import FastAPI

from app.api.routes.data import router as data_router
from app.core.logging import configure_logging

configure_logging()

app = FastAPI(title="Personal AI Cortex")
app.include_router(data_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Report that the API process is running."""
    return {"status": "ok"}
