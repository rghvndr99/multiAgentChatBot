import { describe, expect, it } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";
import { createFakeGraphDependencies } from "../fixtures/fake-graph-dependencies.js";

describe("createSupportGraph", () => {
  it("executes injected dependencies without using production agents", async () => {
    const { dependencies } = createFakeGraphDependencies();
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
    const { dependencies } = createFakeGraphDependencies();
    delete dependencies.combineNode;

    expect(() => createSupportGraph(dependencies)).toThrow(
      "createSupportGraph requires a combineNode function.",
    );
  });
});
