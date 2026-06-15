// Supabase Edge Function: generate-image
// Scalable AI Creative Engine:
//   Browser → invoke("generate-image")
//           → Claude (Creative Director: refine → master prompt)
//           → provider renderer (flux [default] | firefly | openai)
//           → upload to `creative-assets` Storage
//           → insert into `creative_assets`
//           → { success, imageUrl, storagePath, prompt, provider, row }
//
// Secrets:  FLUX_API_KEY (default renderer), ANTHROPIC_API_KEY (Claude),
//           OPENAI_API_KEY (backup), ADOBE_FIREFLY_* (future).
// Deploy:   supabase functions deploy generate-image

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { refinePrompt } from "./claude.ts";
import { DEFAULT_PROVIDER, renderers } from "./providers/index.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const slug = (s: string) =>
  (s || "asset").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "asset";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const {
      prompt,
      provider = DEFAULT_PROVIDER,
      assetType = "Asset",
      title = "",
      size = "1024x1024",
      tags = [],
      brief = {},
    } = await req.json();

    if (!prompt) return json({ success: false, error: "Missing prompt" }, 400);

    const renderer = renderers[provider];
    if (!renderer) return json({ success: false, error: `Unknown provider '${provider}'.` }, 400);
    if (renderer.status() === "unavailable") {
      return json(
        { success: false, error: `Provider '${provider}' is not enabled. Set its API key/secret (default provider is '${DEFAULT_PROVIDER}').` },
        400,
      );
    }

    // 1) Claude = Creative Director → master prompt (graceful fallback to input)
    const masterPrompt = await refinePrompt(prompt, { assetType, title, brief });

    // 2) Render via the selected provider adapter
    let bytes: Uint8Array;
    try {
      bytes = await renderer.render(masterPrompt, { size });
    } catch (e) {
      return json({ success: false, error: `${provider} render failed: ${e instanceof Error ? e.message : String(e)}` }, 502);
    }

    // 3) Upload + 4) record metadata (service role bypasses RLS)
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const storagePath = `${slug(title || assetType)}/${Date.now()}.png`;
    const up = await supabase.storage.from("creative-assets").upload(storagePath, bytes, {
      contentType: "image/png",
      upsert: true,
    });
    if (up.error) return json({ success: false, error: `Storage upload failed: ${up.error.message}` }, 500);

    const { data: pub } = supabase.storage.from("creative-assets").getPublicUrl(storagePath);
    const imageUrl = pub.publicUrl;

    const { data: row, error: dbErr } = await supabase
      .from("creative_assets")
      .insert({
        title: title || assetType,
        prompt: masterPrompt,
        provider,
        asset_type: assetType,
        image_url: imageUrl,
        storage_path: storagePath,
        tags,
        favorite: false,
      })
      .select()
      .single();
    if (dbErr) return json({ success: false, error: `DB insert failed: ${dbErr.message}` }, 500);

    return json({ success: true, imageUrl, storagePath, prompt: masterPrompt, provider, row });
  } catch (e) {
    return json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
