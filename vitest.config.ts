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
    projects: [
      { test: { name: "unit", include: ["tests/unit/**/*.test.{ts,tsx}"], environment: "node" } },
      {
        plugins: [storybookTest({ configDir: ".storybook" })],
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
    ],
  },
});
