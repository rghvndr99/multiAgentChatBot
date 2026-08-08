import { paymentAgent } from "../agents/index.js";

export async function paymentNode(state, config) {
  const result = await paymentAgent.getAgent().invoke(
    { messages: state.messages },
    config,
  );

  return {
    responses: [result.messages.at(-1).content],
  };
}
