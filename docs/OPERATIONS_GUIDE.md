# TRIAD T Command Center — Operations Guide (SOPs)

Plain-English breakdown of every system: **what it is**, **why it exists**, and
**how to use it**. No tech background needed.

> Mental model: the app is your **business operating system** — Credit →
> Structure → Capital → Growth. Each client moves through that journey; the team
> runs every offer, sale, and dollar from one place.

---

## 0. Getting In — Login, Roles, 2FA
**Purpose:** control who sees what.
**How to use:**
1. Go to the app → you'll see a **login** screen. First person to sign up becomes the **Administrator** (you).
2. Team members sign up → they start as **Guest**; you promote them to a role (Sales, Credit Specialist, Editor, Operations, Manager).
3. Each person sees only the sections their role allows.
4. **Profile → Enable 2FA** to add a phone-app code for extra security.
5. "Continue as Guest" = a demo view of everything (for previews).

---

## 1. Command Center (the dashboard)
**Purpose:** your daily snapshot — is the business healthy today?
**How to use:** open it first each day. It shows **live** numbers from your real data: total clients, average credit score, who's funding-ready, open sales pipeline, revenue, profit, and an **Alerts** panel (who needs urgent attention, who's ready to fund, which payments are pending). Click any tile to jump to that area.

---

## 2. ⭐ The Prolific Method (your core engine)
**Purpose:** the "James Bond" diagnostic — figure out exactly where a client is and hand you their full plan.
**How to use:**
1. Pick a client at the top.
2. Answer the short **intake** (or leave blanks — it auto-fills from their credit data).
3. It **auto-places** them in one of 7 phases: Diagnose → Repair → Rebuild → Structure → Position → Fund → Grow.
4. Read the **AI Strategist** for a tailored next-move write-up.
5. Each phase **generates a real deliverable** — e.g. Repair produces ready-to-send **dispute letters** (one per bureau); Structure produces the Business-in-a-Box document list.
6. Check off steps as you complete them.

---

## 3. Client System
**Client Command Center** — the master client hub.
**How to use:** Import a client (from MyFreeScoreNow CSV, or add manually) → read their tri-bureau scores → AI diagnosis (health + problems) → action plan → dispute strategy (Round 1/2/3 + CFPB) → funding readiness. Change a client's status as they progress.
- **Client Profiles** — quick searchable directory of everyone.
- **Round Tracking** — every dispute round across all clients (bureau, date sent, status, result).
- **Negative Account Tracking** — every negative item, its recommended dispute reason, and priority; update status as items get deleted.

---

## 4. Credit System
**Purpose:** the knowledge + tools behind the disputes.
- **Credit Knowledge Center** — FCRA/FDCPA/Metro 2 reference.
- **Dispute Strategy Builder** — bureau strategies, letters, escalations.
- **Bureau Intelligence** — internal playbook for how each bureau behaves (addresses, response patterns, escalation). *This is your reference, not client data.*
- **CFPB Center** — build and track CFPB complaints (drafted → submitted → responded → closed).

---

## 5. Funding System
**Purpose:** get clients approved for capital.
- **Funding Engine** — fundability overview.
- **Approval Readiness** — scores **every** client against the 4 approval factors (score, utilization, inquiries, derogatories) and tells you who's ready.
- **Business Funding / Personal Funding** — the checklists and pathways for each.

---

## 6. CRM (your sales + client pipeline — replaces GoHighLevel)
**Purpose:** track every lead and dollar.
**How to use:**
- **Pipeline** — drag leads through 10 stages (New Lead → … → Upsell) by changing each card's stage.
- **Contacts** — full records (source, owner, offer, value).
- **Deals / Payments** — track money; **"Create payment link"** sends a Stripe checkout (auto-marks paid when configured).
- **Activity** — log calls/notes, or **"Send & log"** an SMS/email (when texting/email is turned on).
- **Bookings** — scheduled consults.

---

## 7. Offers & Products
**Purpose:** every offer defined the same way.
**How to use:** browse the catalog (Credit Repair, Credit Building, Business Funding, Business-in-a-Box, Affiliate, Branding) — each with promise, price, deliverables, contract, and upsell path. Edit or add offers in the table.

---

## 8. Money & Growth
- **Finance · Wealth Map** — your company money command center: revenue, expenses, payouts, **net profit**, and **which offers make the most**. Log each transaction in the ledger.
- **Affiliate System** — your sales army: tiers, commissions, **leaderboard**, and payout tracking. Add affiliates and log commissions.

---

## 9. Operations Hub (run without you)
**Purpose:** turn your brain into a system the team can follow.
- **SOP Library** — every repeated task documented; an **AI SOP Generator** writes new ones from a sentence.
- **Training Hub** — Sales / Product / Operations / Brand training, assigned by role.
- **Contracts** — your agreements + signed-status tracking (links to JotForm/DisputeFox).
- **IP Library** — your protected frameworks (The Prolific Method, Wealth Map, etc.).

---

## 10. Content, Writing, Creative & Intelligence (marketing)
**Purpose:** fill the top of the funnel.
- **Content Engine / Script Writer / Caption / Description / CTA** — generate content + scripts (AI-powered when turned on, templates otherwise).
- **Thumbnail Studio / Motion Graphics / Creative Center** — visuals + prompt packs.
- **Intelligence Engine** — competitor, viral, hook, and audience research feeding your content.
- **Knowledge Vault** — upload your documents; **ask it questions** and get answers grounded in *your* files (real AI RAG when turned on).

---

## 11. Automations & Runner
**Purpose:** stop doing repetitive work by hand.
- **Automations** — rules (trigger → action). "Run now" executes one for a contact; with the scheduler on, they fire automatically every 15 min.
- **Scheduled Tasks** — recurring jobs.
- **Workflow Builder (Runner)** — the chain that connects modules: Idea → Script → Visuals → Schedule → Publish → Analytics → feedback loop.

---

## 12. Behind the Scenes (what makes it "real")
You don't touch these directly — they're the engines:
- **Supabase** — the cloud database + login + the secure "functions."
- **Edge Functions** — small secure programs that hold your private keys (AI, texting, Stripe, MyFreeScoreNow) so the website never exposes them.
- **AI (Claude)** — powers the Strategist, RAG answers, content, and SOP generator **once you add your key**.
- Until a service is "turned on," the app uses smart built-in defaults — **nothing ever breaks**, it just gets smarter when you connect a key.

> To switch any engine on, follow **`docs/GO_LIVE.md`** — one step at a time.
