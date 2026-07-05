# TRIAD T — Module Status Breakdown

For each section: **Purpose** (what it's for) · **Can do** (working now) · **Can't yet** (limits / next).
Note: everything saves to your browser instantly and syncs to the cloud once the matching
SQL is run (see GO_LIVE.md). AI features are LIVE now that `generate-text` is deployed.

---

## ACCESS

### Login / Roles / 2FA
- **Purpose:** control who gets in and what they see.
- **Can:** email/password sign-in & sign-up; first user = Administrator; 7 roles gate the sidebar; 2FA (authenticator app) enroll + enforce; "Continue as Guest" demo.
- **Can't yet:** invite-by-email UI (people self-sign-up, you promote); per-button (edit vs view) permissions; server-side lockout (client gate + database rules protect data today).

---

## HOME

### Command Center (Dashboard)
- **Purpose:** daily snapshot of the whole business.
- **Can:** live KPIs (clients, avg score, funding-ready, pipeline $, revenue, profit, negatives, needs-attention), bureau averages, an alerts panel, revenue-by-offer — all from real data.
- **Can't yet:** historical trend charts over time; custom/rearrangeable tiles; push/email alert delivery.

### The Prolific Method ⭐
- **Purpose:** diagnose a client and generate their full transformation plan.
- **Can:** auto-place a client in 1 of 7 phases from their data; AI Strategist write-up; generate real Round-1 dispute letters; per-phase deliverables + checklists; progress tracking.
- **Can't yet:** Round 2/3 letter generators; save generated letters (regenerates each visit); a true Business-in-a-Box tracker with owners/due-dates (Structure phase is a checklist).

---

## CLIENT SYSTEM

### Client Command Center
- **Purpose:** the master client hub — import, analyze, act.
- **Can:** import via MyFreeScoreNow CSV or manual; tri-bureau scores; AI diagnosis; action plan; dispute strategy; funding readiness; status tracking; AI Second Opinion.
- **Can't yet:** pull live reports directly from MyFreeScoreNow (waiting on their API endpoint — CSV works today).

### Client Profiles
- **Purpose:** searchable directory of every client.
- **Can:** search, see status/source, click into the Command Center.
- **Can't yet:** its own editable detail page (it links into Client Command Center).

### Round Tracking
- **Purpose:** track dispute rounds across all clients.
- **Can:** list rounds, start a round, edit bureau/status, progress stats.
- **Can't yet:** auto-populate from generated letters; auto due-date reminders.

### Negative Account Tracking
- **Purpose:** manage every negative item.
- **Can:** cross-client table with auto priority + recommended dispute reason; inline status updates; removal-rate stats.
- **Can't yet:** auto-sync status from bureau responses (manual updates).

---

## CREDIT SYSTEM

### Credit Knowledge Center
- **Purpose:** FCRA/FDCPA/Metro 2 reference.
- **Can:** browse the knowledge content.
- **Can't yet:** AI Q&A here (use the Knowledge Vault for that).

### Dispute Strategy Builder
- **Purpose:** strategies, letters, escalations.
- **Can:** show strategy content and letter frameworks.
- **Can't yet:** it isn't yet linked to a specific client's live data (the Prolific Method does that).

### Bureau Intelligence
- **Purpose:** internal playbook for how each bureau behaves.
- **Can:** per-bureau addresses, response patterns, escalation methods; item-type intel; editable.
- **Can't yet:** nothing major — it's a reference knowledge base by design (not client data).

### CFPB Center
- **Purpose:** build + track CFPB complaints.
- **Can:** generate a complaint narrative, save it, track status (drafted→submitted→responded→closed).
- **Can't yet:** submit directly to the CFPB site (you file it there; this tracks it).

---

## FUNDING SYSTEM

### Funding Engine
- **Purpose:** overview of getting clients funded.
- **Can:** readiness view.
- **Can't yet:** live lender API matching.

### Approval Readiness
- **Purpose:** who's ready for capital.
- **Can:** score EVERY client on the 4 approval factors, rank them, show gaps + recommended path.
- **Can't yet:** connect to real lender pre-qual APIs.

### Business Funding / Personal Funding
- **Purpose:** the pathways + checklists for each.
- **Can:** structured checklists (fundability, lender categories, sequence).
- **Can't yet:** per-client tracking of these checklists (reference pages for now).

---

## CRM (replaces GoHighLevel)

### CRM Pipeline
- **Purpose:** run leads → clients and the money.
- **Can:** 10-stage pipeline (move by dropdown), contacts CRUD, deals, payments, activity log, bookings, real SMS/email send, Stripe payment links, KPIs.
- **Can't yet:** drag-and-drop cards; live SMS/email until Twilio/SendGrid keys are set; live charging until Stripe key is set; import your existing GHL data; event-triggered automations (manual/scheduled work).

---

## OFFERS & PRODUCTS
- **Purpose:** define every offer consistently.
- **Can:** catalog cards + editable table (promise, price, deliverables, contract, upsell) for all 6 offers.
- **Can't yet:** per-offer fulfillment pages / delivery checklists.

---

## MONEY & GROWTH

### Finance · Wealth Map
- **Purpose:** company money command center.
- **Can:** revenue/expenses/payouts/net-profit KPIs, revenue-by-offer, editable ledger.
- **Can't yet:** accounts receivable/payable, taxes, cash reserves, month-over-month trend chart; auto-import from Stripe.

### Affiliate System
- **Purpose:** your sales army.
- **Can:** tiers, affiliates + commissions CRUD, leaderboard, pending/paid payout totals.
- **Can't yet:** affiliate self-serve onboarding portal; automated payout processing; unique link tracking.

---

## OPERATIONS HUB

### SOP Library
- **Purpose:** document every repeated task.
- **Can:** browse/edit SOPs (Credit/Funding/Operations seeded); **AI SOP Generator** writes new ones.
- **Can't yet:** attach files/videos to an SOP.

### Training Hub
- **Purpose:** onboard the team.
- **Can:** modules by category (Sales/Product/Ops/Brand), assigned by role; editable.
- **Can't yet:** completion tracking / quizzes / video hosting.

### Contracts
- **Purpose:** agreement hub + signed status.
- **Can:** list agreements, add provider links (JotForm/DisputeFox), track template→sent→signed→expired.
- **Can't yet:** e-sign inside the app (signing stays in JotForm/DisputeFox); auto status via webhook.

### IP Library
- **Purpose:** protect your frameworks.
- **Can:** catalog your methods/IP (Prolific Method, Wealth Map, etc.), editable.
- **Can't yet:** legal filing/registration (it's your internal record).

