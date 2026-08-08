import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOpenAIModel: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("../../backend/llm.js", () => ({
  getOpenAIModel: mocks.getOpenAIModel,
}));

import { combineNode } from "../../backend/graph/combine-node.js";

describe("combineNode", () => {
  beforeEach(() => {
    mocks.getOpenAIModel.mockReturnValue({ invoke: mocks.invoke });
  });

  it("rejects an empty response collection", async () => {
    await expect(combineNode({ responses: [] }, {})).rejects.toThrow(
      "No specialist agent produced a response.",
    );
  });

  it("returns one response without calling the LLM", async () => {
    await expect(
      combineNode({ responses: [" answer "] }, {}),
    ).resolves.toEqual({ finalResponse: "answer" });
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("combines multiple responses and forwards runtime config", async () => {
    const config = { metadata: { requestId: "request-1" } };
    mocks.invoke.mockResolvedValue({ content: " combined answer " });

    await expect(
      combineNode({ responses: ["order answer", "payment answer"] }, config),
    ).resolves.toEqual({ finalResponse: "combined answer" });
    expect(mocks.invoke).toHaveBeenCalledWith(
      expect.stringMatching(/order answer[\s\S]*payment answer/),
      config,
    );
  });

  it("rejects an empty combiner response", async () => {
    mocks.invoke.mockResolvedValue({ content: "   " });

    await expect(
      combineNode({ responses: ["one", "two"] }, {}),
    ).rejects.toThrow("Response combiner produced an empty response.");
  });
});
