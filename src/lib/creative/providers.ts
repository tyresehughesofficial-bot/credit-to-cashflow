import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { assetById, type CreativeDirection, type CreativeInput } from "./engine";

/**
 * Asset generation — routed through the Supabase Edge Function `generate-image`.
 * The browser NEVER touches the OpenAI key (it lives only as the function's
 * `OPENAI_API_KEY` secret), which removes both the key-exposure and CORS issues.
 *
 *   generate() → generateAsset() → supabase.functions.invoke("generate-image")
 *              → OpenAI → Storage → DB → { imageUrl } → <img/>
 *
 * `missing_key` here means "Supabase isn't connected" (NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY not set), so the function can't be reached.
 */

export type GenStatus = "generated" | "missing_key" | "canva" | "error";

export interface GenRow {
  id: string;
  [k: string]: unknown;
}

export interface GenResult {
  status: GenStatus;
  provider: string;
  width: number;
  height: number;
  assetUrl?: string;
  storagePath?: string;
  row?: GenRow;
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

  // Canva is design-only — no AI image.
  if (input.provider === "Canva") {
    return { status: "canva", provider: "Canva", width, height };
  }

  // Needs Supabase to reach the Edge Function.
  if (!isSupabaseConfigured) {
    return { status: "missing_key", provider: input.provider, width, height };
  }
  const sb = createClient();
  if (!sb) return { status: "missing_key", provider: input.provider, width, height };

  try {
    const { data, error } = await sb.functions.invoke("generate-image", {
      body: {
        prompt: direction.prompts.openai,
        provider: input.provider === "Adobe Firefly" ? "firefly" : "openai",
        assetType: input.assetType,
        title: input.projectName || input.topic,
        size: asset.size,
      },
    });

    if (error) {
      return { status: "error", provider: input.provider, width, height, error: error.message };
    }
    if (!data?.success) {
      return { status: "error", provider: input.provider, width, height, error: data?.error ?? "Generation failed." };
    }
    return {
      status: "generated",
      provider: input.provider,
      width,
      height,
      assetUrl: data.imageUrl,
      storagePath: data.storagePath,
      row: data.row,
    };
  } catch (e) {
    return { status: "error", provider: input.provider, width, height, error: String(e) };
  }
}
