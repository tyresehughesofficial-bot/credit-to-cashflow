# TRIAD T — Go-Live Checklist

Flip the whole platform on, in order. Everything is **optional and additive** —
the app already works in demo/local mode. Each step unlocks one "real" layer.
Do them top to bottom; skip any you don't need yet.

> 🔐 Golden rule: **secrets go in Supabase → Edge Functions → Secrets** (or your
> host's env), **never** in the repo, **never** pasted in chat. Only the two
> `NEXT_PUBLIC_` values are public.

---

## 0. Prerequisites
- Supabase project (you have one: `ttbcxfgopvvjkqmquqfh`).
- Supabase CLI: `npm i -g supabase` → `supabase login` → `supabase link --project-ref ttbcxfgopvvjkqmquqfh`.
- The repo cloned locally (for CLI function deploys).

---

## 1. Database — run SQL (Supabase → SQL Editor)
Run each file's contents once. Order doesn't matter much, but this is safe:

| # | File | Creates |
|---|------|---------|
| 1 | `supabase/credit_system_schema.sql` | clients, credit_reports, negative_accounts, inquiries, dispute_rounds, ai_diagnosis |
| 2 | `supabase/mfsn_integration_schema.sql` | client_sources, credit_utilization, public_records, personal_information, import_logs (+ client cols) |
| 3 | `supabase/prolific_schema.sql` | prolific_journeys |
| 4 | `supabase/crm_schema.sql` | crm_contacts, crm_activities, crm_bookings, crm_deals, crm_payments |
| 5 | `supabase/auth_schema.sql` | profiles + roles + first-user-is-Admin trigger |
| 6 | `supabase/intelligence_schema.sql` | intelligence tables (competitors, hooks, etc.) |
| 7 | `supabase/vault_schema.sql` | knowledge_documents, document_agents |
| 8 | `supabase/creative_schema.sql` + `creative_assets.sql` | creative projects + assets + storage bucket |
| 9 | `supabase/thumbnail_schema.sql` | thumbnail_requests |
| 10 | `supabase/cron_automations.sql` | **run AFTER deploying run-automations (step 3 below)** — schedules it every 15 min |

✅ Each should say **"Success. No rows returned."** (The app works on
localStorage until a table exists, then write-through syncs to it.)

---

## 2. Frontend env (public — safe)
Already baked into the code as defaults, but set them as **GitHub Actions repo
secrets** (Pages) and/or **Vercel env vars** so they're explicit:
```
NEXT_PUBLIC_SUPABASE_URL=https://ttbcxfgopvvjkqmquqfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 3. Edge Functions — deploy + secrets
Deploy each (all use `--no-verify-jwt` because the publishable key isn't a JWT).
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are **auto-injected** — never set them.

| Function | Deploy | Secrets to set | Unlocks |
|----------|--------|----------------|---------|
| **generate-text** | `supabase functions deploy generate-text --no-verify-jwt` | `ANTHROPIC_API_KEY` (opt: `CLAUDE_MODEL`) | AI Strategist, Content/Script AI, **Knowledge Vault RAG** |
| **mfsn_import** | `supabase functions deploy mfsn_import --no-verify-jwt` | `MFSN_API_KEY` (+ `MFSN_BASE_URL`, `MFSN_AUTH_HEADER`, `MFSN_EP_*` once the company sends the API spec) | MyFreeScoreNow live import |
| **send-message** | `supabase functions deploy send-message --no-verify-jwt` | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `SENDGRID_API_KEY`, `SENDGRID_FROM` | CRM "Send & log" (SMS/email) |
| **run-automations** | `supabase functions deploy run-automations --no-verify-jwt` | (reuses Twilio secrets) | Backend automation engine (then run `cron_automations.sql`) |
| **stripe-checkout** | `supabase functions deploy stripe-checkout --no-verify-jwt` | `STRIPE_SECRET_KEY` (`sk_test_…` first) | CRM "Create payment link" |
| **stripe-webhook** | `supabase functions deploy stripe-webhook --no-verify-jwt` | `STRIPE_WEBHOOK_SECRET` (`whsec_…`) | Auto-mark payments **paid** |
| **generate-image** | `supabase functions deploy generate-image --no-verify-jwt` | `FAL_KEY` (+ `ANTHROPIC_API_KEY`, opt `OPENAI_API_KEY`) | Motion Graphics image gen |

Set a secret:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
# ...etc
```

### Stripe webhook wiring (after deploying stripe-webhook)
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL: `https://ttbcxfgopvvjkqmquqfh.functions.supabase.co/stripe-webhook`
3. Event: **`checkout.session.completed`**.
4. Copy the **Signing secret** (`whsec_…`) → `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`.

---

## 4. Auth + Team
1. Open `/login` on the live site → **Sign up** with your email → you become **Administrator** (first user).
2. Have team sign up (they default to **Guest**); promote them in the `profiles` table (`role` column) or Team OS.
3. Each user can enable **2FA** in **Profile → Enable 2FA** (scan QR in an authenticator app).

---

## 5. Verify (quick tests)
```bash
SUPA="https://ttbcxfgopvvjkqmquqfh.supabase.co"; KEY="sb_publishable_j4YRaaLd3IfXHvu3hLAPpQ_NEImZXgV"
# AI
curl -s -X POST "$SUPA/functions/v1/generate-text" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"prompt":"say hello in 3 words"}'; echo
# MFSN demo pipeline
curl -s -X POST "$SUPA/functions/v1/mfsn_import" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"action":"import","demo":true,"firstName":"Test","lastName":"Client"}'; echo
```
In the app: **Prolific → AI Strategist**, **Knowledge Vault → ask a question** (RAG),
**CRM → Send & log / Create payment link**, **Profile → Enable 2FA**.

---

## 6. Hosting
- **GitHub Pages (current):** stays live automatically on push to `main`. Static — no API routes/middleware.
- **Vercel (optional, for server features):** import the repo at vercel.com/new → Deploy. Adds security headers + makes API routes/middleware possible. See `DEPLOY.md`.
- **Server auth middleware (Vercel-only):** copy `docs/vercel-middleware.example.ts.txt` → `src/middleware.ts` and switch to cookie sessions (steps in that file). **Do not** add it while you keep the Pages deploy — it breaks static export.

---

## 7. Still pending (not blockers)
- 🔴 **MyFreeScoreNow live pull** — waiting on the company's API endpoint/spec. CSV roster import works today; the moment you have the spec, set the `MFSN_*` secrets (or I update `mfsn_import`'s mapping).
- 🟡 Server middleware (Vercel-only), event-driven automation triggers — see `docs/BACKLOG.md`.

---

### One-shot summary (copy/paste, fill the blanks)
```bash
supabase link --project-ref ttbcxfgopvvjkqmquqfh
for fn in generate-text mfsn_import send-message run-automations stripe-checkout stripe-webhook generate-image; do
  supabase functions deploy $fn --no-verify-jwt
done
supabase secrets set ANTHROPIC_API_KEY=__ STRIPE_SECRET_KEY=__ STRIPE_WEBHOOK_SECRET=__ \
  TWILIO_ACCOUNT_SID=__ TWILIO_AUTH_TOKEN=__ TWILIO_FROM=__ SENDGRID_API_KEY=__ SENDGRID_FROM=__ FAL_KEY=__
# then run cron_automations.sql, sign up at /login, enable 2FA.
```
