import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Cross-browser matrix (Phase 14).
 *
 * Local dev: Chromium only — fast loop, no Playwright install churn.
 * CI       : all three engines — parity check per PR.
 *
 * Toggle by setting `LUMEN_BROWSER_MODE=1` (CI) or leaving it unset (local).
 * Browser mode only picks up files matching `*.browser.test.{ts,tsx}` — the
 * bulk of the suite continues to run under jsdom (faster feedback, no need
 * to re-derive every polyfill). As real-browser coverage expands, new tests
 * land under the `.browser.test.*` suffix and get the full engine matrix.
 */
const ciBrowsers = process.env.CI ? ['chromium', 'firefox', 'webkit'] : ['chromium'];
const browserMode = process.env.LUMEN_BROWSER_MODE === '1';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    passWithNoTests: true,
    include: browserMode ? ['src/**/*.browser.test.{ts,tsx}'] : ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: browserMode ? [] : ['src/**/*.browser.test.{ts,tsx}'],
    ...(browserMode
      ? {
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: ciBrowsers.map((browser) => ({ browser })),
          },
        }
      : {}),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Tests and stories aren't subjects of coverage themselves.
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        // Re-export barrels.
        'src/**/index.ts',
        // Test scaffolding + generated artefacts.
        'src/test/**',
        'src/generated/**',
        // vanilla-extract files compile to CSS at build time; the .ts source
        // has no runtime code paths to cover.
        'src/**/*.css.ts',
        // Type-only files (named `types.ts` / `polymorphic.ts` across the
        // tree) are pure type declarations with no runtime to exercise.
        'src/**/types.ts',
        'src/**/polymorphic.ts',
        // Storybook MDX recipes carry compiled docs, not runtime code.
        'src/**/*.mdx',
      ],
      thresholds: {
        // Unit-test floor: 80% across every metric. Storybook + browser-mode
        // tests cover interaction and visual regression on top of this
        // baseline. Tighten as coverage climbs; never loosen.
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
