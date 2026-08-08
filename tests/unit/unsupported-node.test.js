import { describe, expect, it } from "vitest";

import {
  unsupportedNode,
  unsupportedResponse,
} from "../../backend/graph/unsupported-node.js";

describe("unsupportedNode", () => {
  it("returns the configured non-empty fallback response", () => {
    expect(unsupportedNode()).toEqual({ responses: [unsupportedResponse] });
    expect(unsupportedResponse.trim()).not.toBe("");
  });
});
