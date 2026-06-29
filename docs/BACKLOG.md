# TRIAD T — Improvement Backlog (running log)

Everything deferred while we build forward. We come back to these; nothing is lost.
Status: 🔴 not started · 🟡 partial · ✅ done. Cross-ref: `SYSTEM_AUDIT.md`, `V2_CROSS_REFERENCE.md`.

> Rule: when we ship a wave but leave something thinner than ideal, it gets logged here with enough context to resume.

---

## Foundation / cross-cutting
- ✅ **Real AI** — `generate-text` + `aiText()` + `<AIPanel>` wired into Prolific Strategist, Content Engine, Script Writer, SOP Generator, writing tools, **credit-diagnosis Second Opinion**, and **Knowledge Vault real RAG** (Claude grounded in retrieved source summaries, deterministic fallback). TODO (optional): vector embeddings for retrieval (pgvector + embeddings API); intelligence scoring AI.
- 🟡 **Persistence** — confirm/apply ALL Supabase schemas in the live project (only Credit + MFSN + Prolific + auth so far). Tighten RLS from `using(true)` to `auth.uid()` org-membership once auth is live.
- 🟡 **Auth (W2)** — see Auth section below for what's scaffolded vs deferred.
- 🔴 **MyFreeScoreNow live report pull** — blocked on the real API endpoint (token model confirmed; endpoint URL still needed). CSV roster import works today.

## Prolific Method (deepening)
- 🔴 Round 2 (Method-of-Verification) + Round 3 (procedural) letter generators.
- 🔴 "Letters sent" log per client → feed Round Tracking + dispute_rounds.
- 🔴 Structure phase → real Business-in-a-Box fulfillment tracker (owners, due dates, status), not just a doc list.
- 🔴 Persist phase artifacts (so generated letters are saved, not regenerated each visit).

## Auth / Roles / Team (W2 — see commit)
- ✅ **2FA / MFA (TOTP)** — Supabase MFA: enroll (QR+secret) & manage in Profile; AuthGate enforces the AAL2 challenge on protected routes. Works on both hosts.
- 🔴 **Server-side route protection** — current gate is client-side (fine for static host; RLS protects data). Add middleware when on the Node-server host.
- 🔴 **Granular permissions** — per-action (edit vs view) enforcement; W2 ships section-level nav gating only.
- 🔴 **Team invites / user management UI** — admin invites users, assigns roles (currently via signup + profiles table).
- 🟡 **Weekly workflow automation** — Team OS shows the Mon/Wed/Fri rhythm; recurring task automation deferred to Automations wave.

## Stubs still to build (from SYSTEM_AUDIT)
- ✅ Round Tracking, Negative Tracking, CFPB Center, Client Profiles — built.
- ✅ Approval Readiness, Business Funding, Personal Funding — built.
- ✅ Writing: Caption/Description/CTA builders — built (AI generators + fallback).
- ✅ Sales: Objection Handling, SMS/Email Templates, Consultation Scripts — built (template libraries).
- ✅ Analytics: Content/Lead/Revenue Analytics — built (metrics + charts).
- ✅ Content Ops: News & Trend Center — built.
- 🟡 Automations — UIs + manual 'Run now' + run-automations fn + **pg_cron schedule (cron_automations.sql) — runs every 15 min**. TODO: event-driven DB triggers (new-lead webhook), Workflow Builder live execution.
- ✅ System: Settings, Profile, Integrations, Logs — built. (Integrations: GHL connect pending W6.)

## New V2 modules to build
- ✅ Offers & Products catalog — built (W3). 🔴 Per-offer fulfillment pages + Business-in-a-Box tracker still to build.
- ✅ Affiliate System — built (W5): tiers, commissions, leaderboard, payouts. TODO: affiliate onboarding portal + automated payout SOP.
- ✅ Finance / Wealth Map — built (W5): revenue/expenses/payouts/profit + revenue-by-offer. TODO: AR/AP, taxes, cash reserves, monthly trend chart; merge /revenue-analytics.
- ✅ SOP Library (+AI generator), Training Hub, IP Library — built (W4) as dedicated Operations Hub pages. TODO: deeper Knowledge Vault/RAG integration of SOPs.
- ✅ Contracts hub — built (W4). TODO: per-client contract assignment + e-sign webhook status.
- 🟡 **CRM (app replaces GHL)** — built (W6+): contacts, 10-stage pipeline, deals, payments, activity, bookings, real SMS/email send (send-message fn, Twilio/SendGrid) with simulated fallback, manual automation execution. TODO: drag-drop, live Stripe charging, scheduled/event automation (backend cron), GHL data import.

## Known polish / tech debt
- 🟡 Mock data: ✅ Command Center now LIVE (KPIs/alerts/bureau avgs/revenue from real collections). Remaining mock usage (content-engine, disputes, hooks, sales, script-writer) is legitimate tool seed-content, not stale dashboards.
- ✅ Command Center — live metrics + alerts (needs-attention, funding-ready, pending payments) wired.
- 🟡 `intelligence/bureaus` + `intelligence/cfpb` overlap `/bureaus` + `/cfpb` — consider merge.

## Blocked — cannot be completed by me
- 🔴 MyFreeScoreNow live report pull — needs the real API endpoint URL from your Secure API Control.
- 🟡 Server-side route middleware — ready-to-activate code at docs/vercel-middleware.example.ts.txt (Vercel-only; needs cookie sessions). Vercel security headers shipped (next.config). Client AuthGate + RLS + 2FA cover security today.
- 🟡 Stripe — stripe-checkout + lib/stripe + CRM 'Create payment link' + **stripe-webhook (auto-mark paid via metadata.payment_id)**. Needs STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET. Live once secrets set.
