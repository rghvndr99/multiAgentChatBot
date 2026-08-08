import { getOpenAIModel } from "../llm.js";
import { contentToText, requireText } from "../utils/content-to-text.js";

export async function combineNode(state, config) {
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

  const llm = getOpenAIModel();
  const prompt = `Combine the following specialist responses into one concise, coherent customer-support answer. Do not mention the routing process or specialist agents.\n\n${responses.join("\n\n")}`;
  const response = await llm.invoke(prompt, config);

  return {
    finalResponse: requireText(response.content, "Response combiner"),
  };
}
