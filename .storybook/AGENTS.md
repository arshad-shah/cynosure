# .storybook

Storybook 10 (`@storybook/react-vite`) is the workbench and the browser test runner (`@storybook/addon-vitest`, `@storybook/addon-a11y` with `test: "error"`).

- `preview.tsx`: toolbar globals (mode, contrast, scale, accent, host) → `CynosureTheme` decorator; hostile host injects `src/test/hostile.ts`.
- `vitest.setup.ts` applies project annotations for tests. In visual runs (`VITE_CY_VISUAL=1`) it pins `--cy-font-mono` to Liberation Mono, which Chromium's system packages always install: the theme's stack names no Linux font, and runners picked different monospace faces from run to run. `vitest.config.ts` defines the `stories` (3 engines, excludes `touch`) and `touch` (Chromium with touch + mobile, includes `touch`) projects.
- `manager.ts`: Cynosure branding. Static `brand/` is served at `/brand`.
- Docs pages live in `src/docs/*.mdx`.
- `stale-deploy.ts` (loaded by `preview.tsx` and `manager.ts`): after a Pages deploy, an open or cached tab asks for chunks that no longer exist; on `vite:preloadError` the page reloads once (at most every 30s) onto the new deploy.
