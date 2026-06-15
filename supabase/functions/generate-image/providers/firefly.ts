// Adobe Firefly renderer — FUTURE provider (Adobe ecosystem / commercial).
// Secrets (later): ADOBE_FIREFLY_CLIENT_ID, ADOBE_FIREFLY_CLIENT_SECRET.
// Implement the OAuth client-credentials flow + Firefly generate call here;
// the orchestrator and frontend need no changes.

import { type Renderer } from "./types.ts";

export const firefly: Renderer = {
  id: "firefly",
  status: () => "unavailable",
  render() {
    return Promise.reject(new Error("Adobe Firefly is not enabled yet. Use the default 'flux' provider."));
  },
};
