# TRIAD T — Improvement Backlog (running log)

Everything deferred while we build forward. We come back to these; nothing is lost.
Status: 🔴 not started · 🟡 partial · ✅ done. Cross-ref: `SYSTEM_AUDIT.md`, `V2_CROSS_REFERENCE.md`.

> Rule: when we ship a wave but leave something thinner than ideal, it gets logged here with enough context to resume.

---

## Foundation / cross-cutting
- 🔴 **Real AI** — implement `lib/ai.ts → generateWithAI()` (Claude Edge Function); wire behind existing seams (content, scripts, intelligence, knowledge-vault RAG, credit diagnosis).
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
- 🔴 Credit/Client: Round Tracking, Negative Tracking, CFPB Center, Client Profiles.
- 🔴 Funding: Approval Readiness (engine exists — just wire), Business Funding, Personal Funding.
- 🔴 Writing: Caption Builder, Description Builder, CTA Generator (logic in `lib/generators`).
- 🔴 Sales: Objection Handling, SMS/Email Templates, Consultation Scripts.
- 🔴 Analytics: Content/Lead/Revenue Analytics.
- 🔴 Content Ops: News & Trend Center.
- 🔴 Automations: Automations, Scheduled Tasks, Workflow Builder (= Runner backbone).
- 🔴 System: Settings, Profile, Integrations (GHL), Logs.

## New V2 modules to build
- 🔴 Offers & Products catalog (+ Business-in-a-Box, Credit Building offers).
- 🔴 Affiliate System (tiers, commissions, onboarding, leaderboard, payouts).
- 🔴 Finance / Wealth Map (revenue/expenses/payouts/AR/AP + offer performance).
- 🔴 SOP Library + Training Hub + IP Library (fold into Knowledge Vault).
- 🔴 Contracts hub (JotForm/DisputeFox links + signed-status tracking).
- 🔴 **CRM (app replaces GHL)** — contacts, 10-stage pipelines, deals, activities, bookings, message templates, automations, payments. Large; sequenced W6–W7.

## Known polish / tech debt
- 🟡 Several pages still use static `lib/data/mock` (command-center, content-engine, disputes, hooks, sales, script-writer) — migrate to live collections.
- 🟡 Command Center dashboard metrics not computed from live client/credit data; no alerts.
- 🟡 `intelligence/bureaus` + `intelligence/cfpb` overlap `/bureaus` + `/cfpb` — consider merge.
