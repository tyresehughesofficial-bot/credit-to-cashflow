// Claude = Creative Director. Turns the brief into ONE production-ready
// text-to-image prompt for the rendering engine. Secret: ANTHROPIC_API_KEY.
// If the key is absent, we gracefully fall back to the incoming prompt.

const MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-5-sonnet-latest";

const SYSTEM =
  "You are an elite creative director for Triad T Enterprise, a luxury black-and-gold " +
  "fintech brand (credit repair, business funding, wealth building). Turn the brief into " +
  "ONE vivid, production-ready text-to-image prompt for a diffusion model (Flux). Specify " +
  "subject, composition, lighting, color palette (deep black + metallic gold accents), mood, " +
  "lens/camera, and leave clean negative space for a headline. Premium, high-CTR, no on-image " +
  "lorem text. Output ONLY the prompt — no preamble, no quotes.";

export async function refinePrompt(
  rawPrompt: string,
  ctx: { assetType?: string; title?: string; brief?: Record<string, unknown> },
): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return rawPrompt; // graceful fallback — engine prompt is already strong

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content:
              `Asset type: ${ctx.assetType ?? ""}\nTitle: ${ctx.title ?? ""}\n` +
              `Context: ${JSON.stringify(ctx.brief ?? {})}\n\nBrief / draft prompt:\n${rawPrompt}`,
          },
        ],
      }),
    });
    if (!res.ok) return rawPrompt;
    const json = await res.json();
    const text = json?.content?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : rawPrompt;
  } catch {
    return rawPrompt;
  }
}
