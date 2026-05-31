import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Map obsidian module to our test mock
      obsidian: new URL(
        "__tests__/helpers/obsidian-mock.ts",
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
    },
  },
});
