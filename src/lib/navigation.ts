import {
  Home,
  LayoutDashboard,
  Library,
  Radar,
  Flame,
  MessagesSquare,
  Mic,
  AlertOctagon,
  Banknote,
  Trophy,
  Users2,
  Anchor,
  Sparkles,
  Lightbulb,
  Image as ImageIcon,
  Clapperboard,
  Palette,
  PenTool,
  PenLine,
  Captions,
  AlignLeft,
  MousePointerClick,
  KanbanSquare,
  Newspaper,
  CalendarDays,
  ShieldCheck,
  BookOpen,
  Gavel,
  Scale,
  Landmark,
  Users,
  UserCircle,
  ListChecks,
  FileWarning,
  Gauge,
  Building2,
  Wallet,
  Headphones,
  ShieldAlert,
  MessageSquare,
  Mail,
  PhoneCall,
  BarChart3,
  LineChart,
  UserPlus,
  DollarSign,
  Zap,
  CalendarClock,
  Workflow,
  ScrollText,
  Settings,
  Cog,
  CircleUser,
  Plug,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface NavSection {
  label: string;
  icon: LucideIcon;
  /** Whether the group starts expanded (the active group always auto-expands). */
  defaultOpen: boolean;
  items: NavItem[];
}

/**
 * Structured, enterprise-grade navigation for the TRIAD T Command Center.
 * Grouped into collapsible "systems" — Notion / HubSpot / Linear style.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Home",
    icon: Home,
    defaultOpen: true,
    items: [
      {
        label: "Command Center",
        href: "/command-center",
        icon: LayoutDashboard,
        description: "Daily content, lead, client & revenue metrics at a glance.",
      },
      {
        label: "The Prolific Method",
        href: "/prolific",
        icon: Workflow,
        description: "Diagnose → Repair → Rebuild → Structure → Position → Fund → Grow.",
      },
      {
        label: "Knowledge Vault",
        href: "/knowledge-vault",
        icon: Library,
        description: "RAG knowledge base + 4 AI agents with intelligent routing.",
      },
    ],
  },
  {
    label: "Intelligence Engine",
    icon: Radar,
    defaultOpen: true,
    items: [
      {
        label: "Intelligence HQ",
        href: "/intelligence",
        icon: Radar,
        description: "Master dashboard — top opportunities, trends, outliers & signals.",
      },
      {
        label: "Opportunity Queue",
        href: "/intelligence/queue",
        icon: ListChecks,
        description: "Scored, ranked opportunities + approval workflow → pipeline.",
      },
      {
        label: "Competitor Intel",
        href: "/intelligence/competitors",
        icon: Users2,
        description: "Track creators & top content across YouTube, TikTok, IG, X.",
      },
      {
        label: "Viral Outliers",
        href: "/intelligence/outliers",
        icon: Flame,
        description: "Content dramatically beating a creator's average + why it worked.",
      },
      {
        label: "Audience Demand",
        href: "/intelligence/demand",
        icon: MessagesSquare,
        description: "Mine comments & DMs for questions, pain points & objections.",
      },
      {
        label: "Hook Intelligence",
        href: "/intelligence/hooks",
        icon: Anchor,
        description: "Searchable hook database categorized by psychology type.",
      },
      {
        label: "Voice Intelligence",
        href: "/intelligence/voice",
        icon: Mic,
        description: "The founder's voice model — output that sounds like Triad T.",
      },
      {
        label: "Credit Myth Intel",
        href: "/intelligence/myths",
        icon: AlertOctagon,
        description: "Detect misinformation & generate myth-busting sequences.",
      },
      {
        label: "Bureau Intel",
        href: "/intelligence/bureaus",
        icon: Scale,
        description: "Experian/Equifax/TransUnion reporting & policy changes.",
      },
      {
        label: "CFPB Intel",
        href: "/intelligence/cfpb",
        icon: Landmark,
        description: "Enforcement, complaints & regulatory updates as proof points.",
      },
      {
        label: "Funding Intel",
        href: "/intelligence/funding",
        icon: Banknote,
        description: "SBA, fintech & underwriting shifts → funding opportunities.",
      },
      {
        label: "Objection Intel",
        href: "/intelligence/objections",
        icon: ShieldAlert,
        description: "Sales objections mined into pre-emptive counter-content.",
      },
      {
        label: "Client Intel",
        href: "/intelligence/clients",
        icon: Trophy,
        description: "Real client outcomes → case studies & success patterns.",
      },
    ],
  },
  {
    label: "Content System",
    icon: Clapperboard,
    defaultOpen: true,
    items: [
      {
        label: "AI Content Engine",
        href: "/content-engine",
        icon: Sparkles,
        description: "Generate TOF / MOF / BOF ideas, reels, carousels, captions & CTAs.",
      },
      {
        label: "Idea Generation",
        href: "/idea-generation",
        icon: Lightbulb,
        description: "Spin up an endless pipeline of on-brand content ideas.",
      },
      {
        label: "Thumbnail Studio",
        href: "/thumbnail-studio",
        icon: ImageIcon,
        description: "Design scroll-stopping thumbnails and prompt packs.",
      },
      {
        label: "Motion Graphics Studio",
        href: "/motion-graphics",
        icon: Clapperboard,
        description: "Creative Asset Generation Engine — OpenAI / Firefly / Canva, knowledge-grounded.",
      },
      {
        label: "Creative Center",
        href: "/creative",
        icon: Palette,
        description: "Thumbnail, ChatGPT, Firefly & Rich Cinema X prompt generators.",
      },
    ],
  },
  {
    label: "Writing System",
    icon: PenTool,
    defaultOpen: false,
    items: [
      {
        label: "Script Writer",
        href: "/script-writer",
        icon: PenLine,
        description: "Reel, carousel and sales scripts plus captions.",
      },
      {
        label: "Caption Builder",
        href: "/caption-builder",
        icon: Captions,
        description: "High-converting captions tuned to platform and funnel stage.",
      },
      {
        label: "Description Builder",
        href: "/description-builder",
        icon: AlignLeft,
        description: "SEO-aware descriptions for YouTube, posts and landing pages.",
      },
      {
        label: "CTA Generator",
        href: "/cta-generator",
        icon: MousePointerClick,
        description: "Psychology-driven calls to action for every offer.",
      },
    ],
  },
  {
    label: "Content Operations",
    icon: KanbanSquare,
    defaultOpen: false,
    items: [
      {
        label: "Content Pipeline",
        href: "/content-pipeline",
        icon: KanbanSquare,
        description: "Track every piece from idea to published across stages.",
      },
      {
        label: "News & Trend Center",
        href: "/trends",
        icon: Newspaper,
        description: "Trending audio, topics and finance news to ride.",
      },
      {
        label: "Content Calendar",
        href: "/content-calendar",
        icon: CalendarDays,
        description: "Plan and schedule the publishing calendar.",
      },
    ],
  },
  {
    label: "Credit System",
    icon: ShieldCheck,
    defaultOpen: true,
    items: [
      {
        label: "Credit Knowledge Center",
        href: "/knowledge",
        icon: BookOpen,
        description: "FCRA, FDCPA, Metro 2 & CFPB knowledge base with AI assistant.",
      },
      {
        label: "Dispute Strategy Builder",
        href: "/disputes",
        icon: Gavel,
        description: "Bureau strategies, letters, call scripts & CFPB escalations.",
      },
      {
        label: "Bureau Intelligence",
        href: "/bureaus",
        icon: Scale,
        description: "Bureau-specific tactics, addresses and response patterns.",
      },
      {
        label: "CFPB Center",
        href: "/cfpb",
        icon: Landmark,
        description: "Build and manage CFPB complaints and escalation plans.",
      },
    ],
  },
  {
    label: "Client System",
    icon: Users,
    defaultOpen: true,
    items: [
      {
        label: "Client Command Center",
        href: "/clients",
        icon: Users,
        description: "Profiles, rounds, bureaus, negatives, scores & escalations.",
      },
      {
        label: "Client Profiles",
        href: "/client-profiles",
        icon: UserCircle,
        description: "Full client records, contacts and program status.",
      },
      {
        label: "Round Tracking",
        href: "/round-tracking",
        icon: ListChecks,
        description: "Dispute rounds by bureau with status and due dates.",
      },
      {
        label: "Negative Account Tracking",
        href: "/negative-tracking",
        icon: FileWarning,
        description: "Track negative accounts, statuses and removals.",
      },
    ],
  },
  {
    label: "Funding System",
    icon: Landmark,
    defaultOpen: false,
    items: [
      {
        label: "Funding Engine",
        href: "/funding",
        icon: Landmark,
        description: "Readiness analyzer, personal & business credit, approval scoring.",
      },
      {
        label: "Approval Readiness",
        href: "/approval-readiness",
        icon: Gauge,
        description: "Score readiness and surface the gaps before applying.",
      },
      {
        label: "Business Funding",
        href: "/business-funding",
        icon: Building2,
        description: "Business credit build, fundability and lender matching.",
      },
      {
        label: "Personal Funding",
        href: "/personal-funding",
        icon: Wallet,
        description: "Personal credit analysis and approval pathways.",
      },
    ],
  },
  {
    label: "Sales System",
    icon: Headphones,
    defaultOpen: false,
    items: [
      {
        label: "Sales Center",
        href: "/sales",
        icon: Headphones,
        description: "Objection handling, templates and consultation scripts.",
      },
      {
        label: "Objection Handling",
        href: "/objection-handling",
        icon: ShieldAlert,
        description: "Battle-tested rebuttals for every objection.",
      },
      {
        label: "SMS Templates",
        href: "/sms-templates",
        icon: MessageSquare,
        description: "High-converting SMS sequences and one-offs.",
      },
      {
        label: "Email Templates",
        href: "/email-templates",
        icon: Mail,
        description: "Nurture, sales and re-engagement email templates.",
      },
      {
        label: "Consultation Scripts",
        href: "/consultation-scripts",
        icon: PhoneCall,
        description: "Closing frameworks and consultation call scripts.",
      },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    defaultOpen: false,
    items: [
      {
        label: "Analytics Center",
        href: "/analytics",
        icon: BarChart3,
        description: "Deep-dive analytics across content, leads, clients & revenue.",
      },
      {
        label: "Content Analytics",
        href: "/content-analytics",
        icon: LineChart,
        description: "Reach, engagement and funnel performance by content.",
      },
      {
        label: "Lead Analytics",
        href: "/lead-analytics",
        icon: UserPlus,
        description: "Lead sources, conversion and cost per acquisition.",
      },
      {
        label: "Revenue Analytics",
        href: "/revenue-analytics",
        icon: DollarSign,
        description: "MRR, funding commissions and revenue by source.",
      },
    ],
  },
  {
    label: "Automations",
    icon: Zap,
    defaultOpen: false,
    items: [
      {
        label: "Automations",
        href: "/automations",
        icon: Zap,
        description: "Trigger-based automations across the whole platform.",
      },
      {
        label: "Scheduled Tasks",
        href: "/scheduled-tasks",
        icon: CalendarClock,
        description: "Recurring jobs, reminders and scheduled publishing.",
      },
      {
        label: "Workflow Builder",
        href: "/workflow-builder",
        icon: Workflow,
        description: "Compose multi-step workflows visually.",
      },
    ],
  },
  {
    label: "System",
    icon: Cog,
    defaultOpen: false,
    items: [
      {
        label: "Logs",
        href: "/logs",
        icon: ScrollText,
        description: "Activity and audit logs across the platform.",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Workspace, branding and platform settings.",
      },
      {
        label: "Profile",
        href: "/profile",
        icon: CircleUser,
        description: "Your account, preferences and security.",
      },
      {
        label: "Integrations",
        href: "/integrations",
        icon: Plug,
        description: "Connect Supabase, social, email and funding partners.",
      },
    ],
  },
];

/** Flattened list of every navigable item (used for lookups & search). */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
