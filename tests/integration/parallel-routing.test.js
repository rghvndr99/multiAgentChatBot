import { describe, expect, it, vi } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";
import { createFakeGraphDependencies } from "../fixtures/fake-graph-dependencies.js";

function createDeferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe("parallel specialist routing", () => {
  it.each([
    ["order finishes first", "order", "payment"],
    ["payment finishes first", "payment", "order"],
  ])(
    "%s without combining before the other branch finishes",
    async (_caseName, firstRoute, secondRoute) => {
      const { dependencies, events } = createFakeGraphDependencies([
        "order",
        "payment",
      ]);
      const gates = {
        order: createDeferred(),
        payment: createDeferred(),
      };

      for (const route of ["order", "payment"]) {
        dependencies[`${route}Node`] = vi.fn(async () => {
          events.push(`${route}:start`);
          await gates[route].promise;
          events.push(`${route}:finish`);
          return { responses: [`${route} response`] };
        });
      }

      const graph = createSupportGraph(dependencies);
      const invocation = graph.invoke({
        messages: [{ role: "user", content: "Return and refund order 123" }],
        userMessage: "Return and refund order 123",
      });

      await vi.waitFor(() => {
        expect(dependencies.orderNode).toHaveBeenCalledOnce();
        expect(dependencies.paymentNode).toHaveBeenCalledOnce();
      });

      expect(events).toContain("order:start");
      expect(events).toContain("payment:start");
      expect(dependencies.combineNode).not.toHaveBeenCalled();

      gates[firstRoute].resolve();

      await vi.waitFor(() => {
        expect(events).toContain(`${firstRoute}:finish`);
      });

      expect(events).not.toContain(`${secondRoute}:finish`);
      expect(dependencies.combineNode).not.toHaveBeenCalled();

      gates[secondRoute].resolve();
      const result = await invocation;

      expect(dependencies.combineNode).toHaveBeenCalledOnce();
      expect(result.responses).toHaveLength(2);
      expect(result.responses).toEqual(
        expect.arrayContaining(["order response", "payment response"]),
      );
      expect(result.finalResponse).toBe("order response | payment response");
      expect(events.at(-1)).toBe("combine");
    },
  );
});
