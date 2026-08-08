import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: [
        "backend/agents/**/*.js",
        "backend/graph/**/*.js",
        "backend/tools/**/*.js",
        "backend/llm.js",
      ],
    },
  },
});
