import { requireText } from "../utils/content-to-text.js";

function createSpecialistNode(agent, name) {
  if (!agent || typeof agent.getAgent !== "function") {
    throw new TypeError(`${name} requires an agent with a getAgent function.`);
  }

  return async function specialistNode(state, config) {
    if (!Array.isArray(state.messages)) {
      throw new TypeError(`${name} requires messages in graph state.`);
    }

    const result = await agent.getAgent().invoke(
      { messages: state.messages },
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
