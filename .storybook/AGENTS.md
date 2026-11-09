# .storybook

Storybook 10 (`@storybook/react-vite`) is the workbench and the browser test runner (`@storybook/addon-vitest`, `@storybook/addon-a11y` with `test: "error"`).

- `preview.tsx`: toolbar globals (mode, contrast, scale, accent, host) → `CynosureTheme` decorator; hostile host injects `src/test/hostile.ts`.
- `vitest.setup.ts` applies project annotations for tests. `vitest.config.ts` defines the `stories` (3 engines, excludes `touch`) and `touch` (Chromium with touch + mobile, includes `touch`) projects.
- `manager.ts`: Cynosure branding. Static `brand/` is served at `/brand`.
- Docs pages live in `src/docs/*.mdx`.
