/**
 * The default entry point only exports shared types. Import
 * `eventlens/browser` or `eventlens/server` for an actual client, so
 * consumers never bundle both SDKs when they only need one.
 */
export type { BrowserAnalytics, ServerAnalytics, EventProperties } from "./types.js";
