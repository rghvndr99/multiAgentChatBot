import { getOpenAIModel } from "../llm.js";

const validAgents = new Set(["product", "order", "payment", "none"]);

export async function routeRequest(userMessage) {
  const llm = getOpenAIModel();
  const prompt = `
You are a routing agent.

Your ONLY responsibility is to decide which agent(s) should handle the request.

Available Agents:

1. product
- Product search
- Product recommendation
- Product comparison

2. order
- Order status
- Order tracking
- Return request
- Cancel order

3. payment
- Payment
- Refund
- Invoice

Rules:
- Return ONLY valid JSON.
- Never explain your decision.
- If multiple agents are needed, return all of them.
- Return at least one agent. If uncertain, choose the closest matching agent.

Examples:

User: Show me iPhone 16
Output:
{"agents":["product"]}

User: Where is my order?
Output:
{"agents":["order"]}

User: Download my invoice
Output:
{"agents":["payment"]}

User: I want to return my order and know when I will receive my refund.
Output:
{"agents":["order","payment"]}

if none of the agents are relevent, return the clear meessage that you do not have relevant agent to handle the request.

User: I want to know the weather forecast for tomorrow.
Output:
{"agents":["none"]}

User Request:
${userMessage}
`;

  const response = await llm.invoke(prompt);

  try {
    const routes = JSON.parse(response.content).agents;

    if (
      !Array.isArray(routes) ||
      routes.length === 0 ||
      routes.some((agent) => !validAgents.has(agent))
    ) {
      throw new Error("The agents list is missing or invalid.");
    }

    return { routes: [...new Set(routes)] };
  } catch (error) {
    throw new Error(`Invalid routing response: ${response.content}`, {
      cause: error,
    });
  }
}
