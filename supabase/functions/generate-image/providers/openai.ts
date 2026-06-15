// OpenAI renderer — BACKUP / experimentation provider.
// Secret: OPENAI_API_KEY. Uses the Images API (gpt-image-1).

import { type Renderer } from "./types.ts";

export const openai: Renderer = {
  id: "openai",
  status: () => (Deno.env.get("OPENAI_API_KEY") ? "available" : "unavailable"),
  async render(prompt, { size }) {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) throw new Error("OPENAI_API_KEY secret is not set on the function.");
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size, n: 1 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? `OpenAI error ${res.status}`);
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image.");
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  },
};
