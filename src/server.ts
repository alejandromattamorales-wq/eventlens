import { PostHog } from "posthog-node";
import type { EventProperties, ServerAnalytics } from "./types.js";

export interface ServerAnalyticsOptions {
  apiKey: string;
  apiHost?: string;
  /** Defaults to true: send events immediately instead of batching, which
   * matters in short-lived environments (serverless functions, CLI scripts)
   * that may exit before a batched flush would fire. */
  flushImmediately?: boolean;
}

/**
 * Creates a server-side analytics client backed by PostHog. Unlike the
 * browser client, this has no persisted identity, so every call takes an
 * explicit `distinctId`. Call `shutdown()` before the process exits so
 * queued events are flushed.
 */
export function createServerAnalytics(options: ServerAnalyticsOptions): ServerAnalytics {
  const client = new PostHog(options.apiKey, {
    host: options.apiHost ?? "https://us.i.posthog.com",
    flushAt: options.flushImmediately === false ? 20 : 1,
    flushInterval: options.flushImmediately === false ? 10000 : 0,
  });

  return {
    track(distinctId: string, event: string, properties?: EventProperties) {
      client.capture({ distinctId, event, properties });
    },
    identify(distinctId: string, traits?: EventProperties) {
      client.identify({ distinctId, properties: traits });
    },
    captureException(error: unknown, distinctId?: string, context?: EventProperties) {
      client.captureException(error, distinctId, context);
    },
    async shutdown() {
      await client._shutdown();
    },
  };
}
