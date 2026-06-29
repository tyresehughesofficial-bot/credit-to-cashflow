/** Roles + section-level access map for the Command Center. */

export type Role =
  | "Administrator"
  | "Manager"
  | "Sales"
  | "Credit Specialist"
  | "Editor"
  | "Operations"
  | "Guest";

export const ROLES: Role[] = [
  "Administrator",
  "Manager",
  "Sales",
  "Credit Specialist",
  "Editor",
  "Operations",
  "Guest",
];

/**
 * Which sidebar SECTION labels each role may see. "*" = all sections.
 * Section labels mirror `NAV_SECTIONS` in lib/navigation.ts.
 */
export const SECTION_ACCESS: Record<Role, string[] | "*"> = {
  Administrator: "*",
  Manager: "*",
  "Credit Specialist": ["Home", "Credit System", "Client System", "Funding System", "Operations Hub", "Analytics"],
  Sales: ["Home", "Sales System", "Client System", "Operations Hub", "Money & Growth", "Analytics"],
  Editor: ["Home", "Content System", "Writing System", "Content Operations", "Intelligence Engine", "Operations Hub"],
  Operations: ["Home", "Client System", "Operations Hub", "Money & Growth", "Automations", "Analytics", "System"],
  Guest: ["Home"],
};

export function canAccessSection(role: Role, sectionLabel: string): boolean {
  const access = SECTION_ACCESS[role] ?? ["Home"];
  return access === "*" || access.includes(sectionLabel);
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Administrator: "Full access. Owns the system, users, and settings.",
  Manager: "Full operational access across all systems.",
  "Credit Specialist": "Credit, client, and funding operations.",
  Sales: "Sales pipeline, clients, and sales tools.",
  Editor: "Content, writing, and creative production.",
  Operations: "Client ops, automations, and system admin.",
  Guest: "Read-only access to the home dashboards.",
};
