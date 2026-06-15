// Provider adapter contract. Each renderer turns a final text prompt into image
// bytes. Add a provider by dropping a new file here and registering it in
// index.ts — no orchestrator changes required.

export interface RenderOpts {
  size: string; // "WxH", e.g. "1024x1024"
}

export interface Renderer {
  id: string;
  /** "available" when its API key/secret is configured, else "unavailable". */
  status: () => "available" | "unavailable";
  render: (prompt: string, opts: RenderOpts) => Promise<Uint8Array>;
}

export function dims(size: string): [number, number] {
  const [w, h] = size.split("x").map(Number);
  return [w || 1024, h || 1024];
}
