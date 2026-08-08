import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getOpenAIModel: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("../../backend/llm.js", () => ({
  getOpenAIModel: mocks.getOpenAIModel,
}));

import { routeRequest } from "../../backend/graph/master-route.js";

describe("routeRequest", () => {
  beforeEach(() => {
    mocks.getOpenAIModel.mockReturnValue({ invoke: mocks.invoke });
  });

  it("passes runtime config to the LLM and parses its response", async () => {
    const config = {
      metadata: { requestId: "request-1" },
      recursionLimit: 10,
    };
    mocks.invoke.mockResolvedValue({
      content: '{"agents":["order"]}',
    });

    await expect(routeRequest("Where is order 123?", config)).resolves.toEqual({
      routes: ["order"],
    });
    expect(mocks.invoke).toHaveBeenCalledWith(
      expect.stringContaining("Where is order 123?"),
      config,
    );
  });
});
