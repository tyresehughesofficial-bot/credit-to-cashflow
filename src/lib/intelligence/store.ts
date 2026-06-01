"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { OppStatus } from "./types";

/**
 * Approval Workflow store.
 * A tiny observable + localStorage-backed store so opportunity decisions
 * (approve / reject / archive / save) persist and stay in sync across every
 * intelligence page without a provider. Approved opportunities flow to the
 * Content Production Pipeline.
 */
const KEY = "tt.intel.opps";

type StatusMap = Record<string, OppStatus>;

function load(): StatusMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

let state: StatusMap = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function setOppStatus(id: string, status: OppStatus) {
  // Toggle back to "new" if the same status is re-applied.
  const next = { ...state };
  if (next[id] === status) delete next[id];
  else next[id] = status;
  state = next;
  persist();
  emit();
}

export function resetOpps() {
  state = {};
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): StatusMap {
  return EMPTY;
}
const EMPTY: StatusMap = {};

/** Reactive map of opportunityId → status (defaults to "new" when absent). */
export function useOppStatuses(): StatusMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useOppActions() {
  const set = useCallback(setOppStatus, []);
  const reset = useCallback(resetOpps, []);
  return { set, reset };
}

export function statusOf(map: StatusMap, id: string): OppStatus {
  return map[id] ?? "new";
}