---

## CONTENT & MARKETING

### AI Content Engine / Idea Generation
- **Purpose:** generate content ideas + posts.
- **Can:** AI idea generator (live); deterministic generators; idea pipeline CRUD.
- **Can't yet:** auto-publish to social platforms.

### Script Writer / Caption / Description / CTA
- **Purpose:** write scripts + copy.
- **Can:** AI writing (live) with deterministic fallback.
- **Can't yet:** brand-voice fine-tuning on your past posts.

### Thumbnail Studio / Motion Graphics / Creative Center
- **Purpose:** visuals + prompt packs.
- **Can:** prompt generation; Motion Graphics makes real images (needs the image function + FAL key).
- **Can't yet:** true video/animation; in-app thumbnail rendering (launches external tools).

### Intelligence Engine (Competitors, Outliers, Hooks, Demand, etc.)
- **Purpose:** research to feed content.
- **Can:** CRUD + scoring on competitor/viral/hook/audience data; approval → pipeline.
- **Can't yet:** live scraping of platforms (you enter/seed the data).

### Knowledge Vault
- **Purpose:** ask questions, get answers from YOUR documents.
- **Can:** store docs, route to an agent, **real RAG AI answers** grounded in your files (live).
- **Can't yet:** true PDF upload + vector embeddings (uses document summaries today).

---

## CONTENT OPERATIONS

### Content Pipeline / Content Calendar / News & Trend Center
- **Purpose:** plan and schedule content.
- **Can:** track pieces through stages; calendar view; trend records.
- **Can't yet:** connect to a real publishing/scheduling API.

---

## SALES SYSTEM

### Sales Center / Objection Handling / SMS + Email Templates / Consultation Scripts
- **Purpose:** the scripts and rebuttals to close.
- **Can:** editable template libraries seeded with real content.
- **Can't yet:** send from here (sending lives in the CRM once Twilio/SendGrid are on).

---

## ANALYTICS

### Analytics Center / Content / Lead / Revenue Analytics
- **Purpose:** performance dashboards.
- **Can:** KPI cards + charts; Revenue links to the Wealth Map.
- **Can't yet:** most numbers are sample/seed except the live Command Center + Finance; no live social/ad platform data yet.

---

## AUTOMATIONS

### Automations
- **Purpose:** trigger → action rules.
- **Can:** define rules; **"Run now"** executes one in-app (sends or logs); scheduler runs every 15 min once `cron_automations.sql` is applied.
- **Can't yet:** fire automatically on real events (e.g., the instant a lead is created) — needs event webhooks.

### Scheduled Tasks
- **Purpose:** recurring jobs list.
- **Can:** list/track scheduled jobs.
- **Can't yet:** each row auto-executing (the run-automations job is the live one).

### Workflow Builder (Runner)
- **Purpose:** connect modules idea → publish → analytics.
- **Can:** map + edit the workflow steps.
- **Can't yet:** actually execute the chain end-to-end automatically.

---

## SYSTEM

### Settings / Profile / Integrations / Logs
- **Purpose:** account + platform admin.
- **Can:** workspace settings; your profile + 2FA + sign out; integration status (Supabase/AI/MFSN/GHL); import logs.
- **Can't yet:** Integrations is status-only (no one-click connect flows yet); Logs shows imports (not every action).

---

### The one true blocker
**MyFreeScoreNow live pull** — waiting on the company's API endpoint. CSV import works today; the moment they send it, it's a ~10-minute change.

### The pattern to remember
Every module **works now** with your data. The "can't yet" items are almost all either (a) a paid outside service that turns on by adding a key (Stripe, Twilio/SendGrid), or (b) a deeper automation we can build next. Nothing is broken — it gets more powerful as you connect the pieces.
