import { describe, expect, it, vi } from "vitest";

import { createSupportGraph } from "../../backend/graph/create-support-graph.js";
import { createFakeGraphDependencies } from "../fixtures/fake-graph-dependencies.js";

describe("support graph failures", () => {
  it("propagates a supervisor failure without running specialists", async () => {
    const { dependencies } = createFakeGraphDependencies();
    const failure = new Error("routing failed");
    dependencies.routeRequest = vi.fn(async () => {
      throw failure;
    });
    const graph = createSupportGraph(dependencies);

    await expect(
      graph.invoke({ messages: [], userMessage: "request" }),
    ).rejects.toBe(failure);
    expect(dependencies.productNode).not.toHaveBeenCalled();
    expect(dependencies.combineNode).not.toHaveBeenCalled();
  });

  it("fails the complete invocation when one selected specialist fails", async () => {
    const { dependencies } = createFakeGraphDependencies(["order", "payment"]);
    const failure = new Error("payment agent failed");
    dependencies.paymentNode = vi.fn(async () => {
      throw failure;
    });
    const graph = createSupportGraph(dependencies);

    await expect(
      graph.invoke({ messages: [], userMessage: "return and refund" }),
    ).rejects.toBe(failure);
    expect(dependencies.orderNode).toHaveBeenCalledOnce();
    expect(dependencies.combineNode).not.toHaveBeenCalled();
  });

  it("propagates a combiner failure", async () => {
    const { dependencies } = createFakeGraphDependencies();
    const failure = new Error("combiner failed");
    dependencies.combineNode = vi.fn(async () => {
      throw failure;
    });
    const graph = createSupportGraph(dependencies);

    await expect(
      graph.invoke({ messages: [], userMessage: "product" }),
    ).rejects.toBe(failure);
  });

  it("forwards cancellation signals and runtime limits to selected nodes", async () => {
    const { dependencies } = createFakeGraphDependencies(["order"]);
    let specialistConfig;
    dependencies.orderNode = vi.fn(
      async (_state, config) =>
        new Promise((_resolve, reject) => {
          specialistConfig = config;
          config.signal.addEventListener(
            "abort",
            () => reject(config.signal.reason),
            { once: true },
          );
        }),
    );
    const graph = createSupportGraph(dependencies);
    const controller = new AbortController();

    const invocation = graph.invoke(
      { messages: [], userMessage: "order" },
      {
        signal: controller.signal,
        recursionLimit: 7,
        metadata: { requestId: "request-1" },
      },
    );

    await vi.waitFor(() => {
      expect(dependencies.orderNode).toHaveBeenCalledOnce();
    });
    controller.abort(new Error("request cancelled"));

    await expect(invocation).rejects.toThrow("request cancelled");
    expect(specialistConfig.signal).toBeInstanceOf(AbortSignal);
    expect(specialistConfig.signal.aborted).toBe(true);
    expect(specialistConfig.recursionLimit).toBe(7);
    expect(specialistConfig.metadata).toMatchObject({ requestId: "request-1" });
  });

  it("stops execution when the configured recursion limit is exhausted", async () => {
    const { dependencies } = createFakeGraphDependencies(["order"]);
    const graph = createSupportGraph(dependencies);

    await expect(
      graph.invoke(
        { messages: [], userMessage: "order" },
        { recursionLimit: 1 },
      ),
    ).rejects.toThrow(/recursion limit/i);
    expect(dependencies.orderNode).not.toHaveBeenCalled();
  });
});
