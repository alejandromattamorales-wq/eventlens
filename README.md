# eventlens

A small, consistent analytics API — `track`, `identify`, `captureException` — shared across projects, backed by [PostHog](https://posthog.com).

It's a thin wrapper, not a new analytics engine: `eventlens/browser` wraps [`posthog-js`](https://posthog.com/docs/libraries/js) and `eventlens/server` wraps [`posthog-node`](https://posthog.com/docs/libraries/node). The point is that consuming projects depend on **this** package's stable API instead of calling a specific PostHog SDK directly, so the underlying provider can change in one place without touching every project.

## Install

```sh
npm install eventlens
```

You'll need a PostHog project API key. PostHog's free tier covers 1M events/month, 100K exceptions/month, and 5K session recordings/month — see [posthog.com/pricing](https://posthog.com/pricing). Self-hosting is also free (MIT-licensed core) if you'd rather run it yourself.

## Browser usage

For client-side apps (React, Next.js, etc). Call `createBrowserAnalytics` once at startup — repeat calls reuse the same underlying PostHog instance.

```ts
import { createBrowserAnalytics } from "eventlens/browser";

const analytics = createBrowserAnalytics({
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST, // optional, defaults to PostHog Cloud US
});

analytics.track("ticket_purchased", { tier: "vip", priceCents: 5000 });
analytics.identify("user_123", { plan: "pro" });
analytics.captureException(error, { page: "/checkout" });
analytics.reset(); // call on logout
```

## Server usage

For backend services / API routes / scripts. There's no persisted session, so every call takes an explicit `distinctId` for the actor the event belongs to.

```ts
import { createServerAnalytics } from "eventlens/server";

const analytics = createServerAnalytics({
  apiKey: process.env.POSTHOG_KEY!,
  apiHost: process.env.POSTHOG_HOST, // optional
});

analytics.track("user_123", "ticket_purchased", { tier: "vip" });
analytics.identify("user_123", { plan: "pro" });
analytics.captureException(error, "user_123", { job: "send-confirmation-email" });

// Before the process exits (serverless handlers, scripts, shutdown hooks):
await analytics.shutdown();
```

By default the server client flushes every event immediately (`flushImmediately: true`), since short-lived environments like serverless functions may exit before a batched flush would fire. Pass `flushImmediately: false` for long-running processes where batching (up to 20 events / 10s) is fine and reduces request volume.

## Why two entry points instead of one?

`eventlens` (the default import) only exports shared types — no SDK code. Importing `eventlens/browser` or `eventlens/server` explicitly means a backend project never bundles `posthog-js`, and a browser bundle never pulls in `posthog-node`.

## Development

```sh
npm install
npm run build      # tsup -> dist/
npm run typecheck
npm run lint
npm run test
```
