# Verum

Veterinary research assistant: **Next.js** web UI, **Python** RAG/embeddings service, and optional **Clerk** for product auth elsewhere in the stack.

## Quick start

**Web (Next.js)** — from `frontend/web`:

```bash
cd frontend/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Verum chat calls `/api/verum/ask`, which proxies to the Python service.

**Python RAG** — set `VERUM_RAG_BACKEND_URL` (web defaults to `http://localhost:8000` in the API route). Run your FastAPI/uvicorn app from the repo root per your usual command.

## Layout

```
verum/
├── frontend/web/     # Next.js app (Verum UI + API routes)
├── src/              # Python RAG / generation / embedding code
└── ...
```

## Environment (web)

See `frontend/web/README.md` for env vars (`VERUM_RAG_BACKEND_URL`, etc.).
