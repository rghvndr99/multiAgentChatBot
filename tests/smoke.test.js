import { describe, expect, it } from "vitest";

import { graph } from "../backend/graph/index.js";

describe("test infrastructure", () => {
  it("imports the compiled support graph", () => {
    expect(graph).toBeDefined();
    expect(typeof graph.invoke).toBe("function");
  });
});
