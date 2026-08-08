import { describe, expect, it } from "vitest";

import {
  parseRoutes,
  RoutingResponseError,
} from "../../backend/graph/route-parser.js";

describe("parseRoutes", () => {
  it.each(["product", "order", "payment", "none"])(
    "accepts the %s route",
    (route) => {
      expect(parseRoutes(JSON.stringify({ agents: [route] }))).toEqual({
        routes: [route],
      });
    },
  );

  it("accepts multiple specialist routes", () => {
    expect(
      parseRoutes('{"agents":["order","payment"]}'),
    ).toEqual({ routes: ["order", "payment"] });
  });

  it("removes duplicate routes while preserving selection order", () => {
    expect(
      parseRoutes('{"agents":["payment","order","payment"]}'),
    ).toEqual({ routes: ["payment", "order"] });
  });

  it.each([
    ["non-string content", { agents: ["product"] }],
    ["malformed JSON", '{"agents":["product"]'],
    ["a non-object root", "null"],
    ["an array root", '["product"]'],
    ["a missing agents property", "{}"],
    ["an empty agents array", '{"agents":[]}'],
    ["a non-array agents property", '{"agents":"product"}'],
    ["an unknown route", '{"agents":["admin"]}'],
    ["a non-string route", '{"agents":[42]}'],
  ])("rejects %s", (_caseName, content) => {
    expect(() => parseRoutes(content)).toThrow(RoutingResponseError);
  });

  it("rejects none combined with a specialist route", () => {
    expect(() =>
      parseRoutes('{"agents":["none","product"]}'),
    ).toThrow(
      "Invalid routing response: none cannot be combined with another route.",
    );
  });
});
