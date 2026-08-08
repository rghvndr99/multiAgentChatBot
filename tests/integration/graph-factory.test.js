import { describe, expect, it, vi } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";

function createFakeDependencies(route = "product") {
  return {
    routeRequest: vi.fn(async () => ({ routes: [route] })),
    productNode: vi.fn(async () => ({ responses: ["product response"] })),
    orderNode: vi.fn(async () => ({ responses: ["order response"] })),
    paymentNode: vi.fn(async () => ({ responses: ["payment response"] })),
    unsupportedNode: vi.fn(async () => ({ responses: ["unsupported response"] })),
    combineNode: vi.fn(async (state) => ({
      finalResponse: state.responses.join(" | "),
    })),
  };
}

describe("createSupportGraph", () => {
  it("executes injected dependencies without using production agents", async () => {
    const dependencies = createFakeDependencies();
    const graph = createSupportGraph(dependencies);

    const result = await graph.invoke({
      messages: [{ role: "user", content: "Show me a phone" }],
      userMessage: "Show me a phone",
    });

    expect(dependencies.routeRequest).toHaveBeenCalledOnce();
    expect(dependencies.routeRequest).toHaveBeenCalledWith(
      "Show me a phone",
      expect.any(Object),
    );
    expect(dependencies.productNode).toHaveBeenCalledOnce();
    expect(dependencies.orderNode).not.toHaveBeenCalled();
    expect(dependencies.paymentNode).not.toHaveBeenCalled();
    expect(dependencies.unsupportedNode).not.toHaveBeenCalled();
    expect(dependencies.combineNode).toHaveBeenCalledOnce();
    expect(result.finalResponse).toBe("product response");
  });

  it("reports a missing dependency before graph compilation", () => {
    const dependencies = createFakeDependencies();
    delete dependencies.combineNode;

    expect(() => createSupportGraph(dependencies)).toThrow(
      "createSupportGraph requires a combineNode function.",
    );
  });
});
