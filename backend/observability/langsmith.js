function isLangSmithTracingEnabled() {
  return process.env.LANGSMITH_TRACING?.toLowerCase() === "true";
}

function createLangSmithRunConfig(requestId) {
  const environment = process.env.NODE_ENV ?? "development";

  return {
    runName: "support-chat-request",
    tags: ["support-chatbot", environment],
    metadata: {
      requestId,
      service: "support-chatbot-api",
      environment,
    },
  };
}

export { createLangSmithRunConfig, isLangSmithTracingEnabled };
