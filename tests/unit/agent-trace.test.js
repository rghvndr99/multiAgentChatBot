import { afterEach, describe, expect, it, vi } from "vitest";

import { createAgentTrace } from "../../backend/agents/agent-trace.js";

describe("createAgentTrace", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records tool order and correlated start/end logs", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const trace = createAgentTrace("request-1");

    await trace.handler.handleToolStart(
      { name: "get_product" },
      { name: "Pixel 9" },
      "run-1",
    );
    await trace.handler.handleToolEnd(
      { content: { name: "Pixel 9", inStock: true } },
      "run-1",
    );

    expect(trace.getToolSequence()).toEqual(["get_product"]);
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("[trace:request-1] tool:1:start name=get_product"),
    );
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("[trace:request-1] tool:1:end name=get_product"),
    );
  });

  it("logs tool failures without losing the recorded sequence", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const trace = createAgentTrace("request-2");

    await trace.handler.handleToolStart(
      { name: "payment" },
      { amount: 25, currency: "USD" },
      "run-2",
    );
    await trace.handler.handleToolError(new Error("declined"), "run-2");

    expect(trace.getToolSequence()).toEqual(["payment"]);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("tool:1:error name=payment error=declined"),
    );
  });
});
