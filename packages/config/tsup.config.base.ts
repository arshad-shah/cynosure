import { type Options, defineConfig } from 'tsup';

/**
 * Shared tsup preset for all @cynosure packages.
 *
 * - Per-component entry points (one file per component exported from src/<Component>/index.ts)
 * - ESM only
 * - Emit per-component CSS alongside JS so consumers only load what they import
 * - Externalise React and all peer deps
 */
export const createConfig = (overrides: Partial<Options> = {}): Options =>
  defineConfig({
    format: ['esm'],
    target: 'es2022',
    dts: true,
    // No source maps in the published build: consumers never use a library's
    // maps, and they were ~half the tarball (6.6 MB of `.map` files).
    sourcemap: false,
    clean: true,
    splitting: true,
    treeshake: true,
    minify: false,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    ...overrides,
  }) as Options;
