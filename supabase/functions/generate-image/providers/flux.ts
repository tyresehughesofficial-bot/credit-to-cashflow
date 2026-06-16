// Flux renderer — fal.ai (DEFAULT provider).
// Secret: FAL_KEY  (FLUX_API_KEY also accepted)   Override model: FAL_MODEL / FLUX_MODEL
// fal.ai is synchronous: POST the model endpoint → JSON { images: [{ url }] } →
// fetch the image → return bytes.

import { dims, type Renderer } from "./types.ts";

const BASE = Deno.env.get("FAL_API_BASE") ?? "https://fal.run";
const MODEL = Deno.env.get("FAL_MODEL") ?? Deno.env.get("FLUX_MODEL") ?? "fal-ai/flux/dev";

const falKey = () => Deno.env.get("FAL_KEY") ?? Deno.env.get("FLUX_API_KEY");

// fal flux accepts a custom { width, height } image_size (256–1440, mult. of 16 is safe).
function clamp(n: number): number {
  const c = Math.max(256, Math.min(1440, n || 1024));
  return Math.round(c / 16) * 16;
}

export const flux: Renderer = {
  id: "flux",
  status: () => (falKey() ? "available" : "unavailable"),
  async render(prompt, { size }) {
    const key = falKey();
    if (!key) throw new Error("FAL_KEY secret is not set on the function.");
    const [w, h] = dims(size);

    const res = await fetch(`${BASE}/${MODEL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
      body: JSON.stringify({
        prompt,
        image_size: { width: clamp(w), height: clamp(h) },
        num_images: 1,
        output_format: "png",
        enable_safety_checker: true,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = json?.detail?.[0]?.msg ?? json?.detail ?? json?.error ?? `fal.ai error ${res.status}`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }

    const url = json?.images?.[0]?.url;
    if (!url) throw new Error("fal.ai returned no image URL.");

    // fal can return a data: URL or an https URL — handle both.
    if (url.startsWith("data:")) {
      const b64 = url.split(",")[1] ?? "";
      return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    }
    const img = await fetch(url);
    if (!img.ok) throw new Error(`fal.ai: failed to fetch image (${img.status}).`);
    return new Uint8Array(await img.arrayBuffer());
  },
};
