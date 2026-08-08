import { orderAgent } from "../agents/index.js";

export async function orderNode(state, config) {
  const result = await orderAgent.getAgent().invoke(
    { messages: state.messages },
    config,
  );

  return {
    responses: [result.messages.at(-1).content],
  };
}
