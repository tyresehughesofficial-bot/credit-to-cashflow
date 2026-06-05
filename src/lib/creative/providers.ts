import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { assetById, type CreativeDirection, type CreativeInput } from "./engine";

/**
 * Asset generation providers — REAL images only.
 *
 * - OpenAI: NEXT_PUBLIC_OPENAI_API_KEY → Images API → real PNG.
 * - Adobe Firefly: requires the OAuth client-credentials flow (a server route,
 *   Phase 2) — without it we return `missing_key` rather than a fake image.
 * - Canva: design-brief only (no generation).
 * Real images upload to the Supabase `creative-assets` bucket when configured;
 * otherwise the (real) data URL is used directly. We NEVER fabricate an image.
 */

export type GenStatus = "generated" | "missing_key" | "canva" | "error";

export interface GenResult {
  status: GenStatus;
  provider: string;
  width: number;
  height: number;
  assetUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  error?: string;
}

function dims(size: string): [number, number] {
  const [w, h] = size.split("x").map(Number);
  return [w || 1024, h || 1024];
}

export async function generateAsset(
  input: CreativeInput,
  direction: CreativeDirection,
): Promise<GenResult> {
  const asset = assetById(input.assetType);
  const [width, height] = dims(asset.size);

  if (input.provider === "Canva") {
    return { status: "canva", provider: "Canva", width, height };
  }

  if (input.provider === "OpenAI") {
    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!key) return { status: "missing_key", provider: "OpenAI", width, height };
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: "gpt-image-1", prompt: direction.prompts.openai, size: asset.size, n: 1 }),
      });
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error?.message ?? `OpenAI error ${res.status}`;
        return { status: "error", provider: "OpenAI", width, height, error: msg };
      }
      const json = await res.json();
      const b64 = json?.data?.[0]?.b64_json;
      const url = json?.data?.[0]?.url;
      const raw = b64 ? `data:image/png;base64,${b64}` : url;
      if (!raw) return { status: "error", provider: "OpenAI", width, height, error: "No image returned." };
      const fileSize = b64 ? Math.floor((b64.length * 3) / 4) : 0;
      const stored = await uploadToSupabase(raw, input);
      return { status: "generated", provider: "OpenAI", width, height, assetUrl: stored, thumbnailUrl: stored, fileSize };
    } catch (e) {
      return { status: "error", provider: "OpenAI", width, height, error: String(e) };
    }
  }

  // Adobe Firefly — needs server-side OAuth (client_id/secret). No safe client call.
  return { status: "missing_key", provider: "Adobe Firefly", width, height };
}

async function uploadToSupabase(dataOrUrl: string, input: CreativeInput): Promise<string> {
  if (!isSupabaseConfigured) return dataOrUrl;
  const sb = createClient();
  if (!sb) return dataOrUrl;
  try {
    const blob = await (await fetch(dataOrUrl)).blob();
    const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const path = `${slug(input.projectName || input.topic)}/${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("creative-assets").upload(path, blob, { upsert: true, contentType: blob.type });
    if (error) return dataOrUrl;
    const { data } = sb.storage.from("creative-assets").getPublicUrl(path);
    return data.publicUrl || dataOrUrl;
  } catch {
    return dataOrUrl;
  }
}

const slug = (s: string) => (s || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
