import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import type { BrowserCommand } from "vitest/node";

/**
 * Story tests emulate media features (prefers-reduced-motion, prefers-contrast, forced-colors, prefers-color-scheme) on
 * their own page through this command; stories reach it with `emulateMedia` from src/test/media.ts. `null` puts a
 * feature back to the browser's own value.
 */
const emulateMedia: BrowserCommand<
  [
    media: {
      reducedMotion?: "reduce" | "no-preference" | null;
      contrast?: "more" | "no-preference" | null;
      forcedColors?: "active" | "none" | null;
      colorScheme?: "light" | "dark" | null;
    },
  ]
> = async ({ page }, media) => {
  // `null` should put a feature back, but on WebKit an emulated "reduce" outlived it and reached the next file (CI on
  // #167, 2026-11-13). Put back Playwright's own starting values instead.
  const initial = {
    reducedMotion: "no-preference",
    contrast: "no-preference",
    forcedColors: "none",
    colorScheme: "light",
  };
  await page.emulateMedia(
    Object.fromEntries(
      Object.entries(media).map(([feature, value]) => [
        feature,
        value ?? initial[feature as keyof typeof initial],
      ]),
    ),
  );
};

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
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.{ts,tsx}"],
          environment: "node",
          // Several unit tests read or typecheck the whole repository (prop docs, root types, cy check on a sandbox
          // copy): seconds alone, far more on a loaded machine, where the 5 s default failed the pre-commit hook.
          testTimeout: 60_000,
        },
      },
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
        plugins: [storybookTest({ configDir: ".storybook", tags: { exclude: ["touch", "serial"] } })],
        test: {
          name: "stories",
          setupFiles: [".storybook/vitest.setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: engines.map((browser) => ({ browser })),
            commands: { emulateMedia },
          },
        },
      },
      /*
       * Story files that change the whole page (emulated media features, the real pointer, real keys) run here, one
       * file at a time. Test files share one page per browser, in parallel frames: an emulated "reduce motion" or a
       * real pointer move in one file reached every file running beside it (WebKit, 2026-11-13). `cy check` requires
       * the "serial" tag on any story file that calls emulateMedia, realHover or pressKey.
       */
      {
        plugins: [
          storybookTest({ configDir: ".storybook", tags: { include: ["serial"], exclude: ["touch"] } }),
        ],
        test: {
          name: "serial",
          setupFiles: [".storybook/vitest.setup.ts"],
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: engines.map((browser) => ({ browser })),
            commands: { emulateMedia },
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
            commands: { emulateMedia },
          },
        },
      },
    ],
  },
});
