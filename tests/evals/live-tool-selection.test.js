import "dotenv/config";

import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { describe, expect, it } from "vitest";

import {
  orderAgent,
  paymentAgent,
  productAgent,
} from "../../backend/agents/index.js";
import { requireText } from "../../backend/utils/content-to-text.js";

const liveDescribe =
  process.env.RUN_LIVE_TOOL_EVALS === "true" ? describe : describe.skip;

const toolCases = [
  {
    name: "product lookup uses get_product",
    agent: productAgent,
    input: "What is the price and stock status of Pixel 9?",
    expectedTool: "get_product",
    expectedArguments: { name: "Pixel 9" },
    expectedResponse: /49\.99|in stock/i,
  },
  {
    name: "order tracking uses check_order_status",
    agent: orderAgent,
    input: "Where is order ORD-123?",
    expectedTool: "check_order_status",
    expectedArguments: { orderId: "ORD-123" },
    expectedResponse: /processing/i,
  },
  {
    name: "return request uses request_return",
    agent: orderAgent,
    input: "Return order ORD-123 because it arrived damaged.",
    expectedTool: "request_return",
    expectedArguments: { orderId: "ORD-123" },
    expectedResponse: /return|submitted|success/i,
  },
  {
    name: "invoice request uses get_invoice",
    agent: paymentAgent,
    input: "Retrieve invoice INV-9.",
    expectedTool: "get_invoice",
    expectedArguments: { invoiceNumber: "INV-9" },
    expectedResponse: /INV-9|125|open/i,
  },
  {
    name: "payment request uses payment",
    agent: paymentAgent,
    input: "Process a payment of 25 USD.",
    expectedTool: "payment",
    expectedArguments: { amount: 25, currency: "USD" },
    expectedResponse: /25|success|processed/i,
  },
];

liveDescribe("live OpenAI specialist tool-selection evaluation", () => {
  it.each(toolCases)(
    "$name",
    async ({
      agent,
      input,
      expectedTool,
      expectedArguments,
      expectedResponse,
    }) => {
      const toolCalls = [];
      const handler = BaseCallbackHandler.fromMethods({
        handleToolStart(tool, toolInput, _runId, _parentRunId, _tags, _metadata, runName) {
          let normalizedInput = toolInput;

          if (typeof toolInput === "string") {
            try {
              normalizedInput = JSON.parse(toolInput);
            } catch {
              // The assertion below will report an unexpected non-JSON input.
            }
          }

          toolCalls.push({
            name: runName ?? tool.name ?? tool.id?.at(-1),
            input: normalizedInput,
          });
        },
      });
      const startedAt = Date.now();
      const result = await agent.getAgent().invoke(
        { messages: [{ role: "user", content: input }] },
        { callbacks: [handler], recursionLimit: 10 },
      );
      const finalResponse = requireText(
        result.messages.at(-1)?.content,
        `${agent.name} live evaluation`,
      );

      console.info(
        `[live-tool] agent=${agent.name} expected=${expectedTool} actual=${toolCalls.map((call) => call.name).join(",")} latencyMs=${Date.now() - startedAt}`,
      );
      const expectedCall = toolCalls.find((call) => call.name === expectedTool);
      expect(expectedCall).toBeDefined();
      expect(expectedCall.input).toMatchObject(expectedArguments);
      expect(finalResponse).toMatch(expectedResponse);
    },
    60_000,
  );
});
