import { getRecentMessages } from "../utils/recent-messages.js";

const routePatterns = {
  product:
    /\b(product|price|pricing|stock|available|availability|recommend|compare|phone|laptop|iphone|pixel)\b|\bshow\s+me\b/i,
  order:
    /\b(order|tracking|track|tracked|return|cancel|parcel|shipment|shipped|dispatch|delivery)\b|\bORD[-\s]?\d[A-Z0-9]*\b/i,
  payment:
    /\b(payment|pay|paid|charge|charged|refund|invoice|billing|transaction)\b|\bINV[-\s]?\d[A-Z0-9]*\b/i,
};

const unsupportedPattern =
  /\b(weather|forecast|cricket|football|sports?|prime minister|president|died|dead|news|movie|recipe)\b/i;

function findRoutes(text) {
  return Object.entries(routePatterns)
    .filter(([, pattern]) => pattern.test(text))
    .map(([route]) => route);
}

function conversationText(messages) {
  return getRecentMessages(messages)
    .filter((message) => message?.role === "user")
    .map((message) => message.content)
    .join("\n");
}

function routeDeterministically(userMessage, messages = []) {
  const routes = findRoutes(userMessage);

  if (routes.length > 0) {
    return { routes, routingSource: "deterministic" };
  }

  if (unsupportedPattern.test(userMessage)) {
    return { routes: ["none"], routingSource: "deterministic" };
  }

  const looksLikeFollowUp =
    userMessage.length < 80 &&
    /^(it|that|this|yes|no|the\s+(id|number)|[A-Z]*-?\d+)/i.test(
      userMessage.trim(),
    );

  if (looksLikeFollowUp) {
    const contextualRoutes = findRoutes(conversationText(messages));

    if (contextualRoutes.length > 0) {
      return { routes: contextualRoutes, routingSource: "deterministic" };
    }
  }

  return null;
}

export { routeDeterministically };
