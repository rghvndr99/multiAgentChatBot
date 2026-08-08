import { describe, expect, it } from "vitest";

import { combineNode } from "../../backend/graph/combine-node.js";

describe("combineNode", () => {
  it("rejects an empty response collection", async () => {
    await expect(combineNode({ responses: [] }, {})).rejects.toThrow(
      "No specialist agent produced a response.",
    );
  });

  it("returns one response", async () => {
    await expect(
      combineNode({ responses: [" answer "] }, {}),
    ).resolves.toEqual({ finalResponse: "answer" });
  });

  it("combines multiple responses deterministically", async () => {
    await expect(
      combineNode({ responses: ["order answer", "payment answer"] }),
    ).resolves.toEqual({
      finalResponse: "- order answer\n- payment answer",
    });
  });
});
