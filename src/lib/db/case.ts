/** camelCase ⇄ snake_case helpers so the app can use camelCase records while
 *  Supabase tables use snake_case columns. */

export const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export function rowToRecord<T extends Record<string, unknown>>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out as T;
}

export function recordToRow(rec: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) out[toSnake(k)] = v;
  return out;
}
