import { afterEach, describe, expect, it } from "vitest";

import {
  createLangSmithRunConfig,
  isLangSmithTracingEnabled,
} from "../../backend/observability/langsmith.js";

const originalEnvironment = process.env.NODE_ENV;
const originalTracing = process.env.LANGSMITH_TRACING;

afterEach(() => {
  if (originalEnvironment === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnvironment;

  if (originalTracing === undefined) delete process.env.LANGSMITH_TRACING;
  else process.env.LANGSMITH_TRACING = originalTracing;
});

describe("LangSmith observability configuration", () => {
  it("is opt-in", () => {
    delete process.env.LANGSMITH_TRACING;
    expect(isLangSmithTracingEnabled()).toBe(false);

    process.env.LANGSMITH_TRACING = "true";
    expect(isLangSmithTracingEnabled()).toBe(true);
  });

  it("adds searchable non-secret metadata to a graph run", () => {
    process.env.NODE_ENV = "test";

    expect(createLangSmithRunConfig("request-123")).toEqual({
      runName: "support-chat-request",
      tags: ["support-chatbot", "test"],
      metadata: {
        requestId: "request-123",
        service: "support-chatbot-api",
        environment: "test",
      },
    });
  });
});
