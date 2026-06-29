import type { Row } from "@/lib/db/use-collection";

export interface TeamMember extends Row {
  id: string;
  name: string;
  role: string;
  owns: string;
  reports: string;
  kpis: string;
}

export const TEAM_SEED: TeamMember[] = [
  { id: "tm-adonis", name: "Adonis", role: "Operations", owns: "Client onboarding & fulfillment ops", reports: "Onboarding status, blockers", kpis: "Onboard time, fulfillment SLA" },
  { id: "tm-jeffrey", name: "Jeffrey", role: "Sales", owns: "Sales pipeline & closing", reports: "Calls booked, shows, closes", kpis: "Close rate, revenue closed" },
  { id: "tm-david", name: "David", role: "Credit Specialist", owns: "Credit analysis & disputes", reports: "Rounds sent, deletions", kpis: "Deletion rate, rounds/week" },
  { id: "tm-jaden", name: "Jaden", role: "Editor", owns: "Content & creative production", reports: "Content shipped, performance", kpis: "Posts/week, engagement" },
];

export interface RhythmDay {
  day: string;
  title: string;
  items: string[];
}

export const WEEKLY_RHYTHM: RhythmDay[] = [
  {
    day: "Monday",
    title: "Team Alignment",
    items: ["Goals for the week", "Client priorities", "Sales pipeline", "Content plan", "Service delivery", "Problems / blockers"],
  },
  {
    day: "Wednesday",
    title: "Training / Skill Development",
    items: ["Sales training", "Credit / funding knowledge", "SOP walkthroughs", "Client communication", "Personal branding", "Product knowledge"],
  },
  {
    day: "Friday",
    title: "Weekly Review",
    items: ["What got completed", "What is delayed", "Client updates", "Revenue", "Leads generated", "Calls booked & sales closed", "System improvements"],
  },
];
