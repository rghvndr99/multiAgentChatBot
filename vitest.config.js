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
      thresholds: {
        statements: 95,
        branches: 80,
        functions: 95,
        lines: 95,
      },
      include: [
        "backend/agents/**/*.js",
        "backend/graph/**/*.js",
        "backend/tools/**/*.js",
        "backend/utils/**/*.js",
        "backend/llm.js",
      ],
    },
  },
});
