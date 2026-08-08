import { describe, expect, it, vi } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";
import { createFakeGraphDependencies } from "../fixtures/fake-graph-dependencies.js";

describe("multi-turn conversation state", () => {
  it("provides full history to both the supervisor and selected specialist", async () => {
    const messages = [
      { role: "user", content: "I need help with an order." },
      { role: "assistant", content: "What is the order ID?" },
      { role: "user", content: "It is ORD-123." },
    ];
    const { dependencies } = createFakeGraphDependencies(["order"]);
    dependencies.orderNode = vi.fn(async (state) => ({
      responses: [`received ${state.messages.length} messages`],
    }));
    const graph = createSupportGraph(dependencies);

    const result = await graph.invoke({
      messages,
      userMessage: messages.at(-1).content,
    });

    expect(dependencies.routeRequest).toHaveBeenCalledWith(
      "It is ORD-123.",
      expect.any(Object),
      messages,
    );
    expect(dependencies.orderNode.mock.calls[0][0].messages).toEqual(messages);
    expect(result.finalResponse).toBe("received 3 messages");
  });
});
