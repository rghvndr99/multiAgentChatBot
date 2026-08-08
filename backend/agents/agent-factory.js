import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getOpenAIModel } from "../llm.js";

/**
 * Define a lazily initialized LangGraph agent.
 * Agent modules only need to provide their unique name, prompt, and tools.
 */
function defineAgent({ name, prompt, tools }) {
  if (!name || !prompt || !Array.isArray(tools)) {
    throw new Error("An agent requires a name, prompt, and tools array.");
  }

  let instance;

  function getAgent() {
    if (!instance) {
      instance = createReactAgent({
        llm: getOpenAIModel(),
        name,
        tools,
        prompt,
      });
    }

    return instance;
  }

  return Object.freeze({ getAgent });
}

export { defineAgent };
