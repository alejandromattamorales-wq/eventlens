import { beforeEach, describe, expect, it, vi } from "vitest";

const clientMock = {
  capture: vi.fn(),
  identify: vi.fn(),
  captureException: vi.fn(),
  _shutdown: vi.fn().mockResolvedValue(undefined),
};

const PostHogCtor = vi.fn(function PostHog() {
  return clientMock;
});

vi.mock("posthog-node", () => ({ PostHog: PostHogCtor }));

describe("createServerAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("constructs a PostHog client with the given options", async () => {
    const { createServerAnalytics } = await import("./server.js");
    createServerAnalytics({ apiKey: "phc_test", apiHost: "https://example.com" });

    expect(PostHogCtor).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ host: "https://example.com" }),
    );
  });

  it("delegates track/identify/captureException/shutdown, threading distinctId through", async () => {
    const { createServerAnalytics } = await import("./server.js");
    const analytics = createServerAnalytics({ apiKey: "phc_test" });

    analytics.track("user_1", "ticket_purchased", { tier: "vip" });
    expect(clientMock.capture).toHaveBeenCalledWith({
      distinctId: "user_1",
      event: "ticket_purchased",
      properties: { tier: "vip" },
    });

    analytics.identify("user_1", { plan: "pro" });
    expect(clientMock.identify).toHaveBeenCalledWith({
      distinctId: "user_1",
      properties: { plan: "pro" },
    });

    const error = new Error("boom");
    analytics.captureException(error, "user_1", { job: "send-email" });
    expect(clientMock.captureException).toHaveBeenCalledWith(error, "user_1", { job: "send-email" });

    await analytics.shutdown();
    expect(clientMock._shutdown).toHaveBeenCalledTimes(1);
  });
});
