# Phase 01 — Foundation & tooling

> **Goal:** Get a monorepo up, running, buildable, testable, lintable, and publishable — with nothing in it yet. Every subsequent phase depends on this being rock-solid.

**Depends on:** nothing.
**Blocks:** every other phase.

---

## What you're building

A pnpm + Turborepo monorepo containing empty-but-wired packages, shared tooling configuration, a working Storybook shell, a working Vitest setup, a working tsup build, and a working release pipeline. **No components yet.** The deliverable of this phase is a repo where running `pnpm build && pnpm test && pnpm storybook && pnpm changeset` all succeed on empty packages.

---

## Folder layout to produce

```
cynosure/
├── .changeset/
│   └── config.json
├── .github/
│   └── workflows/
│       ├── ci.yml                # test + lint + build on every PR
│       └── release.yml           # changesets/action on push to main
├── .vscode/
│   └── settings.json             # biome as default formatter, recommended extensions
├── apps/
│   └── playground/               # Vite React app; empty for now
│       ├── src/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── config/                   # internal, unpublished
│   │   ├── biome.json            # shared biome base
│   │   ├── tsconfig.base.json
│   │   ├── tsconfig.lib.json
│   │   ├── tsup.config.base.ts
│   │   └── package.json
│   ├── tokens/                   # @arshad-shah/cynosure-tokens
│   │   ├── src/
│   │   │   └── index.ts          # empty export for now
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   ├── themes/                   # @arshad-shah/cynosure-themes
│   │   └── …                     # same shape
│   ├── core/                     # @arshad-shah/cynosure-core
│   │   └── …
│   ├── react/                    # @arshad-shah/cynosure-react
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   └── icons/                    # @arshad-shah/cynosure-icons
│       └── …
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── vitest.setup.ts
├── .gitignore
├── .npmrc
├── biome.json                    # extends packages/config/biome.json
├── package.json                  # root
├── pnpm-workspace.yaml
├── tsconfig.json                 # root references to each package
├── turbo.json
└── README.md
```

---

## Step-by-step

### 1. Repo init

```bash
mkdir cynosure && cd cynosure
git init
pnpm init
```

Root `package.json`:

```json
{
  "name": "cynosure",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@9.15.0",
  "engines": { "node": ">=20.16.0" },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch --parallel",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "typecheck": "turbo run typecheck",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "changeset": "changeset",
    "version-packages": "changeset version && pnpm install --lockfile-only",
    "release": "turbo run build --filter=\"./packages/*\" && changeset publish",
    "clean": "turbo run clean && rm -rf node_modules",
    "prepare": "simple-git-hooks"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@changesets/cli": "^2.27.0",
    "@changesets/changelog-github": "^0.5.0",
    "@arethetypeswrong/cli": "^0.17.0",
    "publint": "^0.3.0",
    "simple-git-hooks": "^2.11.0",
    "lint-staged": "^15.2.0",
    "turbo": "^2.3.0",
    "typescript": "^5.6.0"
  },
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged",
    "commit-msg": "node scripts/verify-commit-msg.mjs $1"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md}": ["biome check --write --no-errors-on-unmatched"]
  }
}
```

### 2. pnpm workspace

`pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`.npmrc`:

```
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=false
```

### 3. Turborepo

`turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["tsconfig.base.json", "biome.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "inputs": ["src/**", "package.json", "tsconfig.json", "tsup.config.ts"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**", "tests/**", "vitest.config.*"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": { "cache": false }
  }
}
```

### 4. TypeScript base

`tsconfig.base.json` at root:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "verbatimModuleSyntax": true
  }
}
```

`packages/config/tsconfig.lib.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"]
}
```

Each package's `tsconfig.json`:

```json
{
  "extends": "../config/tsconfig.lib.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

Root `tsconfig.json` uses project references:

```json
{
  "files": [],
  "references": [
    { "path": "packages/tokens" },
    { "path": "packages/themes" },
    { "path": "packages/core" },
    { "path": "packages/react" },
    { "path": "packages/icons" }
  ]
}
```

### 5. Biome

`biome.json` at root:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "ignore": ["dist", "storybook-static", "coverage", ".turbo"] },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "trailingCommas": "all", "semicolons": "always" }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedImports": "error", "noUnusedVariables": "error", "useExhaustiveDependencies": "warn" },
      "style": { "noNonNullAssertion": "warn", "useNodejsImportProtocol": "error", "useImportType": "error" },
      "suspicious": { "noExplicitAny": "warn", "noConsole": { "level": "warn", "options": { "allow": ["warn", "error"] } } },
      "a11y": { "recommended": true },
      "performance": { "recommended": true }
    }
  },
  "organizeImports": { "enabled": true }
}
```

### 6. Changesets

```bash
pnpm changeset init
```

Edit `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": ["@changesets/changelog-github", { "repo": "arshadshah/cynosure" }],
  "commit": false,
  "fixed": [],
  "linked": [["@arshad-shah/cynosure-*"]],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["playground"]
}
```

The `linked` array keeps all `@arshad-shah/cynosure-*` packages on the same version — this matters for a cohesive design system where `@arshad-shah/cynosure-react` depends on `@arshad-shah/cynosure-tokens`.

### 7. tsup shared preset

`packages/config/tsup.config.base.ts`:

```ts
import { defineConfig, type Options } from 'tsup';

/**
 * Shared tsup preset for all @cynosure packages.
 *
 * Design goals:
 * - Per-component entry points (one file per component exported from src/<Component>/index.ts)
 * - ESM only (CJS is not worth the complexity for a modern design system; note this in README)
 * - `preserveModules: false` — tsup bundles each entry into a single file, which is fine
 *   because downstream bundlers tree-shake at entry-point granularity
 * - Emit per-component CSS alongside JS, so consumers only load what they import
 * - Externalise React and all peer deps
 */
export const createConfig = (overrides: Partial<Options> = {}): Options =>
  defineConfig({
    format: ['esm'],
    target: 'es2022',
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    treeshake: true,
    minify: false, // consumers minify; we preserve readability + better tree-shaking
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    ...overrides,
  }) as Options;
```

### 8. Package shell — using `@arshad-shah/cynosure-react` as the canonical example

`packages/react/package.json`:

```json
{
  "name": "@arshad-shah/cynosure-react",
  "version": "0.0.0",
  "description": "Cynosure UI — React component library",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md", "CHANGELOG.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist .turbo"
  },
  "peerDependencies": {
    "react": ">=19.0.0",
    "react-dom": ">=19.0.0"
  },
  "dependencies": {
    "@arshad-shah/cynosure-core": "workspace:*",
    "@arshad-shah/cynosure-tokens": "workspace:*"
  },
  "devDependencies": {
    "@arshad-shah/cynosure-config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "vitest": "^3.0.0"
  },
  "publishConfig": { "access": "public" }
}
```

> **Per-component exports (comes in Phase 05):** once components exist, we'll extend the `exports` map so `import { Button } from "@arshad-shah/cynosure-react/button"` works as a sub-path. For now the root export is enough.

`packages/react/tsup.config.ts`:

```ts
import { createConfig } from '@arshad-shah/cynosure-config/tsup.config.base';

export default createConfig({
  entry: {
    index: 'src/index.ts',
    // Phase 05 will add per-component entries here
  },
});
```

`packages/react/src/index.ts`:

```ts
export const VERSION = '0.0.0';
```

Do the same pattern for `@arshad-shah/cynosure-tokens`, `@arshad-shah/cynosure-themes`, `@arshad-shah/cynosure-core`, `@arshad-shah/cynosure-icons` — each with the same `package.json` skeleton, its own `tsconfig.json` extending `packages/config/tsconfig.lib.json`, and a `tsup.config.ts`.

### 9. Vitest (browser mode)

Install once at the root:

```bash
pnpm add -Dw vitest @vitest/browser playwright @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom
pnpm exec playwright install chromium
```

Per-package `vitest.config.ts` (example for `@arshad-shah/cynosure-react`):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### 10. Storybook 10 (or latest 9.x if 10 is unstable)

From the repo root:

```bash
pnpm dlx storybook@latest init --type react-vite --package-manager pnpm
```

Move `.storybook/` to repo root (if the init put it under a package). Configure:

`.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../packages/**/*.mdx', '../packages/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  typescript: { reactDocgen: 'react-docgen-typescript' },
  docs: { autodocs: 'tag' },
};

