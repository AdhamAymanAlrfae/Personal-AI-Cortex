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
- Use `.env.example` to document required configuration without real credentials.
- Do not commit private documents, restricted datasets, or large generated artifacts unless there is a clear reason and permission to share them.

## Current Scope

The initial goal is a small, testable RAG application with grounded answers, inspectable citations, and a repeatable evaluation workflow. Features beyond that scope should be added only when they support a clear use case.
