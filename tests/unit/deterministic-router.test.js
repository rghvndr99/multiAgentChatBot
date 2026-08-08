import { describe, expect, it } from "vitest";

import { routeDeterministically } from "../../backend/graph/deterministic-router.js";

describe("routeDeterministically", () => {
  it.each([
    ["Show me Pixel 9", ["product"]],
    ["What is the price and stock status of Pixel 9?", ["product"]],
    ["Where is order ORD-123?", ["order"]],
    ["Retrieve invoice INV-9", ["payment"]],
    [
      "Return order ORD-123 and retrieve invoice INV-9",
      ["order", "payment"],
    ],
    ["What will the weather be tomorrow?", ["none"]],
  ])("routes %s without a model", (input, routes) => {
    expect(routeDeterministically(input)).toEqual({
      routes,
      routingSource: "deterministic",
    });
  });

  it("uses prior context only for a short follow-up", () => {
    const messages = [
      { role: "user", content: "I need to track an order." },
      { role: "assistant", content: "What is the ID?" },
    ];

    expect(routeDeterministically("It is 123.", messages)).toEqual({
      routes: ["order"],
      routingSource: "deterministic",
    });
  });

  it("does not leak an old route into a new unsupported topic", () => {
    const messages = [{ role: "user", content: "Track order ORD-1" }];

    expect(routeDeterministically("What is the weather?", messages)).toEqual({
      routes: ["none"],
      routingSource: "deterministic",
    });
  });

  it("returns null when model judgment is needed", () => {
    expect(routeDeterministically("Has my purchase been sent out yet?")).toBeNull();
  });
});
