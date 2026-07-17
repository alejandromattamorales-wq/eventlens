export type EventProperties = Record<string, unknown>;

/**
 * Browser clients have a persisted anonymous/identified distinct ID, so
 * `track`/`captureException` don't need one passed in explicitly.
 */
export interface BrowserAnalytics {
  track(event: string, properties?: EventProperties): void;
  identify(distinctId: string, traits?: EventProperties): void;
  captureException(error: unknown, context?: EventProperties): void;
  /** Clears the local distinct ID, e.g. on logout. */
  reset(): void;
}

/**
 * Server clients have no persisted identity, so every call needs an
 * explicit `distinctId` for the actor the event belongs to.
 */
export interface ServerAnalytics {
  track(distinctId: string, event: string, properties?: EventProperties): void;
  identify(distinctId: string, traits?: EventProperties): void;
  captureException(error: unknown, distinctId?: string, context?: EventProperties): void;
  /** Flushes any queued events. Call before the process exits (e.g. in a serverless handler). */
  shutdown(): Promise<void>;
}
