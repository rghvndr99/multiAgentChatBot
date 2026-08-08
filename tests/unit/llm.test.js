import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ChatOpenAI: vi.fn(),
}));

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: mocks.ChatOpenAI,
}));

describe("getOpenAIModel", () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  beforeEach(() => {
    vi.resetModules();
    mocks.ChatOpenAI.mockImplementation(function FakeChatOpenAI(options) {
      this.options = options;
    });
  });

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;

    if (originalModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = originalModel;
  });

  it("fails before constructing a model when the API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const { getOpenAIModel } = await import("../../backend/llm.js");

    expect(() => getOpenAIModel()).toThrow(
      "OPENAI_API_KEY is missing. Add it to the .env file.",
    );
    expect(mocks.ChatOpenAI).not.toHaveBeenCalled();
  });

  it("constructs one shared deterministic model", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";
    const { getOpenAIModel } = await import("../../backend/llm.js");

    const first = getOpenAIModel();
    const second = getOpenAIModel();

    expect(first).toBe(second);
    expect(mocks.ChatOpenAI).toHaveBeenCalledOnce();
    expect(mocks.ChatOpenAI).toHaveBeenCalledWith({
      maxTokens: 256,
      model: "test-model",
      temperature: 0,
    });
  });
});
