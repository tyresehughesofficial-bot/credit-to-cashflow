"use client";

import { useCallback, useSyncExternalStore } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { recordToRow, rowToRecord } from "./case";

/**
 * Reactive collection store.
 *
 * Source of truth is an in-memory cache, persisted to localStorage so every
 * Intelligence page is fully functional with zero backend (demo / static
 * preview). When Supabase is configured (NEXT_PUBLIC_* env vars present) the
 * same mutations write through to the matching table, and the collection is
 * hydrated from Supabase on first use. Records are camelCase; columns are
 * snake_case (converted automatically).
 */
export interface Row {
  id: string;
  [k: string]: unknown;
}

type Store = { data: Row[]; subs: Set<() => void> };
const stores: Record<string, Store> = {};
const serverSnap: Record<string, Row[]> = {};
const lsKey = (name: string) => `tt.db.${name}`;
const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}${Date.now()}`;

function ensure(name: string, seed: Row[]): Store {
  let store = stores[name];
  if (store) return store;
  let data = seed;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(lsKey(name));
      if (raw) data = JSON.parse(raw);
      else localStorage.setItem(lsKey(name), JSON.stringify(seed));
    } catch {
      /* ignore */
    }
  }
  store = { data, subs: new Set() };
  stores[name] = store;
  // Best-effort hydrate from Supabase when configured.
  void hydrate(name);
  return store;
}

function persist(name: string) {
  const s = stores[name];
  if (!s) return;
  try {
    localStorage.setItem(lsKey(name), JSON.stringify(s.data));
  } catch {
    /* ignore */
  }
  s.subs.forEach((cb) => cb());
}

/* ─────────────────────── Supabase adapter (optional) ─────────────────────── */

async function hydrate(name: string) {
  if (!isSupabaseConfigured) return;
  const sb = createClient();
  if (!sb) return;
  try {
    const { data, error } = await sb.from(name).select("*");
    if (error || !data) return;
    const recs = data.map((r) => rowToRecord<Row>(r as Record<string, unknown>));
    const s = stores[name];
    if (s) {
      s.data = recs;
      persist(name);
    }
  } catch {
    /* offline / table missing — stay on local cache */
  }
}

async function sbUpsert(name: string, rec: Row) {
  if (!isSupabaseConfigured) return;
  const sb = createClient();
  if (!sb) return;
  try {
    await sb.from(name).upsert(recordToRow(rec));
  } catch {
    /* best effort */
  }
}

async function sbDelete(name: string, id: string) {
  if (!isSupabaseConfigured) return;
  const sb = createClient();
  if (!sb) return;
  try {
    await sb.from(name).delete().eq("id", id);
  } catch {
    /* best effort */
  }
}

/* ─────────────────── Imperative API (use outside React render) ─────────────────── */

/** Insert (or replace by id) a record into a collection. */
export function collectionUpsert(name: string, rec: Row, seed: Row[] = []) {
  const s = ensure(name, seed);
  const exists = s.data.some((r) => r.id === rec.id);
  s.data = exists ? s.data.map((r) => (r.id === rec.id ? rec : r)) : [rec, ...s.data];
  persist(name);
  void sbUpsert(name, rec);
}

/** Remove records from a collection matching a field value. */
export function collectionRemoveBy(name: string, field: string, value: unknown, seed: Row[] = []) {
  const s = ensure(name, seed);
  const removed = s.data.filter((r) => r[field] === value).map((r) => r.id);
  if (removed.length === 0) return;
  s.data = s.data.filter((r) => r[field] !== value);
  persist(name);
  removed.forEach((id) => void sbDelete(name, id));
}

/* ───────────────────────────────── Hook ───────────────────────────────── */

export interface Collection<T extends Row> {
  records: T[];
  add: (rec: Omit<T, "id"> & { id?: string }) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  importMany: (recs: Array<Omit<T, "id">>) => void;
  replaceAll: (recs: T[]) => void;
}

export function useCollection<T extends Row>(name: string, seed: T[]): Collection<T> {
  const subscribe = useCallback(
    (cb: () => void) => {
      const s = ensure(name, seed);
      s.subs.add(cb);
      return () => s.subs.delete(cb);
    },
    [name, seed],
  );
  const getSnapshot = useCallback(() => ensure(name, seed).data as T[], [name, seed]);
  const getServerSnapshot = useCallback(() => {
    if (!serverSnap[name]) serverSnap[name] = seed;
    return serverSnap[name] as T[];
  }, [name, seed]);

  const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback<Collection<T>["add"]>(
    (rec) => {
      const full = { ...(rec as object), id: rec.id ?? uid() } as T;
      const s = ensure(name, seed);
      s.data = [full, ...s.data];
      persist(name);
      void sbUpsert(name, full);
      return full;
    },
    [name, seed],
  );

  const update = useCallback<Collection<T>["update"]>(
    (id, patch) => {
      const s = ensure(name, seed);
      let merged: T | undefined;
      s.data = s.data.map((r) => {
        if (r.id !== id) return r;
        merged = { ...r, ...patch } as T;
        return merged;
      });
      persist(name);
      if (merged) void sbUpsert(name, merged);
    },
    [name, seed],
  );

  const remove = useCallback<Collection<T>["remove"]>(
    (id) => {
      const s = ensure(name, seed);
      s.data = s.data.filter((r) => r.id !== id);
      persist(name);
      void sbDelete(name, id);
    },
    [name, seed],
  );

  const importMany = useCallback<Collection<T>["importMany"]>(
    (recs) => {
      const full = recs.map((r) => ({ ...(r as object), id: uid() }) as T);
      const s = ensure(name, seed);
      s.data = [...full, ...s.data];
      persist(name);
      full.forEach((r) => void sbUpsert(name, r));
    },
    [name, seed],
  );

  const replaceAll = useCallback<Collection<T>["replaceAll"]>(
    (recs) => {
      const s = ensure(name, seed);
      s.data = recs;
      persist(name);
    },
    [name, seed],
  );

  return { records, add, update, remove, importMany, replaceAll };
}
