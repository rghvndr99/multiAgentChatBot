import { vi } from "vitest";

const specialistRoutes = ["product", "order", "payment", "none"];

function createFakeGraphDependencies(routes = ["product"]) {
  const events = [];
  const dependencies = {
    routeRequest: vi.fn(async () => {
      events.push("supervisor");
      return { routes };
    }),
    combineNode: vi.fn(async (state) => {
      events.push("combine");
      return {
        finalResponse: [...state.responses].sort().join(" | "),
      };
    }),
  };

  for (const route of specialistRoutes) {
    const dependencyName = route === "none" ? "unsupportedNode" : `${route}Node`;

    dependencies[dependencyName] = vi.fn(async () => {
      events.push(route);
      return { responses: [`${route} response`] };
    });
  }

  return { dependencies, events };
}

export { createFakeGraphDependencies, specialistRoutes };
