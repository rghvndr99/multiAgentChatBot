import { describe, expect, it } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";
import {
  createFakeGraphDependencies,
  specialistRoutes,
} from "../fixtures/fake-graph-dependencies.js";

const routeCases = [
  ["product", ["product"]],
  ["order", ["order"]],
  ["payment", ["payment"]],
  ["unsupported fallback", ["none"]],
  ["product and order", ["product", "order"]],
  ["product and payment", ["product", "payment"]],
  ["order and payment", ["order", "payment"]],
  ["all specialists", ["product", "order", "payment"]],
];

function dependencyNameForRoute(route) {
  return route === "none" ? "unsupportedNode" : `${route}Node`;
}

describe("support graph routing", () => {
  it.each(routeCases)(
    "executes the %s path and combines only its selected responses",
    async (_caseName, routes) => {
      const { dependencies, events } = createFakeGraphDependencies(routes);
      const graph = createSupportGraph(dependencies);

      const result = await graph.invoke({
        messages: [{ role: "user", content: "test request" }],
        userMessage: "test request",
      });

      expect(events[0]).toBe("supervisor");
      expect(events.at(-1)).toBe("combine");
      expect(dependencies.routeRequest).toHaveBeenCalledOnce();
      expect(dependencies.combineNode).toHaveBeenCalledOnce();

      for (const route of specialistRoutes) {
        const node = dependencies[dependencyNameForRoute(route)];

        if (routes.includes(route)) {
          expect(node).toHaveBeenCalledOnce();
        } else {
          expect(node).not.toHaveBeenCalled();
        }
      }

      const expectedResponses = routes.map((route) => `${route} response`);
      expect(result.routes).toEqual(routes);
      expect(result.responses).toHaveLength(expectedResponses.length);
      expect(result.responses).toEqual(expect.arrayContaining(expectedResponses));
      expect(result.finalResponse).toBe([...expectedResponses].sort().join(" | "));
    },
  );
});
