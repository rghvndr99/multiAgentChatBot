import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

function formatTraceValue(value, maxLength = 500) {
  const traceValue = value?.content ?? value;
  let formatted;

  if (typeof traceValue === "string") {
    formatted = traceValue;
  } else {
    try {
      formatted = JSON.stringify(traceValue);
    } catch {
      formatted = String(traceValue);
    }
  }

  return formatted.length > maxLength
    ? `${formatted.slice(0, maxLength)}...`
    : formatted;
}

function createAgentTrace(requestId) {
  const toolRuns = new Map();
  const toolSequence = [];

  const handler = BaseCallbackHandler.fromMethods({
    handleToolStart(tool, input, runId, _parentRunId, _tags, _metadata, runName) {
      const toolName = runName ?? tool.name ?? tool.id?.at(-1) ?? "unknown_tool";
      const sequenceNumber = toolSequence.length + 1;

      toolRuns.set(runId, { name: toolName, sequenceNumber });
      toolSequence.push(toolName);
      console.log(
        `[trace:${requestId}] tool:${sequenceNumber}:start name=${toolName} input=${formatTraceValue(input)}`,
      );
    },

    handleToolEnd(output, runId) {
      const toolRun = toolRuns.get(runId);
      const sequenceNumber = toolRun?.sequenceNumber ?? "?";
      const toolName = toolRun?.name ?? "unknown_tool";

      console.log(
        `[trace:${requestId}] tool:${sequenceNumber}:end name=${toolName} output=${formatTraceValue(output)}`,
      );
      toolRuns.delete(runId);
    },

    handleToolError(error, runId) {
      const toolRun = toolRuns.get(runId);
      const sequenceNumber = toolRun?.sequenceNumber ?? "?";
      const toolName = toolRun?.name ?? "unknown_tool";

      console.error(
        `[trace:${requestId}] tool:${sequenceNumber}:error name=${toolName} error=${error?.message ?? String(error)}`,
      );
      toolRuns.delete(runId);
    },
  });

  return {
    handler,
    getToolSequence: () => [...toolSequence],
  };
}

export { createAgentTrace };
