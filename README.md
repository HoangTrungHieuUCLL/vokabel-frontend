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
                 # regular-verb form derivation, history type counts,
                 # web-push support detection and key decoding
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
- **History is a client-side view.** `/history` lists every word newest
  first and filters by type from the same in-memory cache search uses — no
  extra endpoint. The type chips are ordered by how many words each holds,
  most first, and a type with no words is not offered at all, so the row
  doubles as a breakdown of the collection.
- **The spotlight word comes from the server.** It used to be picked in the
  browser from a hash of the date, but the notification and the app would
  then name different words. The backend records its pick per slot and
  `GET /spotlight` reads it back, so both agree.
- **The PWA shell is push-only.** `public/sw.js` handles `push` and
  `notificationclick` and deliberately registers no `fetch` handler, so
  nothing is cached or served offline — it exists because iOS refuses web
  push to a site without a service worker. The outbox-based write queue and
  background sync are still Phase 3; writes require connectivity.
- **Phase 2 vs Phase 3.** This build covers auth, add, search, history, word
  detail, and the import wizard, plus the offline-capable reference tables
  (no API calls).

## Notifications on iPhone

The backend pushes a word five times a day (see its README). To receive them
on an iPhone the app **must be installed to the home screen** — iOS will not
grant push permission to a normal Safari tab, however capable the browser
looks to feature detection:

1. Open the site in Safari, tap **Share → Add to Home Screen**.
2. Open the app from the home screen icon.
3. Settings → Notifications → **Enable notifications**.

Settings detects an uninstalled iPhone and shows those steps in place rather
than offering a button that would fail. Everywhere else (Android, desktop
Chrome, desktop Safari) the button works straight from a tab.

The backend needs its `VAPID_*` variables set for any of this; without them
Settings says so instead of failing silently.

## Deploying to Railway

Vite environment variables are inlined into the JS bundle at **build**
time, so `VITE_API_BASE_URL` must be set as a build-time variable on the
Railway service (not just a runtime env var) — the Dockerfile accepts it
as a build `ARG`. Point it at the deployed backend's public URL, then
update the backend's `CORS_ORIGINS` to this frontend's URL.

Also set the backend's `FRONTEND_URL` to this frontend's URL, so the link a
notification opens points back here.

Push notifications require HTTPS — Railway's generated domain already is.
