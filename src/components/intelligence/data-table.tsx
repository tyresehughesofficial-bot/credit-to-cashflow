"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, Upload, Download, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollection, type Row } from "@/lib/db/use-collection";
import { downloadCSV, parseCSV, toCSV } from "@/lib/db/csv";

export type FieldType = "text" | "number" | "textarea" | "select" | "tags";

export interface Field {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  /** Hidden from the table grid (still editable in the form). */
  hideInTable?: boolean;
  render?: (value: unknown, row: Row) => React.ReactNode;
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-gold/50";

function coerce(field: Field, raw: string): unknown {
  if (field.type === "number") return raw === "" ? 0 : Number(raw);
  if (field.type === "tags") return raw ? raw.split(/[;,]/).map((s) => s.trim()).filter(Boolean) : [];
  return raw;
}
function display(field: Field, v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  return v == null ? "" : String(v);
}

export function DataTable({
  collection,
  seed,
  fields,
  title,
  searchKeys,
}: {
  collection: string;
  seed: Row[];
  fields: Field[];
  title?: string;
  searchKeys?: string[];
}) {
  const { records, add, update, remove, importMany } = useCollection(collection, seed);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tableFields = fields.filter((f) => !f.hideInTable);
  const keys = searchKeys ?? fields.map((f) => f.key);

  const filtered = useMemo(() => {
    if (!q.trim()) return records;
    const needle = q.toLowerCase();
    return records.filter((r) => keys.some((k) => display({ key: k, label: k }, r[k]).toLowerCase().includes(needle)));
  }, [records, q, keys]);

  function startAdd() {
    const blank: Row = { id: "" };
    fields.forEach((f) => (blank[f.key] = f.type === "number" ? 0 : f.type === "tags" ? [] : ""));
    setEditing(blank);
    setOpen(true);
  }
  function startEdit(r: Row) {
    setEditing({ ...r });
    setOpen(true);
  }
  function save() {
    if (!editing) return;
    if (editing.id) {
      const { id, ...patch } = editing;
      update(id, patch);
    } else {
      const { id: _drop, ...rest } = editing;
      add(rest);
    }
    setOpen(false);
    setEditing(null);
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const rows = parseCSV(text);
      const mapped = rows.map((row) => {
        const rec: Row = { id: "" } as Row;
        fields.forEach((f) => {
          if (row[f.key] !== undefined) rec[f.key] = coerce(f, row[f.key]);
        });
        const { id: _omit, ...rest } = rec;
        return rest as Omit<Row, "id">;
      });
      importMany(mapped);
    });
    e.target.value = "";
  }

  function exportCSV() {
    const cols = fields.map((f) => f.key);
    downloadCSV(`${collection}.csv`, toCSV(records, cols));
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <p className="mr-auto text-[13px] font-semibold">
          {title ?? "Records"} <span className="text-muted-foreground">({records.length})</span>
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 w-40 pl-8 text-xs" />
        </div>
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={onImport} />
        <Button size="sm" variant="outline" className="h-8" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> CSV
        </Button>
        <Button size="sm" variant="outline" className="h-8" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" className="h-8" onClick={startAdd}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {tableFields.map((f) => (
                <th key={f.key} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </th>
              ))}
              <th className="w-20 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border/60 hover:bg-secondary/30">
                {tableFields.map((f) => (
                  <td key={f.key} className="max-w-[280px] truncate px-3 py-2 align-top text-[12px]">
                    {f.render ? f.render(r[f.key], r) : display(f, r[f.key])}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(r)} className="rounded p-1 text-muted-foreground hover:text-gold" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remove(r.id)} className="rounded p-1 text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={tableFields.length + 1} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No records. Click <span className="text-gold">Add</span> or import a CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-gold">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{editing.id ? "Edit record" : "Add record"}</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea
                      className={cn(inputCls, "min-h-[72px] resize-y")}
                      value={display(f, editing[f.key])}
                      placeholder={f.placeholder}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className={inputCls}
                      value={String(editing[f.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={inputCls}
                      type={f.type === "number" ? "number" : "text"}
                      value={display(f, editing[f.key])}
                      placeholder={f.placeholder}
                      onChange={(e) => setEditing({ ...editing, [f.key]: coerce(f, e.target.value) })}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={save}>
                {editing.id ? "Save changes" : "Add record"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
