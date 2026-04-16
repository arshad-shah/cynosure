import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Root Vite config used by Storybook. Vitest packages inherit via
 * `defineConfig({ plugins: [...] })` in their own `vitest.config.ts`.
 */
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
});
