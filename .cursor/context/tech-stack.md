# Verum tech stack

- **Web:** Next.js 15 (App Router), React 19, Tailwind CSS, Radix/shadcn-style UI in `frontend/web`.
- **RAG / ML:** Python under `src/` (embedding, retrieval, answer generation). The Next route `app/api/verum/ask/route.ts` forwards to the service at `VERUM_RAG_BACKEND_URL`.
- **Monorepo note:** Root `package.json` may list `frontend/web` as a workspace for tooling; develop the app from `frontend/web` unless you use root scripts.

Legacy Spoodle (separate Express + Prisma API) has been removed from this repository.
