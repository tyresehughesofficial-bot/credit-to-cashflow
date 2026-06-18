# Running TRIAD T as a Node.js app

The exact same codebase and UI builds two ways. Nothing about the design or
features changes — only the runtime.

| Target | Command | Output | Runtime |
|--------|---------|--------|---------|
| **Node.js server** (default) | `npm run build:node` | `.next/standalone/server.js` | Real Node.js server |
| **Static site** (GitHub Pages) | `npm run build:pages` | `out/` | Static files, no server |

## Run it as a Node.js server

```bash
npm install
npm run build:node      # next build (output: standalone) + copies static assets
npm run start:node      # node .next/standalone/server.js
# → http://localhost:3000
```

For local development with hot-reload:

```bash
npm run dev             # http://localhost:3000
```

For a simple production server without the standalone bundle you can also use:

```bash
npm run build
npm start               # next start
```

## Why a Node.js server (vs. static export)

Running as a Node server unlocks things static GitHub Pages can't do:

- **API routes** — add `src/app/api/<name>/route.ts` handlers (e.g. an
  `mfsn_import` endpoint) that run on the server.
- **Server-side secrets** — read `process.env.MFSN_API_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` on the server; they are
  never shipped to the browser.
- **SSR / dynamic rendering** when you need it.

The browser code is unchanged: it still uses the public Supabase URL + anon
key and the local-first `useCollection` store, so the app runs with or without
a backend.

## Environment variables

Copy `.env.local.example` → `.env.local` and fill in values. Public values use
the `NEXT_PUBLIC_` prefix; secrets do **not** (and are only read server-side).

## Docker

A `Dockerfile` is included (multi-stage, standalone). To build and run:

```bash
docker build -t triad-t .
docker run -p 3000:3000 --env-file .env.local triad-t
```

This image runs anywhere Docker runs (Render, Railway, Fly.io, a VPS, etc.).

## Hosting (decide later)

- **Vercel** — zero-config for Next.js; API routes become serverless functions.
- **Render / Railway / Fly.io** — deploy the Docker image or the standalone
  build; set a start command of `node .next/standalone/server.js`.
- **GitHub Pages** — still works for the *static* preview via
  `npm run build:pages` (the Actions workflow already does this). Note: Pages
  cannot run the Node server or API routes.
