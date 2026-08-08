import { describe, expect, it } from "vitest";

import {
  orderAgent,
  paymentAgent,
  productAgent,
} from "../../backend/agents/index.js";

describe("agent tool permissions", () => {
  it.each([
    [productAgent, ["get_product"]],
    [orderAgent, ["check_order_status", "request_return"]],
    [paymentAgent, ["calculator", "payment", "get_invoice"]],
  ])("restricts $name to its explicit allowlist", (agent, expectedTools) => {
    expect(agent.tools.map((tool) => tool.name)).toEqual(expectedTools);
    expect(Object.isFrozen(agent.tools)).toBe(true);
  });
});
