/**
 * Phase-2 AI seam.
 *
 * The app ships fully functional with the deterministic generators in
 * `src/lib/generators.ts`. When you're ready to layer in live AI, implement
 * `generateWithAI` here (e.g. with the Anthropic SDK and prompt caching) and
 * have the generators fall back to it when `ANTHROPIC_API_KEY` is present.
 *
 * Keeping this isolated means the UI never changes — only the generation
 * source does.
 */

export const isAIConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

export interface AIRequest {
  system: string;
  prompt: string;
  /** Stable cache key so repeated prompts hit the prompt cache. */
  cacheKey?: string;
}

/**
 * Placeholder. Wire this to Claude (recommended model: claude-sonnet-4-6 for
 * throughput, claude-opus-4-8 for highest-quality copy) in Phase 2.
 */
export async function generateWithAI(_req: AIRequest): Promise<string> {
  throw new Error(
    "AI generation is not configured. Set ANTHROPIC_API_KEY and implement generateWithAI(). " +
      "Until then, the app uses the deterministic generators in src/lib/generators.ts.",
  );
}