export default config;
```

`.storybook/preview.ts`:

```ts
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' }, // fail tests on a11y violations in Phase 14
    layout: 'centered',
    backgrounds: { disable: true }, // we'll control via ThemeProvider in Phase 03
  },
  tags: ['autodocs'],
};

export default preview;
```

### 11. Commit-message convention

Simple Conventional Commits. `scripts/verify-commit-msg.mjs`:

```js
import { readFileSync } from 'node:fs';

const msg = readFileSync(process.argv[2], 'utf8').trim();
const pattern =
  /^(feat|fix|perf|refactor|docs|test|chore|build|ci|style|revert)(\([^)]+\))?!?: .{1,}/;
if (!pattern.test(msg.split('\n')[0])) {
  console.error('✗ Commit message must follow Conventional Commits.');
  console.error('  Example: feat(phase-05): add Stack primitive');
  process.exit(1);
}
```

### 12. GitHub Actions

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec publint packages/react/dist --level warning
      - run: pnpm exec attw --pack packages/react --ignore-rules cjs-resolves-to-esm
```

`.github/workflows/release.yml`:

```yaml
name: Release
on:
  push: { branches: [main] }
concurrency: ${{ github.workflow }}-${{ github.ref }}
jobs:
  release:
    runs-on: ubuntu-latest
    permissions: { contents: write, pull-requests: write, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm, registry-url: https://registry.npmjs.org }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm version-packages
          commit: 'chore(release): version packages'
          title: 'chore(release): version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_CONFIG_PROVENANCE: 'true'
```

### 13. Playground app

`apps/playground/package.json`:

```json
{
  "name": "playground",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": {
    "@arshad-shah/cynosure-react": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

`apps/playground/src/App.tsx`:

```tsx
import { VERSION } from '@arshad-shah/cynosure-react';

export function App() {
  return <div>Cynosure {VERSION}</div>;
}
```

This sanity-checks that the workspace dependency resolution and the `@arshad-shah/cynosure-react` build output actually work when consumed.

---

## Exit criteria

Every one of these must pass before Phase 02 begins. Each is a literal command you should run.

- [ ] `pnpm install` — clean install with no peer-dep warnings
- [ ] `pnpm typecheck` — all packages type-check
- [ ] `pnpm lint` — Biome reports no errors
- [ ] `pnpm build` — all packages build into `dist/` with `.js`, `.d.ts`, and sourcemap files
- [ ] `pnpm test` — Vitest runs (even with zero tests) and exits 0
- [ ] `pnpm storybook` — Storybook starts on :6006 and loads with no errors
- [ ] `pnpm exec publint packages/react/dist` — clean, no warnings
- [ ] `pnpm exec attw --pack packages/react` — no type-resolution issues
- [ ] `pnpm changeset` — interactive prompt runs
- [ ] `cd apps/playground && pnpm dev` — renders "Cynosure 0.0.0"
- [ ] CI workflow runs green on a test PR
- [ ] Git hooks (`pre-commit`, `commit-msg`) fire on a real commit

## Definition of done (phase-level)

- A collaborator can `git clone`, run `pnpm install`, and be productive in under 5 minutes.
- The repo README explains how to add a new component package or a new component, even though no such component exists yet.

## Update `PROGRESS.md`

- Set Phase 01 to 🟢 Complete.
- Fill in the "Decisions log" with anything you deviated from in this doc.
- Write a single changeset `pnpm changeset` at `patch` level scoped to `@arshad-shah/cynosure-react` with message "Initial foundation"; don't version-bump until Phase 16.
