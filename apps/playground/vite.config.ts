import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  // Don't pre-bundle the workspace packages. Vite's dep optimizer caches
  // `node_modules` into `.vite/deps` and only invalidates that snapshot when
  // `package.json` / `pnpm-lock.yaml` changes. When `@arshad-shah/cynosure-*`
  // is symlinked from `packages/*/dist/` (pnpm workspace), rebuilding the
  // library updates the dist files but Vite keeps serving the stale cached
  // bundle — props you change in the playground appear to do nothing.
  // Excluding the workspace packages here makes Vite re-read `dist/` on every
  // request, so a `pnpm --filter @arshad-shah/cynosure-react build` shows up
  // immediately on the next HMR refresh.
  optimizeDeps: {
    exclude: [
      '@arshad-shah/cynosure-react',
      '@arshad-shah/cynosure-themes',
      '@arshad-shah/cynosure-tokens',
    ],
  },
  server: {
    port: 4321,
    open: false,
  },
});
