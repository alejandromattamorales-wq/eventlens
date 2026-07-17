import posthog from "posthog-js";
import type { BrowserAnalytics, EventProperties } from "./types.js";

export interface BrowserAnalyticsOptions {
  apiKey: string;
  apiHost?: string;
  debug?: boolean;
}

let initialized = false;

/**
 * Creates a browser analytics client backed by PostHog. Safe to call once
 * during app startup (e.g. in a root layout/provider); subsequent calls
 * reuse the same underlying PostHog instance.
 */
export function createBrowserAnalytics(options: BrowserAnalyticsOptions): BrowserAnalytics {
  if (!initialized) {
    posthog.init(options.apiKey, {
      api_host: options.apiHost ?? "https://us.i.posthog.com",
      debug: options.debug ?? false,
      person_profiles: "identified_only",
    });
    initialized = true;
  }

  return {
    track(event: string, properties?: EventProperties) {
      posthog.capture(event, properties);
    },
    identify(distinctId: string, traits?: EventProperties) {
      posthog.identify(distinctId, traits);
    },
    captureException(error: unknown, context?: EventProperties) {
      posthog.captureException(error, context);
    },
    reset() {
      posthog.reset();
    },
  };
}
