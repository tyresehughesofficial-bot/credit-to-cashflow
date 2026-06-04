import type { Agent, AgentId, KnowledgeDoc } from "./types";

export const AGENTS: Agent[] = [
  {
    id: "dispute",
    name: "TRIAD DISPUTE AGENT™",
    tagline: "FCRA-grounded credit repair",
    functions: [
      "Dispute letters",
      "Collection analysis",
      "Charge-off analysis",
      "Inquiry removal strategy",
      "Late payment strategy",
      "CFPB escalation",
      "FCRA-based workflows",
    ],
    keywords: [
      "dispute", "letter", "collection", "charge-off", "chargeoff", "inquiry", "inquiries",
      "late", "fcra", "bureau", "metro 2", "cfpb", "removal", "delete", "deletion",
      "validation", "credit report", "negative", "reaging",
    ],
  },
  {
    id: "funding",
    name: "TRIAD FUNDING AGENT™",
    tagline: "Capital readiness & lender matching",
    functions: [
      "Funding roadmap",
      "Lender matching",
      "Funding readiness analysis",
      "Business credit building",
      "Funding sequencing",
      "Approval optimization",
    ],
    keywords: [
      "funding", "fund", "lender", "lenders", "loan", "capital", "approval", "approved",
      "underwriting", "business credit", "0%", "bank", "money", "tradeline", "net-30",
      "sba", "fundable", "limit", "qualify for funding",
    ],
  },
  {
    id: "sales",
    name: "TRIAD SALES AGENT™",
    tagline: "DM-to-close conversion engine",
    functions: [
      "DM responses",
      "Sales scripts",
      "Consultation scripts",
      "Objection handling",
      "Lead qualification",
      "Follow-up systems",
      "CRM workflows",
    ],
    keywords: [
      "dm", "script", "consultation", "consult", "close", "closing", "call", "book",
      "objection", "lead", "follow-up", "followup", "crm", "sales", "qualify", "pitch",
      "offer", "appointment", "respond",
    ],
  },
  {
    id: "content",
    name: "TRIAD CONTENT AGENT™",
    tagline: "Authority & lead-gen content",
    functions: [
      "Reels",
      "Carousels",
      "Hooks",
      "Captions",
      "CTAs",
      "Educational content",
      "Authority content",
      "Lead generation content",
    ],
    keywords: [
      "reel", "reels", "carousel", "hook", "caption", "cta", "content", "post", "video",
      "story", "educational", "authority", "viral", "tofu", "audience", "thumbnail",
    ],
  },
];

export const AGENT_BY_ID: Record<AgentId, Agent> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, Agent>;

const drive = (id: string, doc = true) =>
  doc ? `https://docs.google.com/document/d/${id}/edit` : `https://drive.google.com/file/d/${id}/view`;

/** The documents in the "AI command center triad t enterprise" folder, mapped
 *  to agents per the ownership spec. Summaries are the searchable extract;
 *  real full-text can be ingested over the same records. */
