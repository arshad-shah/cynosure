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
 * Even when browser mode is enabled the jsdom-only suites in `__tests__`
 * still run under the default environment; only tests in `*.browser.test.*`
 * opt in via the `@browser` filter on the project side.
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
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
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
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/index.ts',
        'src/test/**',
        'src/generated/**',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
});
