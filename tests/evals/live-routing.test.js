import "dotenv/config";

import { describe, expect, it } from "vitest";

import { routeRequest } from "../../backend/graph/master-route.js";
import { routingCases } from "./routing-cases.js";

const liveDescribe = process.env.RUN_LIVE_EVALS === "true" ? describe : describe.skip;

liveDescribe("live OpenAI routing evaluation", () => {
  it.each(routingCases)(
    "$name",
    async ({ messages, expectedRoutes, expectedSource = "deterministic" }) => {
      const startedAt = Date.now();
      const latestUserMessage = messages.findLast(
        (message) => message.role === "user",
      ).content;
      const result = await routeRequest(latestUserMessage, {}, messages);

      console.info(
        `[live-routing] expected=${expectedRoutes.join(",")} actual=${result.routes.join(",")} latencyMs=${Date.now() - startedAt}`,
      );
      expect([...result.routes].sort()).toEqual([...expectedRoutes].sort());
      expect(result.routingSource).toBe(expectedSource);
    },
    60_000,
  );
});
