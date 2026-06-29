# Deploy TRIAD T Command Center to a public URL

The app is a standard **Next.js** project and runs in **demo mode with no environment
variables**, so it deploys to Vercel with zero configuration. After deploy you'll get a
public link like `https://triad-t-command-center.vercel.app/command-center`.

---

> ✅ **`main` is deploy-ready.** The full app now lives on the default `main` branch, so
> Vercel works with **zero branch configuration** — just Import and Deploy.

## Option A — Import the existing repo (recommended)

1. Go to **https://vercel.com/new** and sign in with GitHub.
2. Click **Import** next to **`tyresehughesofficial-bot/credit-to-cashflow`**.
   (If you don't see it, click *Adjust GitHub App Permissions* and grant access to the repo.)
3. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output handled automatically. **Leave environment variables empty.**
4. Click **Deploy**. In ~1–2 minutes you'll get your URL.
5. Open **`<your-url>/command-center`** (the root `/` also redirects there automatically).

## Option B — One-click button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tyresehughesofficial-bot/credit-to-cashflow&project-name=triad-t-command-center)

This clones the repo into a new Vercel project. Framework + build settings are detected
automatically; no env vars needed.

---

## Going beyond demo mode (optional, later)

To switch from demo data to live Supabase data + AI generation, add these in
**Vercel → Settings → Environment Variables** and redeploy:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for seeding/admin |
| `ANTHROPIC_API_KEY` | Enables AI content/script/dispute generation |

The app detects whether Supabase is configured and shows a **Demo mode** badge until you
add these — so it's safe to deploy first and wire data later.

---

## Running as a real Node server (Vercel / Docker / VPS)

The same code deploys three ways (see `next.config.mjs`):

| Host | How | Server features |
|------|-----|-----------------|
| **Vercel** | Import repo → Deploy (auto-detected) | ✅ API routes, middleware, SSR |
| **Docker / VPS** | `npm run build:node` → `npm run start:node` (see `NODE.md`) | ✅ same, self-hosted |
| **GitHub Pages** | `npm run build:pages` (CI does this) | ❌ static only |

### Environment variables (Vercel → Project → Settings → Environment Variables)
Public (safe in the browser):
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```
The app runs in demo mode without these. Server-side secrets (AI, messaging,
MyFreeScoreNow) stay in **Supabase Edge Function secrets**, not here.

### What the Node host unlocks (vs. static GitHub Pages)
Deploying to Vercel/Docker makes these previously host-blocked items *possible*
(see `docs/BACKLOG.md`):
- **API routes** — `src/app/api/<name>/route.ts` with server-side secrets.
- **Server-side auth middleware** — `src/middleware.ts` guarding routes (requires
  switching to cookie-based Supabase sessions via `@supabase/ssr`).
- **2FA / TOTP** — Supabase MFA enrollment (works client-side too, but cleaner
  with server sessions).
- **Cron / scheduled jobs** — Vercel Cron to invoke `run-automations`.

> The current client-side auth + RLS keep things secure on either host; the
> above are upgrades the Node host enables, not requirements.
