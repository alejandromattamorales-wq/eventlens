import { beforeEach, describe, expect, it, vi } from "vitest";

const posthogMock = {
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  captureException: vi.fn(),
  reset: vi.fn(),
};

vi.mock("posthog-js", () => ({ default: posthogMock }));

describe("createBrowserAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("initializes PostHog once with the given options", async () => {
    const { createBrowserAnalytics } = await import("./browser.js");
    createBrowserAnalytics({ apiKey: "phc_test", apiHost: "https://example.com" });
    createBrowserAnalytics({ apiKey: "phc_test", apiHost: "https://example.com" });

    expect(posthogMock.init).toHaveBeenCalledTimes(1);
    expect(posthogMock.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ api_host: "https://example.com" }),
    );
  });

  it("delegates track/identify/captureException/reset to posthog-js", async () => {
    const { createBrowserAnalytics } = await import("./browser.js");
    const analytics = createBrowserAnalytics({ apiKey: "phc_test" });

    analytics.track("ticket_purchased", { tier: "vip" });
    expect(posthogMock.capture).toHaveBeenCalledWith("ticket_purchased", { tier: "vip" });

    analytics.identify("user_1", { plan: "pro" });
    expect(posthogMock.identify).toHaveBeenCalledWith("user_1", { plan: "pro" });

    const error = new Error("boom");
    analytics.captureException(error, { page: "/checkout" });
    expect(posthogMock.captureException).toHaveBeenCalledWith(error, { page: "/checkout" });

    analytics.reset();
    expect(posthogMock.reset).toHaveBeenCalledTimes(1);
  });
});
