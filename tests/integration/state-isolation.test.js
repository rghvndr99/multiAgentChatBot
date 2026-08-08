import { describe, expect, it, vi } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";
import { createFakeGraphDependencies } from "../fixtures/fake-graph-dependencies.js";

describe("graph state isolation", () => {
  it("does not leak state across sequential invocations", async () => {
    const { dependencies } = createFakeGraphDependencies(["product"]);
    dependencies.productNode = vi.fn(async (state) => ({
      responses: [`response for ${state.userMessage}`],
    }));
    const graph = createSupportGraph(dependencies);

    const first = await graph.invoke({
      messages: [{ role: "user", content: "first" }],
      userMessage: "first",
    });
    const second = await graph.invoke({
      messages: [{ role: "user", content: "second" }],
      userMessage: "second",
    });

    expect(first.responses).toEqual(["response for first"]);
    expect(second.responses).toEqual(["response for second"]);
  });

  it("isolates concurrently executing invocations", async () => {
    const { dependencies } = createFakeGraphDependencies(["product"]);
    dependencies.productNode = vi.fn(async (state) => {
      await Promise.resolve();
      return { responses: [`response for ${state.userMessage}`] };
    });
    const graph = createSupportGraph(dependencies);
    const requestIds = Array.from({ length: 10 }, (_, index) => `request-${index}`);

    const results = await Promise.all(
      requestIds.map((requestId) =>
        graph.invoke({
          messages: [{ role: "user", content: requestId }],
          userMessage: requestId,
        }),
      ),
    );

    results.forEach((result, index) => {
      expect(result.routes).toEqual(["product"]);
      expect(result.responses).toEqual([`response for ${requestIds[index]}`]);
      expect(result.finalResponse).toBe(`response for ${requestIds[index]}`);
    });
  });
});
