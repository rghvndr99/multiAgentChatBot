import { describe, expect, it, vi } from "vitest";

import { createSpecialistNode } from "../../backend/graph/specialist-node.js";

function createAgentResult(content) {
  const invoke = vi.fn(async () => ({ messages: [{ content }] }));
  return {
    agent: { getAgent: () => ({ invoke }) },
    invoke,
  };
}

describe("createSpecialistNode", () => {
  it("forwards conversation and runtime config", async () => {
    const { agent, invoke } = createAgentResult("  order response  ");
    const node = createSpecialistNode(agent, "order");
    const messages = [{ role: "user", content: "Where is ORD-1?" }];
    const config = { metadata: { requestId: "request-1" }, recursionLimit: 8 };

    await expect(node({ messages }, config)).resolves.toEqual({
      responses: ["order response"],
    });
    expect(invoke).toHaveBeenCalledWith({ messages }, config);
  });

  it("normalizes structured text content", async () => {
    const { agent } = createAgentResult([
      { type: "text", text: "line one" },
      { type: "text", text: "line two" },
    ]);
    const node = createSpecialistNode(agent, "product");

    await expect(node({ messages: [] }, {})).resolves.toEqual({
      responses: ["line one\nline two"],
    });
  });

  it("uses a direct handler without initializing the agent", async () => {
    const getAgent = vi.fn();
    const directHandler = vi.fn(async () => "direct response");
    const node = createSpecialistNode(
      { getAgent },
      "order",
      { directHandler },
    );

    await expect(
      node(
        {
          messages: [{ role: "user", content: "Where is ORD-1?" }],
          userMessage: "Where is ORD-1?",
        },
        {},
      ),
    ).resolves.toEqual({ responses: ["direct response"] });
    expect(directHandler).toHaveBeenCalledOnce();
    expect(getAgent).not.toHaveBeenCalled();
  });

  it("limits fallback-agent history to the six most recent messages", async () => {
    const { agent, invoke } = createAgentResult("response");
    const node = createSpecialistNode(agent, "order");
    const messages = Array.from({ length: 10 }, (_, index) => ({
      role: "user",
      content: `message-${index}`,
    }));

    await node({ messages }, {});

    expect(invoke.mock.calls[0][0].messages).toEqual(messages.slice(-6));
  });

  it.each([
    ["missing messages", {}, "order requires messages in graph state."],
    [
      "missing final message",
      { messages: [] },
      "order agent produced an empty response.",
    ],
  ])("rejects %s", async (_caseName, state, errorMessage) => {
    const invoke = vi.fn(async () => ({ messages: [] }));
    const node = createSpecialistNode(
      { getAgent: () => ({ invoke }) },
      "order",
    );

    await expect(node(state, {})).rejects.toThrow(errorMessage);
  });

  it("propagates an agent failure", async () => {
    const failure = new Error("agent unavailable");
    const invoke = vi.fn(async () => {
      throw failure;
    });
    const node = createSpecialistNode(
      { getAgent: () => ({ invoke }) },
      "payment",
    );

    await expect(node({ messages: [] }, {})).rejects.toBe(failure);
  });

  it("validates the injected agent", () => {
    expect(() => createSpecialistNode({}, "order")).toThrow(
      "order requires an agent with a getAgent function.",
    );
  });
});
