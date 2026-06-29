// Supabase Edge Function: generate-text  (single self-contained file)
//
// The real-AI brain for the Command Center. Holds ANTHROPIC_API_KEY server-side
// and calls Claude. The frontend invokes this via lib/ai.ts → aiText().
//
//   Browser → invoke("generate-text", { system, prompt, model?, maxTokens? })
//           → Anthropic Messages API → { text }
//
// Secret:  ANTHROPIC_API_KEY (required).  Optional: CLAUDE_MODEL (default model).
// Deploy:  supabase functions deploy generate-text --no-verify-jwt

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ENV = (k: string, d = "") =>
  Deno.env.get(k) ?? Deno.env.get(k.toUpperCase()) ?? Deno.env.get(k.toLowerCase()) ?? d;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { system, prompt, model, maxTokens, temperature } = await req.json().catch(() => ({}));
    if (!prompt) return json({ error: "Missing prompt" }, 400);

    const key = ENV("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "ANTHROPIC_API_KEY secret is not set." }, 400);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: model || ENV("CLAUDE_MODEL", "claude-sonnet-4-6"),
        max_tokens: maxTokens || 1024,
        temperature: temperature ?? 0.7,
        system: system || "You are a precise, helpful business operations assistant for a credit-repair and funding company.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: `Anthropic ${res.status}: ${detail.slice(0, 300)}` }, 502);
    }

    const data = await res.json();
    const text = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();

    return json({ text, model: data.model });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
