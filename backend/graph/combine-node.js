import { contentToText } from "../utils/content-to-text.js";

export async function combineNode(state) {
  const responses = state.responses
    .map(contentToText)
    .map((response) => response.trim())
    .filter(Boolean);

  if (responses.length === 0) {
    throw new Error("No specialist agent produced a response.");
  }

  if (responses.length === 1) {
    return { finalResponse: responses[0] };
  }

  return {
    finalResponse: responses.map((response) => `- ${response}`).join("\n"),
  };
}
