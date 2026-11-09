import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const engines = (process.env.CY_BROWSERS ?? "chromium,firefox,webkit").split(",") as (
  | "chromium"
  | "firefox"
  | "webkit"
)[];

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.tsx",
        "src/docs/**",
        "src/test/**",
        "src/styles/generated-css.ts",
        "src/**/index.ts",
        "src/icons/types.ts",
        "src/tokens/schema.ts",
      ],
      thresholds: { lines: 95, branches: 95, functions: 95, statements: 95 },
      reporter: ["text-summary", "text"],
    },
    projects: [
      { test: { name: "unit", include: ["tests/unit/**/*.test.{ts,tsx}"], environment: "node" } },
      {
        resolve: {
          alias: [
            { find: /^react$/, replacement: "preact/compat" },
            { find: /^react-dom$/, replacement: "preact/compat" },
            { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
            { find: /^react-dom\/test-utils$/, replacement: "preact/test-utils" },
            { find: /^react\/jsx-runtime$/, replacement: "preact/jsx-runtime" },
            { find: /^react\/jsx-dev-runtime$/, replacement: "preact/jsx-runtime" },
          ],
        },
        test: {
          name: "preact",
          include: ["tests/preact/**/*.test.tsx"],
          environment: "jsdom",
          server: { deps: { inline: [/@testing-library/] } },
        },
      },
      {
        plugins: [storybookTest({ configDir: ".storybook", tags: { exclude: ["touch"] } })],
        test: {
          name: "stories",
          setupFiles: [".storybook/vitest.setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: engines.map((browser) => ({ browser })),
          },
        },
      },
      {
        plugins: [storybookTest({ configDir: ".storybook", tags: { include: ["touch"] } })],
        test: {
          name: "touch",
          setupFiles: [".storybook/vitest.setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { hasTouch: true, isMobile: true } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
