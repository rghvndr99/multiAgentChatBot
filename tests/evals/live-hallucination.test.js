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
  process.env.RUN_LIVE_HALLUCINATION_EVALS === "true"
    ? describe
    : describe.skip;

function parseToolValue(value) {
  const content = value?.content ?? value;

  if (typeof content !== "string") return content;

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

function createToolRecorder() {
  const activeCalls = new Map();
  const calls = [];

  const handler = BaseCallbackHandler.fromMethods({
    handleToolStart(
      tool,
      input,
      runId,
      _parentRunId,
      _tags,
      _metadata,
      runName,
    ) {
      const call = {
        name: runName ?? tool.name ?? tool.id?.at(-1),
        input: parseToolValue(input),
        output: undefined,
      };

      activeCalls.set(runId, call);
      calls.push(call);
    },

    handleToolEnd(output, runId) {
      const call = activeCalls.get(runId);
      if (call) call.output = parseToolValue(output);
      activeCalls.delete(runId);
    },
  });

  return { calls, handler };
}

const groundedCases = [
  {
    name: "product facts stay grounded in the product tool",
    agent: productAgent,
    input: "What is the price and stock status of Pixel 9?",
    expectedTool: "get_product",
    expectedArguments: { name: "Pixel 9" },
    expectedToolResult: {
      name: "Pixel 9",
      price: 49.99,
      currency: "USD",
      inStock: true,
    },
    requiredClaims: [/49\.99/, /USD|dollars?/i, /in stock|available/i],
    contradictoryClaims: [
      /out of stock|unavailable/i,
      /(?:price (?:is|:)|costs?)\s*\$?(?!49\.99)\d+(?:\.\d+)?/i,
    ],
  },
  {
    name: "order status does not accept the user's unsupported assumption",
    agent: orderAgent,
    input:
      "I think order ORD-123 was delivered. Check its actual status for me.",
    expectedTool: "check_order_status",
    expectedArguments: { orderId: "ORD-123" },
    expectedToolResult: { orderId: "ORD-123", status: "processing" },
    requiredClaims: [/ORD-123/i, /processing/i],
    contradictoryClaims: [
      /(?:status (?:is|:)|order (?:is|was|has been))\s*(?:delivered|shipped|cancelled)/i,
    ],
  },
  {
    name: "invoice fields match the invoice tool",
    agent: paymentAgent,
    input: "Retrieve invoice INV-9 and give me its full details.",
    expectedTool: "get_invoice",
    expectedArguments: { invoiceNumber: "INV-9" },
    expectedToolResult: {
      invoiceNumber: "INV-9",
      amount: 125,
      currency: "USD",
      dueDate: "2026-08-31",
      status: "open",
    },
    requiredClaims: [
      /INV-9/i,
      /125/,
      /USD|dollars?/i,
      /2026-08-31|August 31,? 2026/i,
      /open/i,
    ],
    contradictoryClaims: [
      /(?:status (?:is|:)|invoice (?:is|was))\s*(?:paid|closed|overdue)/i,
    ],
  },
  {
    name: "payment success is supported by the payment tool",
    agent: paymentAgent,
    input: "Process a payment of 25 USD.",
    expectedTool: "payment",
    expectedArguments: { amount: 25, currency: "USD" },
    expectedToolResult: { success: true, amount: 25, currency: "USD" },
    requiredClaims: [/25/, /USD|dollars?/i, /success|processed|complete/i],
    contradictoryClaims: [/failed|declined|unsuccessful/i],
  },
  {
    name: "return confirmation matches the submitted return",
    agent: orderAgent,
    input:
      "Return order ORD-456. Use the return reason exactly as DAMAGED-SCREEN.",
    expectedTool: "request_return",
    expectedArguments: { orderId: "ORD-456", reason: "DAMAGED-SCREEN" },
    expectedToolResult: {
      success: true,
      orderId: "ORD-456",
      reason: "DAMAGED-SCREEN",
    },
    requiredClaims: [
      /ORD-456/i,
      /DAMAGED-SCREEN/i,
      /return/i,
      /success|submitted|complete/i,
    ],
    contradictoryClaims: [/failed|denied|rejected|ineligible/i],
  },
];

liveDescribe("live hallucination and groundedness evaluation", () => {
  it.each(groundedCases)(
    "$name",
    async ({
      agent,
      input,
      expectedTool,
      expectedArguments,
      expectedToolResult,
      requiredClaims,
      contradictoryClaims,
    }) => {
      const recorder = createToolRecorder();
      const startedAt = Date.now();
      const result = await agent.getAgent().invoke(
        { messages: [{ role: "user", content: input }] },
        { callbacks: [recorder.handler], recursionLimit: 10 },
      );
      const finalResponse = requireText(
        result.messages.at(-1)?.content,
        `${agent.name} hallucination evaluation`,
      );
      const expectedCalls = recorder.calls.filter(
        (call) => call.name === expectedTool,
      );

      console.info(
        `[live-hallucination] agent=${agent.name} tool=${expectedTool} calls=${recorder.calls.map((call) => call.name).join(",")} latencyMs=${Date.now() - startedAt}`,
      );

      expect(expectedCalls).toHaveLength(1);
      expect(expectedCalls[0].input).toMatchObject(expectedArguments);
      expect(expectedCalls[0].output).toMatchObject(expectedToolResult);

      for (const claim of requiredClaims) {
        expect(finalResponse).toMatch(claim);
      }

      for (const contradiction of contradictoryClaims) {
        expect(finalResponse).not.toMatch(contradiction);
      }
    },
    60_000,
  );
});
