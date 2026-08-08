import { describe, expect, it } from "vitest";

import {
  tryDirectOrder,
  tryDirectPayment,
  tryDirectProduct,
} from "../../backend/graph/direct-dispatch.js";

function request(userMessage, messages = []) {
  return { userMessage, messages };
}

describe("direct tool dispatch", () => {
  it("handles a product lookup", async () => {
    await expect(
      tryDirectProduct(
        request("What is the price and stock status of Pixel 9?"),
        {},
      ),
    ).resolves.toMatch(/Pixel 9 costs 49\.99 USD and is in stock/);
  });

  it("handles order tracking", async () => {
    await expect(
      tryDirectOrder(request("Where is order ORD-123?"), {}),
    ).resolves.toBe("Order ORD-123 is currently processing.");
  });

  it("handles a return request", async () => {
    await expect(
      tryDirectOrder(
        request("Return order ORD-123 because it arrived damaged."),
        {},
      ),
    ).resolves.toMatch(/Return request submitted for order ORD-123/);
  });

  it("handles invoice lookup", async () => {
    await expect(
      tryDirectPayment(request("Retrieve invoice INV-9."), {}),
    ).resolves.toMatch(/Invoice INV-9 is open for 125 USD/);
  });

  it("handles an explicit payment", async () => {
    await expect(
      tryDirectPayment(request("Process a payment of 25 USD."), {}),
    ).resolves.toBe("Payment of 25 USD was processed successfully.");
  });

  it.each([
    ["product without a name", tryDirectProduct, "Show me a product"],
    ["order without an ID", tryDirectOrder, "Where is my order?"],
    ["refund without a supported tool", tryDirectPayment, "Where is my refund?"],
  ])("falls back for %s", async (_caseName, handler, input) => {
    await expect(handler(request(input), {})).resolves.toBeNull();
  });
});
