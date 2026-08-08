import { productAgent } from "../agents/index.js";

export async function productNode(state, config) {
  const result = await productAgent.getAgent().invoke(
    { messages: state.messages },
    config,
  );

  return {
    responses: [result.messages.at(-1).content],
  };
}
