# Deploy TRIAD T Command Center to a public URL

The app is a standard **Next.js** project and runs in **demo mode with no environment
variables**, so it deploys to Vercel with zero configuration. After deploy you'll get a
public link like `https://triad-t-command-center.vercel.app/command-center`.

---

## Option A — Import the existing repo (recommended)

1. Go to **https://vercel.com/new** and sign in with GitHub.
2. Click **Import** next to **`tyresehughesofficial-bot/credit-to-cashflow`**.
   (If you don't see it, click *Adjust GitHub App Permissions* and grant access to the repo.)
3. **Important — set the branch:** Vercel defaults to the `main` branch, but the app
   currently lives on **`claude/wizardly-hypatia-oQMwZ`**. Either:
   - In the import screen, open **Git Branch** and choose `claude/wizardly-hypatia-oQMwZ`, **or**
   - After the first deploy: **Settings → Git → Production Branch →** set to
     `claude/wizardly-hypatia-oQMwZ` and redeploy.
   *(Or merge this branch into `main` first — see Option C — and skip this step.)*
4. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output handled automatically. **Leave environment variables empty.**
5. Click **Deploy**. In ~1–2 minutes you'll get your URL.
6. Open **`<your-url>/command-center`** (the root `/` also redirects there).

## Option B — One-click button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tyresehughesofficial-bot/credit-to-cashflow/tree/claude/wizardly-hypatia-oQMwZ&project-name=triad-t-command-center)

This clones the branch into a new Vercel project. Framework + build settings are detected
automatically; no env vars needed.

## Option C — Merge to `main` for automatic production deploys

`main` is currently empty. If you merge this branch into `main`, Vercel's default
production deployments "just work" with no branch juggling. Tell me and I'll fast-forward
`main` for you (with your permission), or you can open a PR from
`claude/wizardly-hypatia-oQMwZ` → `main` and merge it.

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
