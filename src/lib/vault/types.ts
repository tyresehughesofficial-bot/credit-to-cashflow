export type AgentId = "dispute" | "funding" | "sales" | "content";

export type DocStatus = "queued" | "processing" | "embedded" | "asset";

export type KnowledgeCategory =
  | "Credit & Disputes"
  | "Funding & Capital"
  | "Sales & Conversion"
  | "Content & Marketing"
  | "Brand Assets";

export interface Agent {
  id: AgentId;
  name: string;
  tagline: string;
  functions: string[];
  /** Weighted routing keywords (heavier terms first improves classification). */
  keywords: string[];
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  agents: AgentId[]; // a doc can serve multiple agents
  category: KnowledgeCategory;
  fileType: "doc" | "pdf" | "sheet" | "asset";
  summary: string; // extracted/authored content used for retrieval
  keywords: string[];
  chunks: number; // vectors created for this doc
  status: DocStatus;
  driveId?: string;
  viewUrl?: string;
  uploadedAt: string; // yyyy-mm-dd
}
