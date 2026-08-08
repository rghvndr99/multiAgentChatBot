import "dotenv/config";

import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { describe, expect, it } from "vitest";

import { graph } from "../../backend/graph/index.js";
import { requireText } from "../../backend/utils/content-to-text.js";

const liveDescribe =
  process.env.RUN_LIVE_GRAPH_EVALS === "true" ? describe : describe.skip;

const graphCases = [
  {
    name: "single specialist with a tool",
    input: "What is the price and stock status of Pixel 9?",
    expectedRoutes: ["product"],
    requiredTools: ["get_product"],
    allowedTools: ["get_product"],
    minimumToolPrecision: 1,
    expectedModelCalls: 0,
  },
  {
    name: "parallel specialists, tools, and LLM combination",
    input:
      "Return order ORD-123 because it is damaged and retrieve invoice INV-9.",
    expectedRoutes: ["order", "payment"],
    requiredTools: ["request_return", "get_invoice"],
    allowedTools: ["request_return", "check_order_status", "get_invoice"],
    minimumToolPrecision: 0.66,
    expectedModelCalls: 0,
  },
  {
    name: "unsupported fallback without specialist tools",
    input: "What will the weather be tomorrow?",
    expectedRoutes: ["none"],
    requiredTools: [],
    allowedTools: [],
    minimumToolPrecision: 1,
    expectedModelCalls: 0,
  },
];

liveDescribe("live complete support graph evaluation", () => {
  it.each(graphCases)(
    "$name",
    async ({
      input,
      expectedRoutes,
      requiredTools,
      allowedTools,
      minimumToolPrecision,
      expectedModelCalls,
    }) => {
      const toolSequence = [];
      let modelCallCount = 0;
      const handler = BaseCallbackHandler.fromMethods({
        handleLLMStart() {
          modelCallCount += 1;
        },
        handleToolStart(tool, _input, _runId, _parentRunId, _tags, _metadata, runName) {
          toolSequence.push(runName ?? tool.name ?? tool.id?.at(-1));
        },
      });
      const startedAt = Date.now();
      const result = await graph.invoke(
        {
          messages: [{ role: "user", content: input }],
          userMessage: input,
        },
        { callbacks: [handler], recursionLimit: 15 },
      );

      console.info(
        `[live-graph] routes=${result.routes.join(",")} modelCalls=${modelCallCount} tools=${toolSequence.join(",")} latencyMs=${Date.now() - startedAt}`,
      );
      expect([...result.routes].sort()).toEqual([...expectedRoutes].sort());
      expect(new Set(toolSequence).size).toBe(toolSequence.length);
      expect(toolSequence).toEqual(expect.arrayContaining(requiredTools));
      expect(toolSequence.every((tool) => allowedTools.includes(tool))).toBe(true);
      const toolPrecision =
        toolSequence.length === 0 ? 1 : requiredTools.length / toolSequence.length;
      expect(toolPrecision).toBeGreaterThanOrEqual(minimumToolPrecision);
      expect(modelCallCount).toBe(expectedModelCalls);
      expect(requireText(result.finalResponse, "Live graph")).not.toBe("");
    },
    90_000,
  );
});
