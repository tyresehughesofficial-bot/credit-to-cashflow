// Provider registry. Flux is the default; Firefly + OpenAI are pluggable.
import { type Renderer } from "./types.ts";
import { flux } from "./flux.ts";
import { openai } from "./openai.ts";
import { firefly } from "./firefly.ts";

export const renderers: Record<string, Renderer> = { flux, firefly, openai };
export const DEFAULT_PROVIDER = "flux";
