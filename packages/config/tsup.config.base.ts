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
    sourcemap: false,
    clean: true,
    splitting: true,
    treeshake: true,
    minify: false,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    ...overrides,
  }) as Options;
