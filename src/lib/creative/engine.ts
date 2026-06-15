import { DOCUMENTS } from "@/lib/vault/data";
import { retrieve } from "@/lib/vault/engine";

/**
 * Creative Asset Generation Engine.
 * Inputs → knowledge routing (Vault) → creative direction → provider prompts.
 * The actual pixels are produced by `providers.ts` (OpenAI / Firefly).
 */

export type ProviderId = "Flux" | "Adobe Firefly" | "OpenAI" | "Canva";

/** UI provider list — modular & future-ready. Flux is the default renderer;
 *  Firefly/OpenAI plug in later with no refactor; Canva is design-brief only. */
export const PROVIDERS: { id: ProviderId; label: string; note: string }[] = [
  { id: "Flux", label: "Flux", note: "Default renderer" },
  { id: "Adobe Firefly", label: "Firefly", note: "Coming soon" },
  { id: "OpenAI", label: "OpenAI", note: "Backup" },
  { id: "Canva", label: "Canva", note: "Design brief" },
];

/** Maps the UI provider to the Edge Function provider id. */
export const FN_PROVIDER: Record<ProviderId, string> = {
  Flux: "flux",
  "Adobe Firefly": "firefly",
  OpenAI: "openai",
  Canva: "canva",
};

export interface AssetType {
  id: string;
  ratio: string;
  size: string; // OpenAI size hint (WxH)
  motion?: boolean;
}

export const ASSET_TYPES: AssetType[] = [
  { id: "Icon", ratio: "1:1", size: "1024x1024" },
  { id: "Infographic", ratio: "4:5", size: "1024x1536" },
  { id: "Advertisement", ratio: "1:1", size: "1024x1024" },
  { id: "UI Design", ratio: "16:9", size: "1536x1024" },
  { id: "Dashboard", ratio: "16:9", size: "1536x1024" },
  { id: "Landing Page", ratio: "16:9", size: "1536x1024" },
  { id: "Funnel Graphic", ratio: "4:5", size: "1024x1536" },
  { id: "Social Post", ratio: "1:1", size: "1024x1024" },
  { id: "Carousel", ratio: "4:5", size: "1024x1536" },
  { id: "Product Mockup", ratio: "1:1", size: "1024x1024" },
  { id: "Book Cover", ratio: "2:3", size: "1024x1536" },
  { id: "PDF Cover", ratio: "2:3", size: "1024x1536" },
  { id: "Portrait", ratio: "4:5", size: "1024x1536" },
  { id: "Lifestyle Scene", ratio: "3:2", size: "1536x1024" },
  { id: "Brand Graphic", ratio: "1:1", size: "1024x1024" },
  { id: "Commercial Scene", ratio: "16:9", size: "1536x1024" },
  { id: "Motion Graphic", ratio: "16:9", size: "1536x1024", motion: true },
  { id: "Video Storyboard", ratio: "16:9", size: "1536x1024", motion: true },
  { id: "Custom Asset", ratio: "1:1", size: "1024x1024" },
];

export const INDUSTRIES = [
  "Credit Repair", "Business Funding", "Personal Credit", "Business Credit",
  "Financial Education", "Wealth Building", "Entrepreneurship",
];

export const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook", "LinkedIn", "Website", "Print"];

export interface BrandStyle {
  id: string;
  palette: { bg: string; primary: string; accent: string; text: string; muted: string };
  typography: string;
  descriptor: string;
}

export const BRAND_STYLES: BrandStyle[] = [
  { id: "Luxury Black & Gold", palette: { bg: "#0b0a08", primary: "#D4AF37", accent: "#E6C65A", text: "#f3ecd8", muted: "#8a7d5c" },
    typography: "High-contrast serif display (Playfair-style) + clean sans body", descriptor: "luxury black-and-gold financial aesthetic, matte black, metallic gold accents, premium and trustworthy" },
  { id: "Private Banking", palette: { bg: "#0c1320", primary: "#C9A227", accent: "#2a4d8f", text: "#eef2f7", muted: "#7f8aa0" },
    typography: "Refined transitional serif + tabular sans", descriptor: "private-banking navy and antique gold, discreet, institutional, old-money restraint" },
  { id: "Rich Cinema X", palette: { bg: "#07060a", primary: "#E0B64B", accent: "#7a1f2b", text: "#f5efe3", muted: "#8a7a63" },
    typography: "Cinematic condensed display + elegant serif", descriptor: "ultra-premium cinematic editorial look, dramatic chiaroscuro, gold rim light, finance-magazine cover energy" },
  { id: "Apple Liquid Glass", palette: { bg: "#0e0f12", primary: "#cfe6ff", accent: "#7db5ff", text: "#f2f5f8", muted: "#8b93a1" },
    typography: "Geometric sans (SF-style), tight tracking", descriptor: "translucent liquid-glass UI, soft frosted blur, subtle gradients, depth and light, Apple keynote polish" },
  { id: "Corporate Authority", palette: { bg: "#10141a", primary: "#2f6fed", accent: "#5b6573", text: "#eef1f5", muted: "#8893a3" },
    typography: "Neutral grotesk, confident weights", descriptor: "corporate authority, blue and graphite, structured grid, data-driven and credible" },
  { id: "Financial Institution", palette: { bg: "#0d1b2a", primary: "#C8A24B", accent: "#1b4965", text: "#e7eef5", muted: "#7c8aa0" },
    typography: "Institutional serif headlines + sans body", descriptor: "established financial institution, deep banking blue and gold seal, secure and authoritative" },
  { id: "Modern Minimalist", palette: { bg: "#0f0f10", primary: "#e8e8e8", accent: "#a3a3a3", text: "#fafafa", muted: "#7a7a7a" },
    typography: "Minimal sans, generous spacing", descriptor: "modern minimalist, monochrome, generous negative space, single focal element" },
];

