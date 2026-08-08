import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createReactAgent: vi.fn(),
  getOpenAIModel: vi.fn(),
}));

vi.mock("@langchain/langgraph/prebuilt", () => ({
  createReactAgent: mocks.createReactAgent,
}));

vi.mock("../../backend/llm.js", () => ({
  getOpenAIModel: mocks.getOpenAIModel,
}));

import { defineAgent } from "../../backend/agents/agent-factory.js";

describe("defineAgent", () => {
  beforeEach(() => {
    mocks.getOpenAIModel.mockReturnValue({ type: "fake-model" });
    mocks.createReactAgent.mockReturnValue({ type: "compiled-agent" });
  });

  it.each([
    [{ prompt: "prompt", tools: [] }],
    [{ name: "agent", tools: [] }],
    [{ name: "agent", prompt: "prompt", tools: null }],
  ])("rejects an incomplete definition", (definition) => {
    expect(() => defineAgent(definition)).toThrow(
      "An agent requires a name, prompt, and tools array.",
    );
  });

  it("initializes lazily once and exposes immutable permissions", () => {
    const tools = [{ name: "allowed_tool" }];
    const definition = defineAgent({
      name: "test-agent",
      prompt: "Use the allowed tool.",
      tools,
    });

    expect(mocks.createReactAgent).not.toHaveBeenCalled();
    expect(definition.name).toBe("test-agent");
    expect(definition.tools).toEqual(tools);
    expect(Object.isFrozen(definition.tools)).toBe(true);

    const first = definition.getAgent();
    const second = definition.getAgent();

    expect(first).toBe(second);
    expect(mocks.createReactAgent).toHaveBeenCalledOnce();
    expect(mocks.createReactAgent).toHaveBeenCalledWith({
      llm: { type: "fake-model" },
      name: "test-agent",
      prompt: "Use the allowed tool.",
      tools: definition.tools,
    });
  });
});
