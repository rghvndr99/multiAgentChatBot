import { getOpenAIModel } from "../llm.js";
import { parseRoutes } from "./route-parser.js";

function formatConversation(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "(no conversation history)";
  }

  return messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

export async function routeRequest(userMessage, config, messages = []) {
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
- If no specialist is relevant, return only none.
- Never combine none with another agent.

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

User: I want to know the weather forecast for tomorrow.
Output:
{"agents":["none"]}

Conversation History:
<conversation>
${formatConversation(messages)}
</conversation>

Latest User Request:
<user_request>
${userMessage}
</user_request>
`;

  const response = await llm.invoke(prompt, config);

  return parseRoutes(response.content);
}