export const DOCUMENTS: KnowledgeDoc[] = [
  // ── Dispute ──
  {
    id: "doc-diy-kit", title: "DIY CREDIT KIT", agents: ["dispute"], category: "Credit & Disputes", fileType: "pdf",
    summary:
      "Step-by-step self-dispute kit: pull all three reports, identify inaccurate or unverifiable items, and send round-based dispute letters. Covers debt validation under FDCPA §809, FCRA §611 reinvestigation demands, method-of-verification follow-ups, and a 30/45-day response timeline. Includes letter templates for collections, charge-offs, late payments and unauthorized inquiries.",
    keywords: ["dispute", "letter", "round", "validation", "collection", "charge-off", "inquiry", "fcra", "diy"],
    chunks: 64, status: "embedded", uploadedAt: "2026-05-31",
  },
  {
    id: "doc-fcra", title: "FCRA – Fair Credit Reporting Act", agents: ["dispute"], category: "Credit & Disputes", fileType: "pdf",
    driveId: "1CjZlw86WbsIEMEgSyzhX0KmbWfgx-J8v", viewUrl: drive("1CjZlw86WbsIEMEgSyzhX0KmbWfgx-J8v", false),
    summary:
      "Full statute reference. Key levers: §611 (reinvestigation of disputed information within 30 days), §609 (disclosure / right to documentation), §605 (time limits — most negatives 7 years, Ch.7 BK 10 years), §623 (furnisher responsibilities), §607(b) (reasonable procedures / maximum accuracy). The legal backbone for every dispute and CFPB escalation.",
    keywords: ["fcra", "611", "609", "605", "623", "reinvestigation", "furnisher", "statute", "accuracy"],
    chunks: 182, status: "embedded", uploadedAt: "2026-05-30",
  },
  {
    id: "doc-credit-journey", title: "THE CREDIT JOURNEY SYSTEM™", agents: ["dispute"], category: "Credit & Disputes", fileType: "doc",
    driveId: "1fwlCRNF__TscOzFiRnpnGXR6Xkct_0PoIdtwCN9Qm6s", viewUrl: drive("1fwlCRNF__TscOzFiRnpnGXR6Xkct_0PoIdtwCN9Qm6s"),
    summary:
      "Triad T's proprietary client journey from enrollment to funding-ready: onboarding & audit, Round 1 inaccuracies, Round 2 escalation, utilization optimization, primary/secondary tradelines, then funding hand-off. Defines what to do each 30-day cycle and how to set client expectations.",
    keywords: ["journey", "system", "rounds", "onboarding", "utilization", "tradelines", "funding-ready", "timeline"],
    chunks: 28, status: "embedded", uploadedAt: "2026-05-29",
  },
  {
    id: "doc-vocab", title: "CREDIT EDUCATOR VOCABULARY WORKBOOK™", agents: ["dispute", "content"], category: "Credit & Disputes", fileType: "doc",
    driveId: "1wLPIovWO9C0kKLXtkOxBROa48tVHuLLefrWwljZ6U14", viewUrl: drive("1wLPIovWO9C0kKLXtkOxBROa48tVHuLLefrWwljZ6U14"),
    summary:
      "Expanded glossary that makes you sound like an expert: utilization, derogatory, DOFD, re-aging, Metro 2, validation vs verification, hard vs soft inquiry, secured vs unsecured, primary tradeline, AU, DTI. Doubles as a content bank — every term is a reel/carousel topic and a way to build authority.",
    keywords: ["vocabulary", "terms", "definitions", "metro 2", "dofd", "utilization", "authority", "education"],
    chunks: 40, status: "embedded", uploadedAt: "2026-05-28",
  },

  // ── Funding ──
  {
    id: "doc-funding-plan", title: "Funding Optimization Plan", agents: ["funding"], category: "Funding & Capital", fileType: "doc",
    driveId: "1izky4v2JZnr0CoARhmxyO_Y9vCAAev6IHiif501MfO8", viewUrl: drive("1izky4v2JZnr0CoARhmxyO_Y9vCAAev6IHiif501MfO8"),
    summary:
      "The execution breakdown for maximizing approvals: fix utilization under 9%, age & limit optimization, inquiry spacing, the order to apply (personal → 0% business → bank lines), and per-institution sensitivities. Sequencing is everything — apply in the wrong order and you get auto-denied.",
    keywords: ["funding", "optimization", "utilization", "sequencing", "approval", "inquiries", "limits", "order"],
    chunks: 96, status: "embedded", uploadedAt: "2026-05-31",
  },
  {
    id: "doc-secret-lenders", title: "SECRET LENDERS LIST", agents: ["funding"], category: "Funding & Capital", fileType: "pdf",
    driveId: "124dXjxuTTECYEt_Mt8sFv6sCXbxJ5qg0", viewUrl: drive("124dXjxuTTECYEt_Mt8sFv6sCXbxJ5qg0", false),
    summary:
      "Curated list of lenders and the data points they pull, including revenue-based and no-personal-guarantee options, soft-pull pre-quals, and which bureau each lender reports to. Pair with the Funding Optimization Plan for lender matching.",
    keywords: ["lenders", "list", "no pg", "soft pull", "revenue", "bureau", "matching", "secret"],
    chunks: 210, status: "embedded", uploadedAt: "2026-05-27",
  },
  {
    id: "doc-bank-relationships", title: "BUILDING BUSINESS BANK RELATIONSHIPS", agents: ["funding"], category: "Funding & Capital", fileType: "doc",
    summary:
      "How to build depository relationships that unlock bank lines and credit: account seasoning, average daily balance targets, deposit consistency, and how relationship managers underwrite. The bridge from business credit to real bank capital.",
    keywords: ["bank", "relationship", "deposits", "seasoning", "balance", "line of credit", "underwriting"],
    chunks: 22, status: "embedded", uploadedAt: "2026-05-26",
  },
  {
    id: "doc-0pct-cards", title: "0% Biz Credit Cards", agents: ["funding"], category: "Funding & Capital", fileType: "doc",
    summary:
      "Stackable 0% intro-APR business cards, approval data points, which report to personal vs business bureaus, and how to use 0% float as working capital without wrecking utilization. Includes the recommended stacking order.",
    keywords: ["0%", "business cards", "stacking", "intro apr", "float", "utilization", "approval"],
    chunks: 18, status: "embedded", uploadedAt: "2026-05-25",
  },
  {
    id: "doc-bank-data", title: "Bank Data Points Updated April 2026", agents: ["funding"], category: "Funding & Capital", fileType: "sheet",
    summary:
      "Current-as-of-April-2026 underwriting data points by institution: which bureau they pull, sensitivity to inquiries and recent accounts, minimum time-in-business, and known approval thresholds. The reference table behind lender matching.",
    keywords: ["bank", "data points", "underwriting", "bureau", "thresholds", "april 2026", "institutions"],
    chunks: 30, status: "embedded", uploadedAt: "2026-04-30",
  },

  // ── Sales ──
  {
    id: "doc-dm-scripts", title: "SALES DM SCRIPTS", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "Plug-and-play DM frameworks: openers, qualifiers, transition to offer, and the soft close. Includes responses to 'how much?', ghosting revivals, and the bridge from comment to DM to booked call.",
    keywords: ["dm", "scripts", "opener", "qualify", "close", "ghost", "frameworks", "messages"],
    chunks: 34, status: "embedded", uploadedAt: "2026-05-24",
  },
  {
    id: "doc-book-calls", title: "Book Calls in the DMs", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "The exact sequence to turn a DM conversation into a booked consultation: permission-based pitch, calendar link timing, and how to handle 'just send me the info'. Maximizes show-rate, not just bookings.",
    keywords: ["book", "calls", "dm", "calendar", "booking", "show rate", "appointment"],
    chunks: 14, status: "embedded", uploadedAt: "2026-05-23",
  },
  {
    id: "doc-close-dms", title: "Close in the DMs", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "Closing without a call: building certainty over text, payment-link delivery, and urgency framing. For warm leads who prefer to buy in the DMs.",
    keywords: ["close", "dm", "payment link", "urgency", "certainty", "text close"],
    chunks: 12, status: "embedded", uploadedAt: "2026-05-22",
  },
  {
    id: "doc-cash-closing", title: "CASH CLOSING METHOD EXPLANATION", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "The Cash Closing Method: framing price against the cost of inaction (denials, high rates, lost approvals), anchoring, and presenting payment options so the close feels like the obvious next step.",
    keywords: ["cash", "closing", "method", "price", "anchor", "cost of inaction", "objection"],
    chunks: 16, status: "embedded", uploadedAt: "2026-05-21",
  },
  {
    id: "doc-dm-questions", title: "Questions to Ask in the DMs", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "Qualification question bank that uncovers the goal (funding vs repair), timeline, urgency and budget — so you tailor the pitch and disqualify tire-kickers fast.",
    keywords: ["questions", "qualify", "discovery", "dm", "budget", "timeline", "goal"],
    chunks: 10, status: "embedded", uploadedAt: "2026-05-20",
  },
  {
    id: "doc-consult-script", title: "New Script for Consultation", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "Full consultation flow: rapport, credit/funding audit recap, problem agitation, the Triad T plan, objection pre-handling, and the close. The structure for every booked call.",
    keywords: ["consultation", "script", "call", "audit", "close", "objection", "flow"],
    chunks: 20, status: "embedded", uploadedAt: "2026-05-19",
  },
  {
    id: "doc-crm", title: "Getting Organized with a CRM", agents: ["sales"], category: "Sales & Conversion", fileType: "doc",
    summary:
      "Pipeline stages, follow-up cadences, tagging leads by source and intent, and the automations that stop leads from falling through the cracks.",
    keywords: ["crm", "pipeline", "follow-up", "cadence", "tags", "automation", "organize"],
    chunks: 12, status: "embedded", uploadedAt: "2026-05-18",
  },

  // ── Content ──
  {
    id: "doc-warm-lead", title: "Warm Lead Content System", agents: ["content"], category: "Content & Marketing", fileType: "doc",
    summary:
      "Content engine that warms cold audiences into DMs: TOF authority/education, MOF proof & objection content, BOF offer content, and the comment-to-DM CTA loop that feeds the sales pipeline.",
    keywords: ["content", "warm lead", "tofu", "mofu", "bofu", "cta", "authority", "pipeline"],
    chunks: 26, status: "embedded", uploadedAt: "2026-05-17",
  },
  {
    id: "doc-main-takeaway", title: "MAIN TAKEAWAY — Credit & Capital Edition", agents: ["content"], category: "Content & Marketing", fileType: "doc",
    summary:
      "A bank of one-line 'main takeaways' and angles across credit and capital — ready-made hooks and caption payoffs for reels and carousels.",
    keywords: ["takeaway", "hooks", "angles", "captions", "credit", "capital", "content bank"],
    chunks: 18, status: "embedded", uploadedAt: "2026-05-16",
  },
  {
    id: "doc-happy-meal", title: "Happy Meal Strategy", agents: ["content"], category: "Content & Marketing", fileType: "doc",
    driveId: "1uf8kIjqJt_DsxpcNM6J1ELhIfgHiZhBc9FbLGOg58lc", viewUrl: drive("1uf8kIjqJt_DsxpcNM6J1ELhIfgHiZhBc9FbLGOg58lc"),
    summary:
      "The 'Happy Meal' content offer: bundle a free value piece (the toy) with the educational content (the meal) so the audience opts in. A repeatable lead-magnet content structure.",
    keywords: ["happy meal", "lead magnet", "offer", "opt-in", "free", "bundle", "content"],
    chunks: 8, status: "embedded", uploadedAt: "2026-05-15",
  },
  {
    id: "doc-limiting-beliefs", title: "Limiting Beliefs of Credit", agents: ["content"], category: "Content & Marketing", fileType: "doc",
    summary:
      "The myths and limiting beliefs that keep people stuck ('credit repair is illegal', 'paying it off fixes it', 'I'm too far gone') — each one a myth-bust reel and an objection to dissolve before the sale.",
    keywords: ["limiting beliefs", "myths", "objection", "mindset", "reel", "bust", "education"],
    chunks: 14, status: "embedded", uploadedAt: "2026-05-14",
  },

  // ── Brand assets (no agent) ──
  {
    id: "doc-logos", title: "triad T enterprise logo files", agents: [], category: "Brand Assets", fileType: "asset",
    summary: "Brand logo files (PNG/transparent) used across the platform and creative assets. Not embedded for retrieval — stored as brand reference.",
    keywords: ["logo", "brand", "assets", "png"],
    chunks: 0, status: "asset", uploadedAt: "2026-05-22",
  },
];
