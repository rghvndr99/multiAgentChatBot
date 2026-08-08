import { ChatOpenAI } from "@langchain/openai";

let model;

function getOpenAIModel() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to the .env file.");
  }

  if (!model) {
    model = new ChatOpenAI({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      maxTokens: 256,
      temperature: 0,
    });
  }

  return model;
}

export { getOpenAIModel };
