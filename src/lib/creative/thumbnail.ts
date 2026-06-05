/**
 * Thumbnail Studio — prompt generation + external provider launching.
 *
 * Phase 1: generate provider-tailored prompts and hand off to ChatGPT / Adobe
 * Firefly / Canva (copy prompt → open tool in a new tab). No image API.
 * Phase 2 seam: when OPENAI_API_KEY / ADOBE_FIREFLY_API_KEY are set, the same
 * prompts can drive in-app generation — the generators below stay unchanged.
 */

export interface ThumbnailInput {
  topic: string;
  platform: string;
  contentCategory: string;
  emotion: string;
  brandStyle: string;
}

export interface ThumbnailPrompts {
  chatgpt: string;
  firefly: string;
  canva: string;
}

export const PLATFORMS = ["YouTube", "YouTube Shorts", "Instagram", "TikTok", "Facebook", "X"];
export const CATEGORIES = [
  "Credit Repair", "Personal Credit", "Business Credit", "Funding", "Financial Education",
  "Consumer Rights", "Credit Myths", "Entrepreneurship", "Wealth Building",
];
export const EMOTIONS = ["Shock", "Curiosity", "Authority", "Urgency", "Excitement", "Fear", "Trust"];
export const BRAND_STYLES = [
  "Luxury Black & Gold", "Bold High-Contrast", "Clean Minimal", "Cinematic", "Rich Cinema X",
];

const ASPECT: Record<string, string> = {
  YouTube: "16:9 (1280×720)",
  "YouTube Shorts": "9:16 (1080×1920)",
  Instagram: "4:5 (1080×1350)",
  TikTok: "9:16 (1080×1920)",
  Facebook: "16:9 (1200×630)",
  X: "16:9 (1200×675)",
};

const STYLE_DESCRIPTOR: Record<string, string> = {
  "Luxury Black & Gold": "luxury black-and-gold financial aesthetic, deep matte black background, metallic gold accents and typography, premium and trustworthy",
  "Bold High-Contrast": "bold high-contrast colors, punchy saturated accent color, thick readable typography, MrBeast-style attention-grabbing",
  "Clean Minimal": "clean minimal layout, generous negative space, single focal subject, modern sans-serif type",
  Cinematic: "cinematic lighting, dramatic rim light, shallow depth of field, filmic color grade",
  "Rich Cinema X": "ultra-premium cinematic editorial look, dramatic chiaroscuro lighting, gold rim light, finance-magazine cover energy",
};

const EMOTION_CUE: Record<string, string> = {
  Shock: "shocked facial expression, wide eyes, open mouth, jarring contrast",
  Curiosity: "intriguing partial reveal, a hidden element, a question implied visually",
  Authority: "confident expert posture, direct eye contact, commanding presence",
  Urgency: "red alert accents, countdown energy, 'now' tension",
  Excitement: "celebratory energy, bright highlights, upward motion",
  Fear: "warning tone, dark ominous accents, cautionary expression",
  Trust: "calm professional warmth, reassuring expression, clean credible framing",
};

function headline(input: ThumbnailInput): string {
  const t = input.topic.trim();
  // a short punchy overlay suggestion derived from the topic
  const short = t.length > 38 ? t.slice(0, 36).trim() + "…" : t;
  return short.toUpperCase();
}

export function generatePrompts(input: ThumbnailInput): ThumbnailPrompts {
  const ratio = ASPECT[input.platform] ?? "16:9";
  const style = STYLE_DESCRIPTOR[input.brandStyle] ?? input.brandStyle;
  const cue = EMOTION_CUE[input.emotion] ?? input.emotion;
  const subject = `${input.contentCategory} content creator / expert`;
  const overlay = headline(input);

  const chatgpt =
    `Create a high-CTR ${input.platform} thumbnail (${ratio}) about "${input.topic}". ` +
    `Subject: a ${subject} conveying ${input.emotion.toLowerCase()} — ${cue}. ` +
    `Style: ${style}. Composition: bold focal subject on one side, leave clean negative space on the opposite side for a large text overlay. ` +
    `Add a short, ultra-readable headline overlay: "${overlay}". ` +
    `Lighting dramatic, colors on-brand (black, gold, white), crisp and professional. ` +
    `Make it stop the scroll. Render the image.`;

  const firefly =
    `${input.contentCategory} ${input.platform} thumbnail, ${subject}, ${input.emotion.toLowerCase()} expression, ${cue}, ` +
    `${style}, dramatic studio lighting, strong rim light, high detail, ${ratio} composition, ` +
    `space reserved on one side for headline text. ` +
    `Settings → Content type: Art; Aspect ratio: ${ratio.split(" ")[0]}; Style: dramatic, premium, editorial. ` +
    `(Add the headline "${overlay}" as a text layer after generating.)`;

  const canva =
    `Magic Media → Text to Image prompt: "${subject}, ${input.emotion.toLowerCase()}, ${cue}, ${style}, ${ratio} thumbnail for ${input.platform} about ${input.topic}". ` +
    `Then design: place the subject on one third, add a bold gold-on-black headline "${overlay}", a small Triad T logo, and a thin gold accent line. ` +
    `Use a ${input.platform} thumbnail template at ${ratio}.`;

  return { chatgpt, firefly, canva };
}

/* ───────────────────────── Providers ───────────────────────── */

export type ProviderId = "chatgpt" | "firefly" | "canva";

export interface Provider {
  id: ProviderId;
  label: string;
  /** Base URL opened in a new tab (prompt is copied to clipboard for paste). */
  url: (prompt: string) => string;
  promptKey: keyof ThumbnailPrompts;
}

export const PROVIDERS: Provider[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    url: () => "https://chatgpt.com/",
    promptKey: "chatgpt",
  },
  {
    id: "firefly",
    label: "Adobe Firefly",
    url: (prompt) => `https://firefly.adobe.com/generate/images?prompt=${encodeURIComponent(prompt)}`,
    promptKey: "firefly",
  },
  {
    id: "canva",
    label: "Canva",
    url: () => "https://www.canva.com/",
    promptKey: "canva",
  },
];
