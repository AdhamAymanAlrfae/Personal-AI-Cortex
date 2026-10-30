from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api.routes.chat import router as chat_router
from app.api.routes.data import router as data_router
from app.core.logging import configure_logging

configure_logging()

app = FastAPI(title="Personal AI Cortex")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)
app.include_router(chat_router)


# Add this so i can upload more than one files in the /docs at once
def custom_openapi() -> dict[str, object]:
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )
    request_schema = openapi_schema["paths"]["/data/upload"]["post"]["requestBody"][
        "content"
    ]["multipart/form-data"]["schema"]
    schema_reference = request_schema.get("$ref")
    if isinstance(schema_reference, str):
        component_name = schema_reference.rsplit("/", 1)[-1]
        request_schema = openapi_schema["components"]["schemas"][component_name]
    request_schema["properties"]["files"]["items"] = {
        "type": "string",
        "format": "binary",
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/health")
def health_check() -> dict[str, str]:
    """Report that the API process is running."""
    return {"status": "ok"}
