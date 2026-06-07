// Supabase Edge Function: generate-image
// Secure server-side image generation. The OpenAI key lives ONLY here (as the
// `OPENAI_API_KEY` function secret) — never in the browser.
//
//   Browser → supabase.functions.invoke("generate-image")
//           → OpenAI Images API (gpt-image-1)
//           → upload to `creative-assets` Storage bucket
//           → insert metadata into `creative_assets`
//           → return { success, imageUrl, storagePath, prompt, provider, row }
//
// Deploy:  supabase functions deploy generate-image
// Secret:  supabase secrets set OPENAI_API_KEY=sk-...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function slug(s: string) {
  return (s || "asset").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "asset";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const {
      prompt,
      provider = "openai",
      assetType = "Asset",
      title = "",
      size = "1024x1024",
      tags = [],
    } = await req.json();

    if (!prompt) return json({ success: false, error: "Missing prompt" }, 400);

    // Adobe Firefly is future-ready: the contract is identical, only this branch
    // changes when the Firefly OAuth flow is added.
    if (provider !== "openai") {
      return json({ success: false, error: `Provider '${provider}' not yet supported (OpenAI only for now).` }, 400);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return json({ success: false, error: "OPENAI_API_KEY secret is not set on the function." }, 500);
    }

    // 1) OpenAI image
    const aiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size, n: 1 }),
    });
    const aiJson = await aiRes.json();
    if (!aiRes.ok) {
      return json({ success: false, error: aiJson?.error?.message ?? `OpenAI error ${aiRes.status}` }, 502);
    }
    const b64 = aiJson?.data?.[0]?.b64_json;
    if (!b64) return json({ success: false, error: "OpenAI returned no image." }, 502);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    // Service-role client (auto-injected env on Supabase) — bypasses RLS for write.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 2) Upload to Storage
    const storagePath = `${slug(title || assetType)}/${Date.now()}.png`;
    const up = await supabase.storage.from("creative-assets").upload(storagePath, bytes, {
      contentType: "image/png",
      upsert: true,
    });
    if (up.error) return json({ success: false, error: `Storage upload failed: ${up.error.message}` }, 500);

    const { data: pub } = supabase.storage.from("creative-assets").getPublicUrl(storagePath);
    const imageUrl = pub.publicUrl;

    // 3) Insert metadata
    const { data: row, error: dbErr } = await supabase
      .from("creative_assets")
      .insert({
        title: title || assetType,
        prompt,
        provider: "openai",
        asset_type: assetType,
        image_url: imageUrl,
        storage_path: storagePath,
        tags,
        favorite: false,
      })
      .select()
      .single();
    if (dbErr) return json({ success: false, error: `DB insert failed: ${dbErr.message}` }, 500);

    return json({ success: true, imageUrl, storagePath, prompt, provider: "openai", row });
  } catch (e) {
    return json({ success: false, error: String(e) }, 500);
  }
});
