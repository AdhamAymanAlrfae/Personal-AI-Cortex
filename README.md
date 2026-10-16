# Personal AI Cortex

A personal knowledge assistant that uses retrieval-augmented generation (RAG) to answer questions from a document collection and provide verifiable citations to the supporting sources.

> **Status:** Early development. The initial milestone focuses on building a reliable V1, not a fully featured assistant.

## V1 Goals

- Ingest documents and prepare them for retrieval.
- Retrieve relevant evidence for a user's question.
- Generate answers grounded in the retrieved evidence.
- Provide citations that let users inspect the supporting sources.
- Abstain when the available evidence is insufficient.
- Establish a repeatable evaluation baseline for retrieval and answer quality.

## Planned Architecture

- **Frontend:** a minimal interface for asking questions and reviewing answers and sources.
- **Backend:** a FastAPI application that coordinates ingestion, retrieval, and answer generation.
- **Providers:** replaceable integrations for language models, embeddings, and vector storage.
- **Evaluation:** notebooks and datasets for measuring retrieval and answer quality.
- **Infrastructure:** Docker-based local development and environment-based configuration.

The architecture will evolve as the V1 requirements are implemented. Avoid assuming that a planned component is already available.

## Repository Layout

```text
frontend/      User interface
backend/       FastAPI application and RAG pipeline
data/          Local source and processed data (not necessarily committed)
evaluation/    Evaluation notebooks, datasets, and results
docs/          Design and implementation notes
scripts/       Development and maintenance scripts
```

## Development Progress

Implementation scope and progress are tracked in GitHub. See the [Issues](../../issues) for individual work items and the [Milestones](../../milestones) for milestone-level progress. The GitHub Project board provides a status overview.

## Data and Configuration

- Keep credentials and API keys in environment variables; never commit secrets.
- Copy `backend/.env.example` to `backend/.env` for backend settings. The backend loads this file directly, and Docker Compose passes it to the backend container.
- Copy `.env.example` to the repository-root `.env` for Compose port overrides.
- Do not commit private documents, restricted datasets, or large generated artifacts unless there is a clear reason and permission to share them.

## Embedding Providers

The backend exposes a shared LangChain-compatible embedding interface with `embed_documents(texts)` for chunks and `embed_query(text)` for search queries:

```python
from app.providers.embeddings import OllamaEmbeddingProvider

ollama_embeddings = OllamaEmbeddingProvider(
    "qwen3-embedding:0.6b",
    base_url="http://localhost:11434",
)
chunk_vectors = ollama_embeddings.embed_documents(["First chunk", "Second chunk"])
query_vector = ollama_embeddings.embed_query("Search question")
```

The Ollama provider requires the selected embedding model to be available on the configured Ollama server. Omit `base_url` to use Ollama's default server address.

## LLM Providers and Prompts

Select `ollama`, `groq`, `openrouter`, or `google` with `LLM_PROVIDER`. Ollama, Groq, and OpenRouter use the OpenAI SDK chat completions interface. Google Gemini uses the native Google Gen AI SDK. Configure the selected provider's model and API key in `backend/.env`. Ollama defaults to `http://localhost:11434/v1`; when the backend runs in Docker and Ollama runs on the host, set `OLLAMA_BASE_URL=http://host.docker.internal:11434/v1`.

When both `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are configured, OpenAI-compatible calls are instrumented by Langfuse; the native Google Gen AI call records its own Langfuse generation with model input, output, and token usage. This sends prompts and model responses to your Langfuse instance. `LLMPromptHandler` loads the chat prompt named by `LLM_PROMPT_NAME` from Langfuse and formats it into LangChain messages with `build_messages(...)`. The chat prompt must use `question` and `context` variables. Without either credential, it uses a built-in grounded-answer fallback with those variables. If only one credential is set, initialization fails so a configuration mistake is not hidden.

```python
from app.providers.llm import LLMPromptHandler, create_llm_provider

llm = create_llm_provider()
messages = LLMPromptHandler().build_messages(
    question="What does the project do?",
    context="The project is a personal knowledge assistant.",
)
answer = llm.invoke(messages)
```

## Chat

`POST /chat` runs the complete RAG answer pipeline: it embeds the question, performs hybrid retrieval, formats the selected chunks into the configured prompt, invokes the selected LLM, and returns the answer with source citations. Example request:

```json
{
  "question": "What does the project do?",
  "limit": 5,
  "threshold": 0.5,
  "mode": "hybrid"
}
```

The `limit`, `threshold`, and `mode` fields are optional. `mode` can be `hybrid`, `dense`, or `sparse`. The response contains `answer` and a `sources` array with citation labels, source paths, page/section details when available, retrieval scores, and the supporting chunk text.

## Document Ingestion

Upload one or more `.txt`, `.md`, or `.pdf` files to `POST /data/upload` as multipart form fields named `files`. Each file is saved under `data/raw/`; the files are then chunked individually, with all chunks embedded together and sent to Qdrant in one upsert per upload request. The endpoint returns an outcome for each file. Because embedding and storage are shared across the request, a failure in either stage marks every file in that upload batch as failed and returns HTTP `207 Multi-Status`.

The backend creates the Qdrant collection on first use if it does not exist; it does not recreate an existing collection. Configure `QDRANT_COLLECTION_NAME` in `backend/.env` to select a collection.

Example:

```sh
curl -X POST http://localhost:8000/data/upload \
  -F "files=@./notes.md" \
  -F "files=@./report.pdf"
```

## Current Scope

The initial goal is a small, testable RAG application with grounded answers, inspectable citations, and a repeatable evaluation workflow. Features beyond that scope should be added only when they support a clear use case.
