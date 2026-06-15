// Flux renderer — Black Forest Labs API (DEFAULT provider).
// Secret: FLUX_API_KEY   (optional overrides: FLUX_API_BASE, FLUX_MODEL)
// Flow: submit job → poll until Ready → fetch the sample image → return bytes.

import { dims, type Renderer } from "./types.ts";

const BASE = Deno.env.get("FLUX_API_BASE") ?? "https://api.bfl.ml";
const MODEL = Deno.env.get("FLUX_MODEL") ?? "flux-pro-1.1";

// Flux requires dimensions that are multiples of 32, within [256, 1440].
function clamp32(n: number): number {
  const c = Math.max(256, Math.min(1440, n || 1024));
  return Math.round(c / 32) * 32;
}

export const flux: Renderer = {
  id: "flux",
  status: () => (Deno.env.get("FLUX_API_KEY") ? "available" : "unavailable"),
  async render(prompt, { size }) {
    const key = Deno.env.get("FLUX_API_KEY");
    if (!key) throw new Error("FLUX_API_KEY secret is not set on the function.");
    const [w, h] = dims(size);

    const submit = await fetch(`${BASE}/v1/${MODEL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json", "x-key": key },
      body: JSON.stringify({ prompt, width: clamp32(w), height: clamp32(h), output_format: "png" }),
    });
    const sj = await submit.json();
    if (!submit.ok) throw new Error(sj?.error ?? `Flux submit error ${submit.status}`);
    const pollUrl: string = sj.polling_url ?? `${BASE}/v1/get_result?id=${sj.id}`;

    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const pr = await fetch(pollUrl, { headers: { accept: "application/json", "x-key": key } });
      const pj = await pr.json();
      const status = pj?.status;
      if (status === "Ready") {
        const url = pj?.result?.sample;
        if (!url) throw new Error("Flux: result had no sample URL.");
        const img = await fetch(url);
        if (!img.ok) throw new Error(`Flux: failed to fetch sample (${img.status}).`);
        return new Uint8Array(await img.arrayBuffer());
      }
      if (status === "Error" || status === "Failed" || status === "Content Moderated") {
        throw new Error(`Flux returned status "${status}".`);
      }
    }
    throw new Error("Flux generation timed out.");
  },
};
