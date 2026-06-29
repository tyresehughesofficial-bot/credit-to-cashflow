# TRIAD T — V2 Cross-Reference (Business Operating System → App)

**Phase 2.** Maps the *Business Operating System Overview* (V2 template) against the current Command Center (V1, see `SYSTEM_AUDIT.md`).
**Verdict legend:** ♻️ Reuse (already built) · 🔧 Improve (exists, upgrade it) · 🧱 Build (new) · 🔗 Merge (fold into existing) · 🌐 External (lives in GHL/Notion/JotForm — app links/mirrors only)

---

## 0. The single most important decision: app scope

The V2 doc spans **Notion + GoHighLevel + JotForm + SOPs + the app**. Not all of it should live *in* the app. Recommended boundary:

| Layer | Owner | App's role |
|---|---|---|
| CRM, pipelines, SMS/email automation, booking, payment links | **GoHighLevel** | 🌐 Integrate + mirror pipeline status |
| Contracts / e-sign / intake forms | **JotForm / DisputeFox** | 🌐 Link + track signed status |
| Company wiki / vision / roadmap notes | **Notion** | 🌐 Reference; app mirrors SOPs/IP it needs operationally |
| **Client transformation engine, credit/funding ops, AI copilots, SOP+training delivery, dashboards, affiliate + finance dashboards** | **THIS APP** | ✅ Own it |

> The app is the **operating brain + client-delivery system**. GHL stays the marketing/CRM machine. The app's job is the *Prolific Method* + fulfillment + intelligence + dashboards.

---

## 1. The Spine: The Prolific Method (flagship new module)

> *Credit → Structure → Capital → Growth* — **Diagnose → Repair → Rebuild → Structure → Position → Fund → Grow.**

This is your core IP and it does **not exist yet** as a system. It's the "James Bond" diagnostic: ask questions + read the report → auto-place the client in a phase → generate the full plan. It sits *on top of* the Client Command Center and reuses almost everything already built.

| Capability | Verdict | Reuse from V1 | New work |
|---|---|---|---|
| 7-phase client journey model | 🧱 Build | `clients` table | add `phase` + `phase_status`; phases table |
| Intake questionnaire (credit/LLC/bank/goals) | 🧱 Build | — | dynamic question set + `client_intake` table |
| Auto-diagnosis → phase placement | 🔧 Improve | `credit/engine.ts → diagnose()`, `fundingReadiness()` | phase-placement logic |
| Full personalized plan generator | 🧱 Build | `actionPlan()`, `disputeStrategy()` | plan composer across all 7 phases |
| Phase progress tracker (per client) | 🔧 Improve | Client Command Center rounds UI | phase timeline component |

**Priority: P0 (flagship).** Highest leverage — it's the product mechanism and reuses the most existing code.

---

## 2. Products & Services Catalog

The V2 doc needs every offer defined (name, promise, who, included, price, timeline, deliverables, contract, fulfillment, upsell). None of this is structured in the app today.

| Item | Verdict | Notes |
|---|---|---|
| Products/Offers catalog (data + pages) | 🧱 Build | new `products` table + Offer detail pages |
| The 6 focus offers below | 🧱 Build | each gets a structured record + fulfillment checklist |

### The 5 core offers
| Offer | Verdict | Reuse | Build |
|---|---|---|---|
| **Credit Repair** | 🔧 Improve | Credit System (`/disputes`,`/bureaus`,`/cfpb`,`/knowledge`), Client rounds, `dispute_rounds` | fill `/cfpb`,`/round-tracking`,`/negative-tracking` stubs; intake + R1–R4 SOP |
| **Credit Building** | 🧱 Build | `fundingReadiness()` scorecard | builder checklist, account types, utilization plan, monthly review |
| **Business Funding (DWY/DFY)** | 🔧 Improve | `/funding` 🟡, `fundingReadiness()` | lender-match, bank sequence, funding contract, approval tracking |
| **Business-in-a-Box** | 🧱 Build | — | LLC/EIN/website/brand/GHL/CRM fulfillment tracker (Phase 4 "Structure") |
| **Affiliate System** | 🧱 Build | — | onboarding, tiers, commission, training, tracking, leaderboard, payout |

---

## 3. Internal Company Systems

| System | Verdict | Maps to / Notes |
|---|---|---|
| **GoHighLevel** (CRM, pipelines, automations) | 🌐 External + 🔧 | `/integrations` (stub) → build GHL connection + pipeline mirror |
| **Contracts & Compliance** hub | 🧱 Build | new `contracts` module: agreement templates + JotForm/DisputeFox links + signed-status tracking |
| **SOP Library** | 🔗 Merge → 🔧 | extend **Knowledge Vault** (already has docs/agents) into SOP authoring + generator |
| **Team OS** (roles, weekly workflow, KPIs) | 🧱 Build | depends on **Auth + Roles** (P0 in audit); `/team` module + weekly rhythm board |
| **Training Hub** (Sales/Product/Ops/Brand) | 🔗 Merge → 🧱 | fold into Knowledge Vault or new `/training`; courses + assignments |
| **Marketing & Sales / VSL** | ♻️/🔧 | Content + Intelligence + Sales systems already cover this; VSL = Script Writer; improve, don't rebuild |
| **Finance / Wealth Map** | 🧱 Build | new `/finance`; revenue/expenses/payouts/AR/AP + offer performance; absorbs `/revenue-analytics` stub |
| **AI Command Center / Runner** | 🔧 Improve | the app itself; **Runner = Workflow Builder** (stub) → the cross-module automation backbone |
| **IP Library** | 🔗 Merge | store the Prolific Method, frameworks, scripts in Knowledge Vault as a protected IP collection |

