const validAgents = new Set(["product", "order", "payment", "none"]);

class RoutingResponseError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RoutingResponseError";
  }
}

function parseRoutes(content) {
  if (typeof content !== "string") {
    throw new RoutingResponseError(
      "Invalid routing response: expected a JSON string.",
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new RoutingResponseError(
      "Invalid routing response: expected valid JSON.",
      { cause: error },
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new RoutingResponseError(
      "Invalid routing response: expected a JSON object.",
    );
  }

  const routes = parsed.agents;

  if (!Array.isArray(routes) || routes.length === 0) {
    throw new RoutingResponseError(
      "Invalid routing response: agents must be a non-empty array.",
    );
  }

  const invalidRoute = routes.find(
    (route) => typeof route !== "string" || !validAgents.has(route),
  );

  if (invalidRoute !== undefined) {
    throw new RoutingResponseError(
      "Invalid routing response: agents contains an unsupported route.",
    );
  }

  const uniqueRoutes = [...new Set(routes)];

  if (uniqueRoutes.includes("none") && uniqueRoutes.length > 1) {
    throw new RoutingResponseError(
      "Invalid routing response: none cannot be combined with another route.",
    );
  }

  return { routes: uniqueRoutes };
}

export { parseRoutes, RoutingResponseError };
