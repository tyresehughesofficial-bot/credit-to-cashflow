import {
  LayoutDashboard,
  Sparkles,
  Anchor,
  PenLine,
  BookOpen,
  Users,
  ShieldCheck,
  Landmark,
  Palette,
  Headphones,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  group: "Operations" | "Content & Creative" | "Clients & Funding" | "Growth";
}

/** The 11 modules of the TRIAD T Command Center. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Command Center",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Daily content, lead, client & revenue metrics",
    group: "Operations",
  },
  {
    label: "AI Content Engine",
    href: "/content-engine",
    icon: Sparkles,
    description: "TOF / MOF / BOF ideas, reels, carousels, captions, CTAs",
    group: "Content & Creative",
  },
  {
    label: "Viral Hook Library",
    href: "/hooks",
    icon: Anchor,
    description: "Save, categorize, search & tag hooks by psychology",
    group: "Content & Creative",
  },
  {
    label: "Script Writer",
    href: "/script-writer",
    icon: PenLine,
    description: "Reel, carousel, sales scripts & captions",
    group: "Content & Creative",
  },
  {
    label: "Creative Center",
    href: "/creative",
    icon: Palette,
    description: "Thumbnail, ChatGPT, Firefly & Rich Cinema X prompts",
    group: "Content & Creative",
  },
  {
    label: "Credit Knowledge Center",
    href: "/knowledge",
    icon: BookOpen,
    description: "FCRA, FDCPA, Metro 2 & CFPB knowledge base + AI assistant",
    group: "Clients & Funding",
  },
  {
    label: "Client Command Center",
    href: "/clients",
    icon: Users,
    description: "Profiles, rounds, bureaus, negatives, scores & escalations",
    group: "Clients & Funding",
  },
  {
    label: "Dispute Strategy Builder",
    href: "/disputes",
    icon: ShieldCheck,
    description: "Bureau strategies, letters, call scripts & CFPB escalations",
    group: "Clients & Funding",
  },
  {
    label: "Funding Engine",
    href: "/funding",
    icon: Landmark,
    description: "Readiness analyzer, personal & business credit, approval scoring",
    group: "Clients & Funding",
  },
  {
    label: "Sales Center",
    href: "/sales",
    icon: Headphones,
    description: "Objection handling, SMS, email templates & consultation scripts",
    group: "Growth",
  },
  {
    label: "Analytics Center",
    href: "/analytics",
    icon: BarChart3,
    description: "Content, lead, client & revenue analytics",
    group: "Growth",
  },
];

export const NAV_GROUPS = [
  "Operations",
  "Content & Creative",
  "Clients & Funding",
  "Growth",
] as const;