---

## 4. What We REUSE (do NOT rebuild)

Already built and directly serves V2 — keep and extend:
- **Client Command Center** (`/clients`) — becomes the home of the Prolific Method.
- **Credit engine** (`diagnose / actionPlan / disputeStrategy / recommendations / fundingReadiness`).
- **Credit System** pages (Bureaus ✅, Knowledge, Disputes).
- **MyFreeScoreNow integration** (CSV + Edge Function) — feeds Phase 1 Diagnose.
- **Intelligence Engine** (13 routes) + **Content System** + **Creative/Motion/Thumbnail** — the Marketing & Growth layer.
- **Persistence** (`useCollection` local + Supabase) + **49 tables** + **2 Edge Functions**.
- **Design system**, Node-server build, CI/deploy.

---

## 5. New Data Model (tables to add)

```
prolific_phases        (client_id, phase, status, started_at, completed_at, notes)
client_intake          (client_id, question_key, answer, captured_at)
products               (name, promise, audience, included, price, timeline, deliverables, contract_id, upsell)
fulfillment_steps      (client_id, product_id, step, status, owner, due)
contracts              (name, type, url, provider, client_id, status, signed_at)
sops                   (title, category, steps, owner, version)         ← or extend knowledge_documents
training_modules       (title, category, content, assignee_role)
affiliates             (name, tier, link, status, joined_at)
commissions            (affiliate_id, client_id, amount, status, paid_at)
finance_entries        (type, category, amount, offer, date)            ← revenue/expense/payout
team_members           (name, role, owns, kpis)                         ← pairs with auth roles
```
(Several can extend existing tables/schemas rather than net-new.)

---

## 6. Upgraded Architecture (re-grouped nav)

```
TRIAD T AI COMMAND CENTER (V2)
├── Auth / Roles / Login                         🧱 P0
├── Home: Command Center 🔧 · Wealth Map 🧱
├── ★ Prolific Method (Client Journey engine)    🧱 P0  ← flagship
├── Client System        ♻️/🔧  (Clients, Profiles, Rounds, Negatives)
├── Credit System        ♻️/🔧  (Knowledge, Disputes, Bureaus, CFPB)
├── Funding System       🔧/🧱  (Funding, Approval, Business, Personal)
├── Offers & Products    🧱     (catalog + Business-in-a-Box + Credit Building)
├── Affiliate System     🧱
├── Intelligence Engine  ♻️     (13 routes — keep)
├── Content / Writing / Creative ♻️/🔧
├── Sales System         🔧
├── SOPs & Training      🔗/🧱  (extend Knowledge Vault)
├── Contracts            🧱
├── Finance / Wealth Map 🧱
├── Automations / Runner 🧱     (Workflow Builder = Runner backbone)
├── Team OS              🧱
└── System: Settings/Profile/Integrations(GHL)/Logs  🧱
```

---

## 7. Build Roadmap (sequenced, V2 order adapted to the app)

| Wave | Build | Why first |
|---|---|---|
| **W1 — Spine** | ★ Prolific Method engine (intake → diagnose → phase → plan) | Core IP; reuses the most existing code; immediate client value |
| **W2 — Foundation** | Auth + Roles + Team OS; implement `generateWithAI()` (real AI) | Unlocks multi-user + makes "AI" real |
| **W3 — Fulfillment** | Fill Credit/Client/Funding stubs (Rounds, Negatives, CFPB, Approval) + Offers/Products catalog | Completes the live revenue offers |
| **W4 — Operations** | SOP Library + Training Hub (extend Knowledge Vault); Contracts hub | Founder-dependent → system-dependent |
| **W5 — Money & Growth** | Finance / Wealth Map; Affiliate System | Revenue visibility + sales army |
| **W6 — Runner** | Workflow Builder as cross-module automation; GHL integration | Everything talks to everything |

---

## 8. Open Decisions (need your call)
1. **App vs GHL boundary** — ✅ DECIDED: the **app replaces GoHighLevel** too. CRM, pipelines, SMS/email automation, booking, and payment links become in-app modules (added to a later wave). JotForm/contracts still external for e-sign.
2. **SOPs/Training/IP** — host inside **Knowledge Vault** (recommended, reuses RAG/agents) vs separate modules.
3. **Start point** — ✅ DECIDED: **W1 — Prolific Method engine** (flagship, max reuse). Building now.

## 9. CRM build (consequence of "app replaces GHL")
Added to the roadmap (target W6–W7, after the spine + offers):
`crm_contacts · pipelines · pipeline_stages · deals · activities · bookings · message_templates · automations · payments`. Mirrors the 10-stage GHL pipeline (New Lead → … → Upsell). This is a large surface — sequenced after the revenue-critical W1–W5 so the client-transformation engine ships first.
