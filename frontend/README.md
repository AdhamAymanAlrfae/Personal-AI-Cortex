# Personal AI Cortex frontend

The Streamlit app is an independent frontend for the existing FastAPI chat API.
It sends questions to `POST /chat` and displays only the answer and source
metadata returned by that endpoint. Custom UI styling lives in `styles.css`;
the color palette is configured in `.streamlit/config.toml`.

## Local development

1. Start the backend at `http://localhost:8000` and make sure it has its required
   provider and vector-store configuration.
2. From the repository root, sync the frontend's independent `uv` project.
   Then copy the example config and run Streamlit from `frontend/` so it loads
   both the local `.env` and theme config:

   ```sh
   uv sync --project frontend
   cd frontend
   cp .env.example .env
   uv run streamlit run app.py
   ```

`APP_ENV=dev` always uses `http://localhost:8000`. For PowerShell:

```powershell
Set-Location frontend
Copy-Item .env.example .env
uv run streamlit run app.py
```

For production, change `.env` to `APP_ENV=pro` and set `BACKEND_URL` to the
public backend address. The app loads this file automatically. On Streamlit
Community Cloud, set `APP_ENV` and `BACKEND_URL` in the app's Secrets settings
instead. Never commit `.env` or deployment secrets.

## Deployment

Deploy this directory as a Streamlit Community Cloud app with `app.py` as the
entry point and `requirements.txt` for dependencies. A deployed frontend does
not host or deploy the FastAPI backend: `BACKEND_URL` must point to a running,
publicly reachable backend. This app calls the backend server-side, so browser
CORS restrictions do not apply.

## Document uploads

Upload and ingestion controls are intentionally omitted. Although the backend
provides `POST /data/upload` and `POST /data/ingest`, those routes do not require
authentication or authorization. Exposing them through a public portfolio UI
would let visitors upload files and trigger ingestion. Uploading and ingestion
are also separate backend operations; the chat UI remains independent of both.
