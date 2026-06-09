# @arshad-shah/cynosure-docs

Public documentation site for Cynosure UI. Deploys to Cloudflare Pages.

> Storybook remains the internal dev/CI tool (Chromatic, visual regression, a11y). This package is the public-facing deployment.

## Local development

```sh
pnpm docs        # dev server on :4321
pnpm docs:build  # full production build
```

## Deploying to Cloudflare Pages

### Mode A — Root-mode (monorepo)

Pages dashboard settings:

- Root directory: `/` (repo root)
- Build command: `pnpm --filter @arshad-shah/cynosure-docs... build`
- Build output: `packages/docs/dist`
- Env: `PNPM_VERSION=10.33.0`, `NODE_VERSION=22`

### Mode B — Package-mode

- Root directory: `packages/docs`
- Build command: `pnpm build`
- Build output: `dist`

`wrangler.toml` in this package sets `pages_build_output_dir = "dist"`, so Pages auto-discovers the output in Mode B.

### Manual deploy

```sh
pnpm --filter @arshad-shah/cynosure-docs build
npx wrangler pages deploy packages/docs/dist --project-name cynosure-docs
```

## Auto-updating

Each build regenerates:
- Props tables (from current `packages/react/**` types via `react-docgen-typescript`)
- Version pill (from `packages/react/package.json`)
- Changelog page (from `packages/react/CHANGELOG.md`)
- Component-count tiles (from the source tree under `packages/react/src/`)
- Bundle-size pills (from `packages/react/dist/sizes.json`, emitted by the react package's `tsup onSuccess` and copied into `src/generated/component-sizes.json` by `scripts/component-sizes.mjs`). The hand-maintained `.size-limit.json` is still in the tree but is now used only for CI budget enforcement, not for display.
- Page-coverage gate (fails build if a new export lacks docs)
