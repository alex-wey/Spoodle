# Verum web

Next.js app for the Verum veterinary research assistant: chat UI, PDF export, and server routes that call the Python RAG backend.

## Setup

```bash
npm install
npm run dev
```

## Environment

| Variable | Purpose |
|----------|---------|
| `VERUM_RAG_BACKEND_URL` | Base URL for the Python ask endpoint (API route defaults to `http://localhost:8000` if unset). |
| `NEXT_PUBLIC_API_BASE_URL` | Optional; set if the app is served under a non-root URL and client fetches need an absolute origin. Usually empty for same-origin `/api/verum/ask`. |

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm run start` — production
- `npm run lint` / `npm run type-check`
