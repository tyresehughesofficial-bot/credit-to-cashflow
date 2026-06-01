"use client";

import { useSyncExternalStore } from "react";

import { OPPORTUNITIES } from "./data";
import { statusOf, useOppStatuses } from "./store";
import type { Opportunity, Platform } from "./types";

/**
 * Content Production Pipeline.
 *
 * Approved opportunities (from the approval workflow) become production items.
 * This store layers production metadata on top — pipeline stage, scheduled date
 * and platform — so the Content Engine and Content Calendar both read from one
 * source of truth. Approvals flow straight into production.
 */
export type Stage = "Backlog" | "Scripting" | "Scheduled" | "Published";
export const STAGES: Stage[] = ["Backlog", "Scripting", "Scheduled", "Published"];

export interface ProdMeta {
  stage: Stage;
  date?: string; // yyyy-mm-dd
  platform?: Platform;
}

const KEY = "tt.intel.production";
type MetaMap = Record<string, ProdMeta>;

function load(): MetaMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

let state: MetaMap = load();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
function patch(id: string, next: ProdMeta) {
  state = { ...state, [id]: next };
  persist();
  emit();
}

export function setStage(id: string, stage: Stage) {
  const cur = state[id] ?? { stage: "Backlog" };
  patch(id, { ...cur, stage });
}

export function scheduleItem(id: string, date: string, platform?: Platform) {
  const cur = state[id] ?? { stage: "Backlog" };
  patch(id, { ...cur, date, platform: platform ?? cur.platform, stage: "Scheduled" });
}

export function unscheduleItem(id: string) {
  const cur = state[id] ?? { stage: "Backlog" };
  patch(id, { ...cur, date: undefined, stage: "Backlog" });
}

export function publishItem(id: string) {
  const cur = state[id] ?? { stage: "Backlog" };
  patch(id, { ...cur, stage: "Published" });
}

const EMPTY: MetaMap = {};
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function useProductionMeta(): MetaMap {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export interface ProductionItem {
  opp: Opportunity;
  stage: Stage;
  date?: string;
  platform?: Platform;
}

/** Effective stage: a dated item shows as Scheduled unless already Published. */
function effectiveStage(m?: ProdMeta): Stage {
  if (!m) return "Backlog";
  if (m.stage === "Published") return "Published";
  if (m.date) return "Scheduled";
  return m.stage;
}

/** Approved opportunities joined with their production metadata. */
export function useProductionItems(): ProductionItem[] {
  const statuses = useOppStatuses();
  const meta = useProductionMeta();
  return OPPORTUNITIES.filter((o) => statusOf(statuses, o.id) === "approved")
    .map((o) => {
      const m = meta[o.id];
      return { opp: o, stage: effectiveStage(m), date: m?.date, platform: m?.platform ?? o.platform };
    })
    .sort((a, b) => b.opp.total - a.opp.total);
}
