import { createHash } from "node:crypto";

const maxEntries = 100;
const ttlMilliseconds = 5 * 60 * 1000;
const cache = new Map();

function cacheKey(userMessage, messages) {
  return createHash("sha256")
    .update(JSON.stringify({ userMessage, messages }))
    .digest("hex");
}

function getCachedRoutes(userMessage, messages) {
  const key = cacheKey(userMessage, messages);
  const entry = cache.get(key);

  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  cache.delete(key);
  cache.set(key, entry);
  return { routes: [...entry.routes], routingSource: "cache" };
}

function setCachedRoutes(userMessage, messages, routes) {
  const key = cacheKey(userMessage, messages);

  cache.set(key, {
    routes: [...routes],
    expiresAt: Date.now() + ttlMilliseconds,
  });

  while (cache.size > maxEntries) {
    cache.delete(cache.keys().next().value);
  }
}

function clearRouteCache() {
  cache.clear();
}

export { clearRouteCache, getCachedRoutes, setCachedRoutes };
