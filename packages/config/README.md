# @arshad-shah/cynosure-config

> Internal — shared tooling presets for the Cynosure monorepo. Not published to npm.

This package centralises the build / typecheck / lint configuration that every published Cynosure package extends. It exists so a tsup target, a tsconfig flag, or a Biome rule can be changed in one place rather than hand-rolled across eight `package.json`s.

---

## Exports

| Subpath                                  | Purpose                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `@arshad-shah/cynosure-config/biome.json`         | Shared Biome lint/format rules; extended by the repo-root `biome.json`. |
| `@arshad-shah/cynosure-config/tsconfig.base.json` | Strict TS defaults (target, module resolution, libs) all packages inherit. |
| `@arshad-shah/cynosure-config/tsconfig.lib.json`  | Library-specific overrides (declarations on, no emit of JS). |
| `@arshad-shah/cynosure-config/tsup.config.base`   | `createConfig(overrides)` — the tsup preset every publishable package wraps. Defines ESM-only output, `target: es2022`, splitting, treeshaking, externalised React peer deps, and source-map / minify defaults. |

---

## How it's used

Each publishable package wraps the tsup preset and adds its own entries:

```ts
// packages/<pkg>/tsup.config.ts
import { createConfig } from '@arshad-shah/cynosure-config/tsup.config.base';

export default createConfig({
  entry: { index: 'src/index.ts' /* …per-component entries… */ },
  // any package-specific overrides (esbuildPlugins, onSuccess, external, etc.)
});
```

Adjusting source-map / minify / target defaults here propagates to every package's next build.

---

## Why a workspace package, not a shared file

- Versioned alongside the consumers — `pnpm install` resolves the path through pnpm's workspace catalog, so there's no `../../config` chain.
- TypeScript path resolution and Astro / Vite / tsup all treat it as a normal package.
- The `private: true` + missing `publishConfig` block keeps it out of npm.
