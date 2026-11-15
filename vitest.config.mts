import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/__tests__/**", "src/@types/**"],
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
    projects: [
      {
        extends: true,
        test: {
          name: "main",
          environment: "node",
          include: ["src/__tests__/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "web",
          environment: "jsdom",
          include: ["src/web/__tests__/**/*.test.{ts,tsx}"],
          setupFiles: ["./src/web/__tests__/setup.ts"],
        },
      },
    ],
  },
});
