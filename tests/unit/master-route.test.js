import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOpenAIModel: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("../../backend/llm.js", () => ({
  getOpenAIModel: mocks.getOpenAIModel,
}));

import { routeRequest } from "../../backend/graph/master-route.js";
import { clearRouteCache } from "../../backend/graph/route-cache.js";

describe("routeRequest", () => {
  beforeEach(() => {
    clearRouteCache();
    mocks.getOpenAIModel.mockReturnValue({ invoke: mocks.invoke });
  });

  it("routes a confident request without calling the LLM", async () => {
    await expect(routeRequest("Where is order ORD-123?", {})).resolves.toEqual({
      routes: ["order"],
      routingSource: "deterministic",
    });
    expect(mocks.getOpenAIModel).not.toHaveBeenCalled();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("passes runtime config and recent history to the LLM fallback", async () => {
    const config = {
      metadata: { requestId: "request-1" },
      recursionLimit: 10,
    };
    const messages = [
      { role: "user", content: "I bought something last week." },
      { role: "assistant", content: "How can I help?" },
      { role: "user", content: "Has my purchase been sent out yet?" },
    ];
    mocks.invoke.mockResolvedValue({
      content: '{"agents":["order"]}',
    });

    await expect(
      routeRequest("Has my purchase been sent out yet?", config, messages),
    ).resolves.toEqual({ routes: ["order"], routingSource: "llm" });
    expect(mocks.invoke).toHaveBeenCalledWith(
      expect.stringMatching(/bought something[\s\S]*sent out yet/),
      config,
    );
  });

  it("uses conversation history for a deterministic contextual follow-up", async () => {
    const messages = [
      { role: "user", content: "I need help with an order." },
      { role: "assistant", content: "What is the order ID?" },
      { role: "user", content: "It is ORD-123." },
    ];
    await expect(routeRequest("It is ORD-123.", {}, messages)).resolves.toEqual({
      routes: ["order"],
      routingSource: "deterministic",
    });
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("caches a successful LLM fallback route", async () => {
    mocks.invoke.mockResolvedValue({ content: '{"agents":["order"]}' });

    const first = await routeRequest("Has my purchase been sent out yet?", {});
    const second = await routeRequest("Has my purchase been sent out yet?", {});

    expect(first.routingSource).toBe("llm");
    expect(second).toEqual({ routes: ["order"], routingSource: "cache" });
    expect(mocks.invoke).toHaveBeenCalledOnce();
  });
});
