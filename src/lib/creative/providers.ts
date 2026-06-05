import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { assetById, styleById, type CreativeDirection, type CreativeInput } from "./engine";

/**
 * Asset generation providers.
 *
 * - OpenAI: when NEXT_PUBLIC_OPENAI_API_KEY is set, generates a real image via
 *   the Images API (move server-side for production to protect the key).
 * - Adobe Firefly: needs the OAuth client-credentials flow + a server proxy
 *   (browser CORS + secret), so in this static build it falls back to the mock
 *   and is documented as a Phase-2 server route.
 * - No key configured → a branded on-style SVG mock so the flow is fully usable.
 * Rendered assets upload to the Supabase `creative-assets` bucket when configured.
 */

export interface GeneratedAsset {
  assetUrl: string;
  width: number;
  height: number;
  provider: string;
  real: boolean; // true if produced by a real provider API
}

function dims(size: string): [number, number] {
  const [w, h] = size.split("x").map(Number);
  return [w || 1024, h || 1024];
}

export async function generateAsset(
  input: CreativeInput,
  direction: CreativeDirection,
): Promise<GeneratedAsset> {
  const asset = assetById(input.assetType);
  const [width, height] = dims(asset.size);

  if (input.provider === "OpenAI" && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: "gpt-image-1", prompt: direction.prompts.openai, size: asset.size, n: 1 }),
      });
      const json = await res.json();
      const b64 = json?.data?.[0]?.b64_json;
      const url = json?.data?.[0]?.url;
      const assetUrl = b64 ? `data:image/png;base64,${b64}` : url;
      if (assetUrl) {
        const stored = await uploadToSupabase(assetUrl, input);
        return { assetUrl: stored, width, height, provider: "OpenAI", real: true };
      }
    } catch {
      /* fall through to mock */
    }
  }

  // Branded mock (also used for Firefly/Canva preview until server keys exist)
  const svg = brandedMock(input, direction, width, height);
  const assetUrl = `data:image/svg+xml;base64,${b64encode(svg)}`;
  const stored = await uploadToSupabase(assetUrl, input);
  return { assetUrl: stored, width, height, provider: input.provider, real: false };
}

async function uploadToSupabase(dataOrUrl: string, input: CreativeInput): Promise<string> {
  if (!isSupabaseConfigured) return dataOrUrl;
  const sb = createClient();
  if (!sb) return dataOrUrl;
  try {
    const blob = await (await fetch(dataOrUrl)).blob();
    const ext = blob.type.includes("svg") ? "svg" : blob.type.includes("png") ? "png" : "webp";
    const path = `${slug(input.projectName)}/${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("creative-assets").upload(path, blob, { upsert: true, contentType: blob.type });
    if (error) return dataOrUrl;
    const { data } = sb.storage.from("creative-assets").getPublicUrl(path);
    return data.publicUrl || dataOrUrl;
  } catch {
    return dataOrUrl;
  }
}

const slug = (s: string) => (s || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function b64encode(s: string): string {
  if (typeof window !== "undefined") return window.btoa(unescape(encodeURIComponent(s)));
  return Buffer.from(s, "utf-8").toString("base64");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines - 1) break;
    } else line = (line + " " + w).trim();
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  return lines.slice(0, maxLines);
}

/** A clean, on-brand SVG poster used as the preview asset (and as a real,
 *  downloadable SVG when no image API is wired). */
function brandedMock(input: CreativeInput, dir: CreativeDirection, w: number, h: number): string {
  const s = styleById(input.brandStyle).palette;
  const asset = assetById(input.assetType);
  const pad = Math.round(Math.min(w, h) * 0.06);
  const headSize = Math.round(Math.min(w, h) * 0.085);
  const headLines = wrap(input.topic || input.projectName || "Creative Asset", Math.round(w / (headSize * 0.55)), 3);
  const motionFrames = asset.motion
    ? `<g>${[0, 1, 2]
        .map((i) => `<rect x="${pad + i * (w * 0.2 + 14)}" y="${h - pad - h * 0.16}" width="${w * 0.2}" height="${h * 0.13}" rx="8" fill="${s.bg}" stroke="${s.primary}" stroke-opacity="0.5"/>`)
        .join("")}<path d="M ${w / 2 - 14} ${h - pad - h * 0.16 + h * 0.05} l 26 14 l -26 14 z" fill="${s.primary}"/></g>`
    : "";
  const swatches = dir.palette
    .map((c, i) => `<rect x="${w - pad - (dir.palette.length - i) * 34}" y="${pad}" width="26" height="26" rx="5" fill="${c}" stroke="${s.muted}" stroke-opacity="0.4"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="${s.bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${s.accent}"/><stop offset="100%" stop-color="${s.primary}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="${pad / 2}" y="${pad / 2}" width="${w - pad}" height="${h - pad}" rx="${pad / 2}" fill="none" stroke="${s.primary}" stroke-opacity="0.35"/>
  ${swatches}
  <g font-family="Georgia, 'Times New Roman', serif" fill="${s.primary}">
    <circle cx="${pad + 16}" cy="${pad + 14}" r="16" fill="none" stroke="url(#gold)" stroke-width="2"/>
    <text x="${pad + 16}" y="${pad + 20}" font-size="18" font-weight="700" text-anchor="middle">T</text>
  </g>
  <text x="${pad}" y="${pad + 64}" font-family="Inter, Arial, sans-serif" font-size="${Math.round(headSize * 0.32)}" letter-spacing="3" fill="${s.muted}">TRIAD T ENTERPRISE · ${esc(input.assetType.toUpperCase())}</text>
  <g font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="${s.text}">
    ${headLines
      .map((l, i) => `<text x="${pad}" y="${h * 0.42 + i * headSize * 1.08}" font-size="${headSize}">${esc(l)}</text>`)
      .join("")}
  </g>
  <text x="${pad}" y="${h * 0.42 + headLines.length * headSize * 1.08 + 18}" font-family="Inter, Arial, sans-serif" font-size="${Math.round(headSize * 0.34)}" fill="url(#gold)">${esc(input.offer || input.industry)}</text>
  <rect x="${pad}" y="${h * 0.42 + headLines.length * headSize * 1.08 + 34}" width="${w * 0.18}" height="3" fill="url(#gold)"/>
  <text x="${pad}" y="${h - pad - (asset.motion ? h * 0.18 : 6)}" font-family="Inter, Arial, sans-serif" font-size="${Math.round(headSize * 0.26)}" fill="${s.muted}">${esc(input.industry)} · ${esc(input.platform)} · ${esc(input.brandStyle)}</text>
  ${motionFrames}
</svg>`;
}
