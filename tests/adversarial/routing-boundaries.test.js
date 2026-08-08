import { describe, expect, it } from "vitest";

import { RoutingResponseError, parseRoutes } from "../../backend/graph/route-parser.js";

describe("adversarial routing output boundaries", () => {
  it.each([
    ["markdown-wrapped JSON", '```json\n{"agents":["payment"]}\n```'],
    ["prose before JSON", 'Certainly! {"agents":["payment"]}'],
    ["an injected route", '{"agents":["admin"]}'],
    ["a fallback mixed with a specialist", '{"agents":["none","payment"]}'],
    ["a prototype-shaped object", '{"agents":["__proto__"]}'],
  ])("rejects %s", (_caseName, content) => {
    expect(() => parseRoutes(content)).toThrow(RoutingResponseError);
  });
});
