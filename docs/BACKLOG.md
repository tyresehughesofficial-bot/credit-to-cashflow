# TRIAD T — Improvement Backlog (running log)

Everything deferred while we build forward. We come back to these; nothing is lost.
Status: 🔴 not started · 🟡 partial · ✅ done. Cross-ref: `SYSTEM_AUDIT.md`, `V2_CROSS_REFERENCE.md`.

> Rule: when we ship a wave but leave something thinner than ideal, it gets logged here with enough context to resume.

---

## Foundation / cross-cutting
- 🟡 **Real AI** — DONE: `generate-text` Edge Function (Claude) + `lib/ai.ts → aiText()` seam + reusable `<AIPanel>`; wired into Prolific AI Strategist. TODO: roll AI into content engine, script writer, knowledge-vault RAG answers, credit diagnosis, intelligence — each is now a one-component drop-in.
- 🟡 **Persistence** — confirm/apply ALL Supabase schemas in the live project (only Credit + MFSN + Prolific + auth so far). Tighten RLS from `using(true)` to `auth.uid()` org-membership once auth is live.
- 🟡 **Auth (W2)** — see Auth section below for what's scaffolded vs deferred.
- 🔴 **MyFreeScoreNow live report pull** — blocked on the real API endpoint (token model confirmed; endpoint URL still needed). CSV roster import works today.

## Prolific Method (deepening)
- 🔴 Round 2 (Method-of-Verification) + Round 3 (procedural) letter generators.
- 🔴 "Letters sent" log per client → feed Round Tracking + dispute_rounds.
- 🔴 Structure phase → real Business-in-a-Box fulfillment tracker (owners, due dates, status), not just a doc list.
- 🔴 Persist phase artifacts (so generated letters are saved, not regenerated each visit).

## Auth / Roles / Team (W2 — see commit)
- 🟡 **2FA / MFA** — UI toggle scaffolded; TOTP enrollment + verification flow deferred.
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
- 🟡 Automations, Scheduled Tasks, Workflow Builder (Runner) — built as functional UIs; live execution engine still TODO.
- ✅ System: Settings, Profile, Integrations, Logs — built. (Integrations: GHL connect pending W6.)

## New V2 modules to build
- ✅ Offers & Products catalog — built (W3). 🔴 Per-offer fulfillment pages + Business-in-a-Box tracker still to build.
- ✅ Affiliate System — built (W5): tiers, commissions, leaderboard, payouts. TODO: affiliate onboarding portal + automated payout SOP.
- ✅ Finance / Wealth Map — built (W5): revenue/expenses/payouts/profit + revenue-by-offer. TODO: AR/AP, taxes, cash reserves, monthly trend chart; merge /revenue-analytics.
- ✅ SOP Library (+AI generator), Training Hub, IP Library — built (W4) as dedicated Operations Hub pages. TODO: deeper Knowledge Vault/RAG integration of SOPs.
- ✅ Contracts hub — built (W4). TODO: per-client contract assignment + e-sign webhook status.
- 🟡 **CRM (app replaces GHL)** — built (W6): contacts, 10-stage pipeline (kanban), activity log, bookings (src/lib/crm + crm_schema.sql). TODO: drag-drop, deals/payments, message-template sending, automation execution, GHL data import.

## Known polish / tech debt
- 🟡 Several pages still use static `lib/data/mock` (command-center, content-engine, disputes, hooks, sales, script-writer) — migrate to live collections.
- 🟡 Command Center dashboard metrics not computed from live client/credit data; no alerts.
- 🟡 `intelligence/bureaus` + `intelligence/cfpb` overlap `/bureaus` + `/cfpb` — consider merge.
