import { requireText } from "../utils/content-to-text.js";
import { getRecentMessages } from "../utils/recent-messages.js";

function createSpecialistNode(agent, name, { directHandler } = {}) {
  if (!agent || typeof agent.getAgent !== "function") {
    throw new TypeError(`${name} requires an agent with a getAgent function.`);
  }

  return async function specialistNode(state, config) {
    if (!Array.isArray(state.messages)) {
      throw new TypeError(`${name} requires messages in graph state.`);
    }

    const messages = getRecentMessages(state.messages);
    const directResponse = await directHandler?.(
      { userMessage: state.userMessage, messages },
      config,
    );

    if (directResponse) {
      return { responses: [requireText(directResponse, `${name} direct handler`)] };
    }

    const result = await agent.getAgent().invoke(
      { messages },
      config,
    );
    const response = requireText(
      result?.messages?.at(-1)?.content,
      `${name} agent`,
    );

    return { responses: [response] };
  };
}

export { createSpecialistNode };
