import { getOpenAIModel } from "../llm.js";

function contentToText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");

  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export async function combineNode(state) {
  const responses = state.responses.map(contentToText).filter(Boolean);

  if (responses.length === 0) {
    throw new Error("No specialist agent produced a response.");
  }

  if (responses.length === 1) {
    return { finalResponse: responses[0] };
  }

  const llm = getOpenAIModel();
  const prompt = `Combine the following specialist responses into one concise, coherent customer-support answer. Do not mention the routing process or specialist agents.\n\n${responses.join("\n\n")}`;
  const response = await llm.invoke(prompt);

  return { finalResponse: contentToText(response.content) };
}
