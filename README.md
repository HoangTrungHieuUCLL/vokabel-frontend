# vokabel-frontend

Mobile-first React frontend for the Vokabel vocabulary logger. Talks to
`vokabel-backend` over HTTP only — the only backend address is
`import.meta.env.VITE_API_BASE_URL`, no hardcoded hostnames anywhere.

## Stack

Vite + React 18 (React 19 runtime) + TypeScript, React Router, Dexie
(IndexedDB) as the local search cache, Tailwind v4. No component library —
everything under `src/components/ui` is hand-rolled.

## Local setup

Requires the backend running locally first (see `vokabel-backend`'s README).

```bash
npm install
cp .env.example .env   # points at http://localhost:8000 by default
npm run dev
```

Open http://localhost:5173. Log in with the credentials configured on the
backend.

### Tests

```bash
npm run test    # vitest: search-key normalization, fuzzy search ranking,
                 # regular-verb form derivation
npm run build   # tsc -b && vite build -- also the type-check
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend, e.g. `https://vokabel-backend-production.up.railway.app`. Baked into the build at build time (Vite inlines `import.meta.env.*`), so it must be set as a **build-time** variable, not just a runtime one. |

## Architecture notes

- **Search is entirely client-side.** All non-deleted words are loaded once
  into a Dexie-backed in-memory cache; searching never hits the network.
  `src/lib/search.ts` implements the ranked pipeline (exact → prefix →
  bounded Levenshtein → substring in meaning/example) from the spec, with
  the typo tolerance scaling per-candidate by word length.
- **Delete-with-undo needs no backend support.** `scheduleDelete` hides the
  word immediately and only fires the real `DELETE` request after a 5s
  undo window — there's no "restore" endpoint, so undo is purely a client-
  side deferred call.
- **Phase 2 vs Phase 3.** This build covers auth, add, search, word detail,
  and the import wizard, plus the offline-capable reference tables (no API
  calls). The outbox-based write queue, background sync, and installable
  PWA shell are Phase 3 and not yet implemented — writes currently require
  connectivity.

## Deploying to Railway

Vite environment variables are inlined into the JS bundle at **build**
time, so `VITE_API_BASE_URL` must be set as a build-time variable on the
Railway service (not just a runtime env var) — the Dockerfile accepts it
as a build `ARG`. Point it at the deployed backend's public URL, then
update the backend's `CORS_ORIGINS` to this frontend's URL.
