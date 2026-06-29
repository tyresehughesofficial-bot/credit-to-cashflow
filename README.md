# TRIAD T ENTERPRISE AI COMMAND CENTER™

The AI-powered operating system for a **credit repair, funding, financial
education, and lead-generation** company. Luxury black-and-gold, dark-mode,
Apple-level-simple, and fast.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Shadcn-style UI
· Supabase**.

**▶ Go live (flip on all real layers):** see **[docs/GO_LIVE.md](./docs/GO_LIVE.md)** — ordered SQL, function deploys, and secrets.

**▶ Run as a Node.js server:** see **[NODE.md](./NODE.md)** (`npm run build:node && npm run start:node`).

**▶ Live deploy:** see **[DEPLOY.md](./DEPLOY.md)** for a 2-minute Vercel deploy (no env vars needed).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tyresehughesofficial-bot/credit-to-cashflow&project-name=triad-t-command-center)

---

## Modules

| # | Module | Route | What it does |
|---|--------|-------|--------------|
| 1 | **Command Center Dashboard** | `/command-center` | Daily content, lead, client & revenue metrics + charts |
| 2 | **AI Content Engine** | `/content-engine` | Generate TOF/MOF/BOF ideas, reels, carousels, captions, CTAs |
| 3 | **Viral Hook Library** | `/hooks` | Save, categorize, search & tag hooks by psychology type |
| 4 | **Script Writer** | `/script-writer` | Reel, carousel, sales scripts, captions & VSLs |
| 5 | **Credit Knowledge Center** | `/knowledge` | FCRA, FDCPA, Metro 2, CFPB knowledge base + AI assistant |
| 6 | **Client Command Center** | `/clients` | Profiles, rounds, bureaus, negatives, scores, escalations |
| 7 | **Dispute Strategy Builder** | `/disputes` | Bureau strategies, dispute letters, call scripts, CFPB plans |
| 8 | **Funding Engine** | `/funding` | Readiness analyzer, personal & business credit, approval scoring |
| 9 | **Creative Center** | `/creative` | Thumbnail, ChatGPT, Adobe Firefly & Rich Cinema X prompts |
| 10 | **Sales Center** | `/sales` | Objection database, SMS, email templates, consultation scripts |
| 11 | **Analytics Center** | `/analytics` | Content, lead, client & revenue analytics |

## Database (Supabase)

All 14 tables live in [`supabase/schema.sql`](supabase/schema.sql):
`users`, `clients`, `bureaus`, `negative_accounts`, `disputes`,
`content_ideas`, `scripts`, `hooks`, `funding_profiles`, `sales_scripts`,
`analytics`, `revenue`, `tasks`, `automations` — with enums, indexes,
`updated_at` triggers, an auth→profile sync trigger, and baseline RLS.

---

## Getting started

```bash
npm install
cp .env.local.example .env.local   # optional — app runs in demo mode without it
npm run dev                         # http://localhost:3000
```

The app **runs out of the box in demo mode** against bundled mock data
(`src/lib/data/`). No Supabase or AI key is required to explore every module —
in line with the brief: *functionality first, advanced AI integrations second.*

### Connect Supabase (optional)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

### Enable live AI (Phase 2)

The generation logic in `src/lib/generators.ts` is deterministic and fully
functional today. To layer in Claude, implement `generateWithAI` in
`src/lib/ai.ts` and set `ANTHROPIC_API_KEY`. The UI never changes — only the
generation source does.

---

## Architecture

```
src/
├─ app/
│  ├─ (dashboard)/            # authenticated shell: sidebar + topbar
│  │  ├─ dashboard/ content-engine/ hooks/ script-writer/ creative/
│  │  ├─ knowledge/ clients/ disputes/ funding/ sales/ analytics/
│  │  └─ layout.tsx
│  ├─ globals.css             # black & gold luxury theme tokens
│  └─ layout.tsx · page.tsx
├─ components/
│  ├─ ui/                     # shadcn-style primitives (button, card, …)
│  ├─ layout/                 # sidebar, topbar
│  ├─ charts/                 # recharts wrappers
│  └─ shared/                 # page-header, metric-card, copy-button
├─ lib/
│  ├─ data/                   # mock data, metrics, knowledge base
│  ├─ supabase/               # browser + server clients
│  ├─ generators.ts           # content/script/dispute/funding/creative engines
│  ├─ ai.ts                   # Phase-2 Claude seam
│  ├─ navigation.ts           # the 11-module nav
│  └─ utils.ts
└─ types/database.ts          # domain types mirroring the schema
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js ESLint |

> `index.html` at the repo root is the original standalone marketing landing
> page and is independent of the Next.js app.
