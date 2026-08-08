import { describe, expect, it } from "vitest";

import {
  calculator,
  checkStatus,
  invoice,
  payment,
  product,
  returnReq,
} from "../../backend/tools/index.js";

describe("support tools", () => {
  it("adds finite numbers", async () => {
    await expect(calculator.invoke({ a: 2, b: 3 })).resolves.toBe(5);
  });

  it("returns order status for the requested order", async () => {
    await expect(checkStatus.invoke({ orderId: " ORD-1 " })).resolves.toEqual({
      orderId: "ORD-1",
      status: "processing",
    });
  });

  it("returns invoice information", async () => {
    await expect(invoice.invoke({ invoiceNumber: "INV-1" })).resolves.toMatchObject({
      invoiceNumber: "INV-1",
      currency: "USD",
      status: "open",
    });
  });

  it("normalizes payment currency", async () => {
    await expect(payment.invoke({ amount: 25, currency: "usd" })).resolves.toEqual({
      success: true,
      amount: 25,
      currency: "USD",
    });
  });

  it("returns product information", async () => {
    await expect(product.invoke({ name: " Pixel 9 " })).resolves.toMatchObject({
      name: "Pixel 9",
      inStock: true,
    });
  });

  it("submits a return request", async () => {
    await expect(
      returnReq.invoke({ orderId: "ORD-1", reason: "Damaged" }),
    ).resolves.toEqual({
      success: true,
      orderId: "ORD-1",
      reason: "Damaged",
    });
  });

  it.each([
    ["calculator NaN", calculator, { a: Number.NaN, b: 1 }],
    ["empty order ID", checkStatus, { orderId: " " }],
    ["empty invoice number", invoice, { invoiceNumber: "" }],
    ["negative payment", payment, { amount: -1, currency: "USD" }],
    ["invalid currency", payment, { amount: 1, currency: "US" }],
    ["empty product name", product, { name: "" }],
    ["empty return reason", returnReq, { orderId: "ORD-1", reason: "" }],
  ])("rejects %s", async (_caseName, tool, input) => {
    await expect(tool.invoke(input)).rejects.toThrow();
  });
});