export const styleById = (id: string) => BRAND_STYLES.find((s) => s.id === id) ?? BRAND_STYLES[0];
export const assetById = (id: string) => ASSET_TYPES.find((a) => a.id === id) ?? ASSET_TYPES[0];

export interface CreativeInput {
  projectName: string;
  assetType: string;
  topic: string;
  industry: string;
  offer: string;
  platform: string;
  brandStyle: string;
  provider: ProviderId;
}

export interface CreativeDirection {
  direction: string;
  concept: string;
  composition: string;
  palette: string[];
  typography: string;
  brandAlignment: string;
  sources: { title: string; viewUrl?: string }[];
  prompts: { openai: string; firefly: string; canva: string };
}

/** Build creative direction grounded in the knowledge base. */
export function buildDirection(input: CreativeInput): CreativeDirection {
  const style = styleById(input.brandStyle);
  const asset = assetById(input.assetType);
  const query = `${input.topic} ${input.industry} ${input.offer}`.trim();
  const hits = retrieve(query, DOCUMENTS as never, undefined, 3);
  const sources = hits.map((h) => ({ title: h.doc.title, viewUrl: h.doc.viewUrl }));
  const grounding = hits.map((h) => h.doc.summary.split(". ")[0]).filter(Boolean);

  const direction =
    `A ${input.assetType.toLowerCase()} for ${input.industry} (${input.platform}) promoting "${input.offer || input.topic}". ` +
    `Lead with the core promise; keep it premium and conversion-focused. ` +
    (grounding.length ? `Grounded in Triad T knowledge: ${grounding.join("; ")}.` : "");
  const concept = `Hero focal element representing "${input.topic}", ${style.descriptor}. Single clear message, no clutter.`;
  const composition = asset.motion
    ? `Storyboard / motion frame at ${asset.ratio}: open on the hook, reveal the value, end on the CTA. Safe margins for captions.`
    : `${asset.ratio} composition: focal subject on the rule-of-thirds, headline in the negative space, brand mark bottom-corner, generous breathing room.`;
  const typography = style.typography;
  const brandAlignment = `On-brand for "${style.id}". Palette ${style.palette.primary}/${style.palette.bg} with ${style.palette.accent} accents. Tone: ${style.descriptor.split(",")[0]}.`;

  return {
    direction,
    concept,
    composition,
    palette: [style.palette.bg, style.palette.primary, style.palette.accent, style.palette.text],
    typography,
    brandAlignment,
    sources,
    prompts: buildPrompts(input, style, asset, grounding),
  };
}

function buildPrompts(input: CreativeInput, style: BrandStyle, asset: AssetType, grounding: string[]) {
  const ground = grounding.length ? ` Informed by: ${grounding.join("; ")}.` : "";
  const openai =
    `${input.assetType} for ${input.platform}, ${asset.ratio}. Subject: ${input.topic} (${input.industry}). ` +
    `Offer/message: ${input.offer || input.topic}. Style: ${style.descriptor}. ${style.typography}. ` +
    `Composition: focal subject on thirds, clean negative space for a bold headline, brand mark in a corner. ` +
    `Colors: ${style.palette.bg} background, ${style.palette.primary} primary, ${style.palette.accent} accents. ` +
    `Ultra-detailed, professional, high-CTR, no lorem text.${ground}`;
  const firefly =
    `${input.assetType}, ${input.industry}, ${input.topic}, ${style.descriptor}, dramatic studio lighting, ` +
    `${asset.ratio} composition, space for headline. Content type: ${asset.motion ? "Art (storyboard frame)" : "Art"}; ` +
    `Aspect ratio: ${asset.ratio}; Style: premium, editorial, ${style.id}.`;
  const canva =
    `CANVA DESIGN BRIEF\n• Asset: ${input.assetType} (${asset.ratio}) for ${input.platform}\n` +
    `• Goal: ${input.offer || input.topic} — ${input.industry}\n` +
    `• Palette: ${style.palette.bg} / ${style.palette.primary} / ${style.palette.accent}\n` +
    `• Type: ${style.typography}\n• Layout: hero subject left third · bold headline in negative space · Triad T logo bottom-right · thin gold accent line\n` +
    `• Hierarchy: Headline → Subhead → CTA → logo${ground}`;
  return { openai, firefly, canva };
}
