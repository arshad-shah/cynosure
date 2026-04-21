# @arshad-shah/cynosure-docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `packages/docs` — a Cloudflare-Pages-deployable Astro 5 docs site that documents the Cynosure React library using the real components, real tokens, and brand assets from the monorepo. This site becomes the public face of Cynosure (think MUI-caliber docs, tailored to Cynosure). Storybook stays as the internal dev + CI/testing/chromatic tool — it is no longer the public-facing deployment.

**Architecture:** Astro 5 (static output) + MDX Content Collections + React islands for live previews. Props tables auto-generated from `packages/react` `.tsx` via `react-docgen-typescript` at build time. Client-side search via Pagefind. Four themes (`light` / `dark` / `terminal` / `high-contrast`) toggled by flipping `data-theme` on `<html>`, with inline pre-paint script to avoid FOUC. Deployable to Cloudflare Pages in two modes: (a) root-mode via `pnpm --filter` + output `packages/docs/dist`, or (b) package-root mode pointing Pages at `packages/docs/` directly via `wrangler.toml` with `pages_build_output_dir = "dist"`.

**Public-site swap:** Whichever Cloudflare Pages project currently serves the Storybook build at the Cynosure public domain should be repointed at `packages/docs/dist` (or replaced by a new `cynosure-docs` Pages project, with the old Storybook URLs redirected — see Task 17 `_redirects` for `?path=/docs/*` rewrites). If the existing Pages project config lives outside the allowed scope, that swap is flagged in the final summary, not done inline.

**Tech Stack:** Astro 5, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/react`, React 19, `@arshad-shah/cynosure-react` (`workspace:*`), `@arshad-shah/cynosure-tokens` (`workspace:*`), `@arshad-shah/cynosure-themes` (`workspace:*`), `react-docgen-typescript`, `shiki` (theme `github-dark-dimmed`), `pagefind`, `@fontsource-variable/geist`, `@fontsource-variable/jetbrains-mono`, TypeScript strict, Biome, `tsx`.

**Scope boundary:** Only these paths may be edited: `packages/docs/**`, `pnpm-workspace.yaml`, `turbo.json`, `.github/workflows/**`, root `package.json`. Any other change needed (e.g. renaming/repointing the Cloudflare project that serves Storybook today, removing the `chromatic` step that builds Storybook for the public URL) must be flagged in the final summary, not made.

---

## Component pages to ship (18 minimum)

| # | Name   | Category      | Status | Example files (`_examples/*.tsx`) | Variants to show in grid |
|---|--------|---------------|--------|------------------------------------|---------------------------|
| 1 | Button | Primitives    | stable | `basic`, `variants`, `sizes`, `with-icon`, `loading`, `disabled` | variant × size matrix |
| 2 | Input  | Forms         | stable | `basic`, `sizes`, `invalid`, `disabled`, `with-addons`, `with-helper` | sizes + states |
| 3 | Textarea | Forms       | stable | `basic`, `autosize`, `with-counter`, `invalid` | states |
| 4 | Checkbox | Forms       | stable | `basic`, `checked`, `indeterminate`, `disabled`, `group` | states |
| 5 | Radio  | Forms         | stable | `basic`, `group`, `disabled` | states |
| 6 | Switch | Forms         | stable | `basic`, `sizes`, `disabled` | sizes + states |
| 7 | Select | Forms         | stable | `basic`, `grouped`, `disabled`, `invalid` | states |
| 8 | Combobox | Forms       | stable | `basic`, `async`, `multi`, `disabled` | states |
| 9 | Badge  | Feedback      | stable | `basic`, `variants`, `with-dot` | variant matrix |
| 10 | Alert | Feedback      | stable | `info`, `success`, `warning`, `error`, `with-action` | variant matrix |
| 11 | Card  | Data display  | stable | `basic`, `with-header`, `interactive`, `media` | layouts |
| 12 | Dialog | Overlay      | stable | `basic`, `confirm`, `with-form`, `sizes` | sizes |
| 13 | Tooltip | Overlay     | stable | `basic`, `placement`, `rich` | placements |
| 14 | DropdownMenu | Overlay | stable | `basic`, `with-icons`, `with-shortcuts`, `checkbox-radio` | variants |
| 15 | Tabs  | Navigation    | stable | `basic`, `vertical`, `with-icons`, `disabled` | orientations |
| 16 | Accordion | Data display | stable | `basic`, `multi`, `disabled` | states |
| 17 | Table | Data display  | stable | `basic`, `striped`, `compact` | density |
| 18 | DataTable | Data display | beta  | `basic`, `sortable`, `filterable`, `paginated` | features |

Every page follows the same MDX template (Task 13). The build must fail if any component in `packages/react/src/**` that is exported from `packages/react/src/index.ts` and listed in the public `exports` map in `packages/react/package.json` has no corresponding MDX page (Task 14).

---

## File structure (created under `packages/docs/`)

```
packages/docs/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── wrangler.toml
├── biome.jsonc                      # extends ../../biome.json
├── README.md                        # how to deploy to Cloudflare Pages (both modes)
├── .gitignore
├── public/
│   ├── _headers
│   ├── _redirects
│   ├── robots.txt
│   └── favicon.ico                  # symlinked / copied from /brand
├── scripts/
│   ├── generate-props.ts
│   ├── verify-component-pages.ts
│   └── build-changelog.ts
├── src/
│   ├── content/
│   │   ├── config.ts                # Content Collections schema
│   │   └── docs/
│   │       ├── index.mdx            # home
│   │       ├── getting-started/
│   │       ├── foundations/
│   │       ├── components/<slug>/{index.mdx, _examples/*.tsx}
│   │       ├── recipes/
│   │       └── changelog.mdx        # generated from packages/react/CHANGELOG.md
│   ├── components/
│   │   ├── Chrome/{TopBar,BrandLockup,VersionPill,SearchInput,ThemeSwitcher,GitHubLink}
│   │   ├── Sidebar/{Sidebar,SidebarSection}
│   │   ├── Toc/Toc.astro
│   │   ├── LivePreview/{LivePreview.astro, PreviewFrame.tsx}
│   │   ├── PropsTable.astro         # reads src/generated/props.json
│   │   ├── TokenTable.astro
│   │   ├── BundleSizePill.astro     # reads .size-limit.json
│   │   ├── StatusBadge.astro
│   │   └── CodeBlock.astro          # Shiki, github-dark-dimmed, copy button
│   ├── config/{sidebar.ts, site.ts}
│   ├── layouts/{BaseLayout.astro, DocLayout.astro}
│   ├── lib/{theme-init.ts, example-loader.ts, components-manifest.ts}
│   ├── pages/[...slug].astro
│   ├── styles/{site.css, fonts.css}
│   └── generated/props.json         # git-ignored
└── tests/{theme-init, props-generator, page-coverage}.test.ts
```

---

## Task 1: Add package to workspace and scaffold `package.json`

**Files:**
- Verify: `pnpm-workspace.yaml:1-2` (already has `packages: - "packages/*"` — no edit needed)
- Create: `packages/docs/package.json`
- Create: `packages/docs/.gitignore`
- Create: `packages/docs/README.md` (stub; extended in Task 17)
- Modify: root `package.json` scripts — add `"docs"` and `"docs:build"`

- [ ] **Step 1: Create `packages/docs/package.json`**

```json
{
  "name": "@arshad-shah/cynosure-docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "tsx scripts/verify-component-pages.ts && tsx scripts/build-changelog.ts && pnpm run generate:props && astro build && pnpm run build:search",
    "preview": "astro preview",
    "generate:props": "tsx scripts/generate-props.ts",
    "build:search": "pagefind --site dist",
    "check": "astro check && tsc --noEmit",
    "lint": "biome check .",
    "test": "vitest run --passWithNoTests",
    "clean": "rm -rf dist .astro node_modules/.astro src/generated"
  },
  "dependencies": {
    "@arshad-shah/cynosure-react": "workspace:*",
    "@arshad-shah/cynosure-themes": "workspace:*",
    "@arshad-shah/cynosure-tokens": "workspace:*",
    "@astrojs/check": "0.9.4",
    "@astrojs/mdx": "4.2.3",
    "@astrojs/react": "4.2.1",
    "@astrojs/sitemap": "3.2.1",
    "@fontsource-variable/geist": "catalog:",
    "@fontsource-variable/jetbrains-mono": "catalog:",
    "astro": "5.2.5",
    "glob": "catalog:",
    "pagefind": "1.3.0",
    "react": "catalog:",
    "react-dom": "catalog:",
    "shiki": "catalog:"
  },
  "devDependencies": {
    "@biomejs/biome": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "react-docgen-typescript": "2.2.2",
    "tsx": "4.19.2",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 2: Create `packages/docs/.gitignore`**

```
dist/
.astro/
src/generated/
node_modules/
.DS_Store
```

- [ ] **Step 3: Add docs aliases to root `package.json` `scripts`**

After `"dev": "turbo run dev --parallel",` add:

```
    "docs": "pnpm --filter @arshad-shah/cynosure-docs dev",
    "docs:build": "pnpm --filter @arshad-shah/cynosure-docs build",
```

- [ ] **Step 4: Install**

Run: `pnpm install`
Expected: workspace deps resolve, lockfile updates with no network errors.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/package.json packages/docs/.gitignore package.json pnpm-lock.yaml
git commit -m "feat(docs): scaffold @arshad-shah/cynosure-docs package"
```

---

## Task 2: Astro + TypeScript config

**Files:**
- Create: `packages/docs/astro.config.mjs`
- Create: `packages/docs/tsconfig.json`
- Create: `packages/docs/biome.jsonc`
- Create: `packages/docs/src/env.d.ts`

- [ ] **Step 1: `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

export default defineConfig({
  site: 'https://cynosure.arshadshah.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
  },
  vite: {
    resolve: {
      alias: {
        '@brand': resolve(repoRoot, 'brand'),
        '@docs-root': resolve(repoRoot, 'docs'),
        '@repo': repoRoot,
      },
    },
    ssr: {
      noExternal: ['@arshad-shah/cynosure-react', '@arshad-shah/cynosure-tokens', '@arshad-shah/cynosure-themes'],
    },
  },
});
```

- [ ] **Step 2: `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src", "scripts", "tests", ".astro/types.d.ts"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@brand/*": ["../../brand/*"],
      "@docs-root/*": ["../../docs/*"],
      "@repo/*": ["../../*"]
    },
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 3: `biome.jsonc`**

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "extends": ["../../biome.json"]
}
```

- [ ] **Step 4: `src/env.d.ts`**

```ts
/// <reference types="astro/client" />
declare module '*?raw' {
  const content: string;
  export default content;
}
declare module '*?url' {
  const url: string;
  export default url;
}
```

- [ ] **Step 5: Verify Astro boots**

Run: `pnpm --filter @arshad-shah/cynosure-docs exec astro info`
Expected: prints Astro 5.2.x; integrations include `@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`.

- [ ] **Step 6: Commit**

```bash
git add packages/docs/astro.config.mjs packages/docs/tsconfig.json packages/docs/biome.jsonc packages/docs/src/env.d.ts
git commit -m "feat(docs): add astro + typescript config"
```

---

## Task 3: Content collection schema

**Files:**
- Create: `packages/docs/src/content/config.ts`
- Create: `packages/docs/src/content/docs/index.mdx` (placeholder — replaced in Task 15)

- [ ] **Step 1: `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
    category: z.enum(['home', 'getting-started', 'foundations', 'components', 'recipes', 'changelog']),
    status: z.enum(['stable', 'beta', 'alpha', 'experimental', 'deprecated']).optional(),
    since: z.string().optional(),
    a11y: z.string().optional(),
    bundleSize: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { docs };
```

- [ ] **Step 2: Placeholder home**

`src/content/docs/index.mdx`:

```mdx
---
title: Cynosure
description: Tiny, accessible, themeable React components.
order: 0
category: home
---

# Cynosure

Placeholder — the real home is built in Task 15.
```

- [ ] **Step 3: Verify**

Run: `pnpm --filter @arshad-shah/cynosure-docs check`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/content
git commit -m "feat(docs): define docs content collection schema"
```

---

## Task 4: Theme pre-paint script + fonts

**Files:**
- Create: `packages/docs/src/lib/theme-init.ts`
- Create: `packages/docs/src/styles/fonts.css`
- Create: `packages/docs/src/styles/site.css` (stub — chrome rules added in Task 8)
- Create: `packages/docs/tests/theme-init.test.ts`

- [ ] **Step 1: `src/lib/theme-init.ts`**

```ts
export const THEMES = ['light', 'dark', 'terminal', 'high-contrast'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_STORAGE_KEY = 'cynosure-docs-theme';

export function getThemeInitScript(): string {
  return `(() => {
    try {
      const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = stored || sys;
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    } catch (_) {}
  })();`;
}
```

- [ ] **Step 2: `src/styles/fonts.css`**

```css
@import '@fontsource-variable/geist/index.css';
@import '@fontsource-variable/jetbrains-mono/index.css';
```

- [ ] **Step 3: `src/styles/site.css`**

```css
@import '@arshad-shah/cynosure-tokens/css';
@import '@arshad-shah/cynosure-react/styles.css';
@import './fonts.css';

:root { font-family: 'Geist Variable', ui-sans-serif, system-ui, sans-serif; }
code, pre, kbd { font-family: 'JetBrains Mono Variable', ui-monospace, monospace; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0ms !important; transition-duration: 0ms !important; }
}
```

- [ ] **Step 4: Failing test**

`packages/docs/tests/theme-init.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getThemeInitScript, THEMES, THEME_STORAGE_KEY } from '../src/lib/theme-init';

describe('theme-init', () => {
  it('returns an IIFE string', () => {
    const s = getThemeInitScript();
    expect(s.startsWith('(() => {')).toBe(true);
    expect(s.trim().endsWith('})();')).toBe(true);
    expect(s).toContain(THEME_STORAGE_KEY);
  });
  it('enumerates four themes', () => {
    expect(THEMES).toEqual(['light', 'dark', 'terminal', 'high-contrast']);
  });
});
```

Run: `pnpm --filter @arshad-shah/cynosure-docs test`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/lib/theme-init.ts packages/docs/src/styles packages/docs/tests/theme-init.test.ts
git commit -m "feat(docs): add theme pre-paint script and font/style scaffolding"
```

---

## Task 5: Props generator

**Files:**
- Create: `packages/docs/scripts/generate-props.ts`
- Create: `packages/docs/tests/props-generator.test.ts`

- [ ] **Step 1: Write failing test first**

```ts
import { describe, it, expect } from 'vitest';
import { extractProps } from '../scripts/generate-props';
import { resolve } from 'node:path';

const REACT_TSCONFIG = resolve(__dirname, '../../react/tsconfig.json');
const REACT_SRC = resolve(__dirname, '../../react/src');

describe('extractProps', () => {
  it('returns an entry for Button with expected prop fields', () => {
    const result = extractProps({ tsconfigPath: REACT_TSCONFIG, sourceRoot: REACT_SRC });
    const btn = result['Button'];
    expect(btn).toBeDefined();
    expect(Array.isArray(btn.props)).toBe(true);
    const names = btn.props.map((p) => p.name);
    expect(names).toContain('variant');
    expect(names).toContain('size');
    for (const p of btn.props) {
      expect(typeof p.name).toBe('string');
      expect(typeof p.type).toBe('string');
      expect(typeof p.required).toBe('boolean');
    }
  });
});
```

Run: `pnpm --filter @arshad-shah/cynosure-docs test props-generator`
Expected: FAIL — module not found.

- [ ] **Step 2: Implement `scripts/generate-props.ts`**

```ts
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withCustomConfig } from 'react-docgen-typescript';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const DEFAULT_TSCONFIG = resolve(REPO_ROOT, 'packages/react/tsconfig.json');
const DEFAULT_SRC = resolve(REPO_ROOT, 'packages/react/src');

export interface PropRecord {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue: string | null;
}
export interface ComponentRecord {
  name: string;
  description: string;
  filePath: string;
  props: PropRecord[];
}

export function extractProps(opts: { tsconfigPath: string; sourceRoot: string }): Record<string, ComponentRecord> {
  const parser = withCustomConfig(opts.tsconfigPath, {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (p) => !p.parent || !/node_modules/.test(p.parent.fileName),
  });
  const files = glob.sync('**/*.tsx', {
    cwd: opts.sourceRoot,
    ignore: ['**/*.test.tsx', '**/*.stories.tsx', '**/__tests__/**', '**/_examples/**'],
    absolute: true,
  });
  const out: Record<string, ComponentRecord> = {};
  for (const file of files) {
    const components = parser.parse(file);
    for (const c of components) {
      if (out[c.displayName]) continue;
      out[c.displayName] = {
        name: c.displayName,
        description: c.description ?? '',
        filePath: file.replace(`${REPO_ROOT}/`, ''),
        props: Object.entries(c.props).map(([name, p]) => ({
          name,
          type: p.type?.name ?? 'unknown',
          description: p.description ?? '',
          required: p.required ?? false,
          defaultValue: p.defaultValue?.value ?? null,
        })),
      };
    }
  }
  return out;
}

async function main() {
  const records = extractProps({ tsconfigPath: DEFAULT_TSCONFIG, sourceRoot: DEFAULT_SRC });
  const outPath = resolve(PKG_ROOT, 'src/generated/props.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(records, null, 2), 'utf8');
  console.log(`Wrote ${Object.keys(records).length} components to ${outPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 3: Run tests**

Run: `pnpm --filter @arshad-shah/cynosure-docs test props-generator`
Expected: PASS.

- [ ] **Step 4: Run generator end-to-end**

Run: `pnpm --filter @arshad-shah/cynosure-docs generate:props`
Expected: `src/generated/props.json` exists with ≥ 50 component records.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/scripts/generate-props.ts packages/docs/tests/props-generator.test.ts
git commit -m "feat(docs): add react-docgen-typescript props generator"
```

---

## Task 6: Example loader

**Files:**
- Create: `packages/docs/src/lib/example-loader.ts`

- [ ] **Step 1: Implement**

```ts
import type { ComponentType } from 'react';

type ExampleModule = { default: ComponentType };

const modules = import.meta.glob<ExampleModule>(
  '../content/docs/components/**/_examples/*.tsx',
  { eager: true },
);
const sources = import.meta.glob<string>(
  '../content/docs/components/**/_examples/*.tsx',
  { eager: true, query: '?raw', import: 'default' },
);

export interface Example {
  component: ComponentType;
  source: string;
  slug: string;
}

function keyToSlug(key: string): string {
  const m = key.match(/components\/([^/]+)\/_examples\/([^.]+)\.tsx$/);
  if (!m) throw new Error(`Unexpected example path: ${key}`);
  return `${m[1]}/${m[2]}`;
}

const bySlug = new Map<string, Example>();
for (const [key, mod] of Object.entries(modules)) {
  const source = sources[key];
  if (!source) throw new Error(`Missing raw source for ${key}`);
  bySlug.set(keyToSlug(key), { component: mod.default, source, slug: keyToSlug(key) });
}

export function getExample(slug: string): Example {
  const ex = bySlug.get(slug);
  if (!ex) throw new Error(`Example not found: ${slug}. Available: ${[...bySlug.keys()].join(', ')}`);
  return ex;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/lib/example-loader.ts
git commit -m "feat(docs): add example module + raw-source loader"
```

---

## Task 7: LivePreview, PropsTable, CodeBlock

**Files:**
- Create: `packages/docs/src/components/LivePreview/PreviewFrame.tsx`
- Create: `packages/docs/src/components/LivePreview/LivePreview.astro`
- Create: `packages/docs/src/components/CodeBlock.astro`
- Create: `packages/docs/src/components/PropsTable.astro`
- Create: `packages/docs/src/components/StatusBadge.astro`
- Create: `packages/docs/src/components/BundleSizePill.astro`

- [ ] **Step 1: `PreviewFrame.tsx`**

```tsx
import { useState, type ReactNode } from 'react';

interface Props { children: ReactNode; source: string; slug: string }

export default function PreviewFrame({ children, source, slug }: Props) {
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div data-live-preview>
      <div data-live-preview-frame key={key}>{children}</div>
      <div data-live-preview-controls>
        <button type="button" onClick={onCopy}>{copied ? 'Copied' : 'Copy'}</button>
        <button type="button" onClick={() => setKey((k) => k + 1)}>Reset</button>
        <a href={`/preview/${slug}`} target="_blank" rel="noreferrer">Open</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `LivePreview.astro`**

```astro
---
import { getExample } from '../../lib/example-loader';
import PreviewFrame from './PreviewFrame.tsx';
import CodeBlock from '../CodeBlock.astro';
interface Props { example: string }
const { example } = Astro.props;
const { component: Example, source, slug } = getExample(example);
---
<PreviewFrame client:visible source={source} slug={slug}>
  <Example client:visible />
</PreviewFrame>
<CodeBlock code={source} lang="tsx" />
```

- [ ] **Step 3: `CodeBlock.astro`** — Shiki rendered server-side (`set:html` is safe here because `codeToHtml` escapes the input); the copy button uses `textContent`, not innerHTML.

```astro
---
import { codeToHtml } from 'shiki';
interface Props { code: string; lang?: string }
const { code, lang = 'tsx' } = Astro.props;
const html = await codeToHtml(code, { lang, theme: 'github-dark-dimmed' });
---
<div data-code-block>
  <button type="button" data-copy-btn data-code={code} aria-label="Copy code">Copy</button>
  <Fragment set:html={html} />
</div>
<script>
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-copy-btn]')) {
    btn.addEventListener('click', async () => {
      const code = btn.dataset.code ?? '';
      await navigator.clipboard.writeText(code);
      const prev = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = prev; }, 1500);
    });
  }
</script>
```

- [ ] **Step 4: `PropsTable.astro`**

```astro
---
import props from '../generated/props.json';
interface Props { component: string }
const { component } = Astro.props;
const record = (props as Record<string, { props: { name: string; type: string; description: string; required: boolean; defaultValue: string | null }[] }>)[component];
if (!record) throw new Error(`PropsTable: component "${component}" not found in props.json. Run 'pnpm generate:props'.`);
---
<table data-props-table>
  <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Required</th><th>Description</th></tr></thead>
  <tbody>
    {record.props.map((p) => (
      <tr>
        <td><code>{p.name}</code></td>
        <td><code>{p.type}</code></td>
        <td>{p.defaultValue ? <code>{p.defaultValue}</code> : '—'}</td>
        <td>{p.required ? 'yes' : 'no'}</td>
        <td>{p.description}</td>
      </tr>
    ))}
  </tbody>
</table>
```

- [ ] **Step 5: `StatusBadge.astro`**

```astro
---
interface Props { status: 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated' }
const { status } = Astro.props;
---
<span data-status-badge data-status={status}>{status}</span>
```

- [ ] **Step 6: `BundleSizePill.astro`**

```astro
---
import sizeLimit from '@repo/.size-limit.json';
interface Props { name: string }
const { name } = Astro.props;
const entry = (sizeLimit as { name: string; limit: string }[]).find((e) => e.name === name);
---
{entry ? <span data-bundle-size>{entry.limit}</span> : null}
```

- [ ] **Step 7: Commit**

```bash
git add packages/docs/src/components
git commit -m "feat(docs): add LivePreview, CodeBlock, PropsTable, StatusBadge, BundleSizePill"
```

---

## Task 8: Chrome — TopBar, Sidebar, Toc, ThemeSwitcher, BrandLockup, Search

**Files:**
- Create: `packages/docs/src/config/site.ts`
- Create: `packages/docs/src/config/sidebar.ts`
- Create: `packages/docs/src/components/Chrome/BrandLockup.astro`
- Create: `packages/docs/src/components/Chrome/VersionPill.astro`
- Create: `packages/docs/src/components/Chrome/ThemeSwitcher.tsx`
- Create: `packages/docs/src/components/Chrome/SearchInput.astro`
- Create: `packages/docs/src/components/Chrome/GitHubLink.astro`
- Create: `packages/docs/src/components/Chrome/TopBar.astro`
- Create: `packages/docs/src/components/Sidebar/Sidebar.astro`
- Create: `packages/docs/src/components/Sidebar/SidebarSection.astro`
- Create: `packages/docs/src/components/Toc/Toc.astro`
- Extend: `packages/docs/src/styles/site.css`

- [ ] **Step 1: `src/config/site.ts`**

```ts
import reactPkg from '@arshad-shah/cynosure-react/package.json' with { type: 'json' };
export const site = {
  name: 'Cynosure',
  description: 'Tiny, accessible, themeable React components.',
  url: 'https://cynosure.arshadshah.com',
  github: 'https://github.com/arshad-shah/cynosure',
  version: (reactPkg as { version: string }).version,
};
```

- [ ] **Step 2: `src/config/sidebar.ts`**

```ts
export interface SidebarLink { title: string; href: string; status?: 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated' }
export interface SidebarSection { title: string; links: SidebarLink[] }
export const sidebar: SidebarSection[] = [
  { title: 'Getting started', links: [
    { title: 'Introduction', href: '/getting-started/introduction' },
    { title: 'Installation', href: '/getting-started/installation' },
    { title: 'Quickstart', href: '/getting-started/quickstart' },
    { title: 'RSC', href: '/getting-started/rsc' },
    { title: 'RTL', href: '/getting-started/rtl' },
  ]},
  { title: 'Foundations', links: [
    { title: 'Design principles', href: '/foundations/design-principles' },
    { title: 'Design tokens', href: '/foundations/design-tokens' },
    { title: 'Theming overview', href: '/foundations/theming-overview' },
    { title: 'Dark mode', href: '/foundations/dark-mode' },
    { title: 'Custom themes', href: '/foundations/custom-themes' },
    { title: 'Terminal theme recipe', href: '/foundations/terminal-theme-recipe' },
    { title: 'Accessibility', href: '/foundations/accessibility' },
  ]},
  { title: 'Components — Primitives', links: [ { title: 'Button', href: '/components/button', status: 'stable' } ]},
  { title: 'Components — Forms', links: [
    { title: 'Input', href: '/components/input', status: 'stable' },
    { title: 'Textarea', href: '/components/textarea', status: 'stable' },
    { title: 'Checkbox', href: '/components/checkbox', status: 'stable' },
    { title: 'Radio', href: '/components/radio', status: 'stable' },
    { title: 'Switch', href: '/components/switch', status: 'stable' },
    { title: 'Select', href: '/components/select', status: 'stable' },
    { title: 'Combobox', href: '/components/combobox', status: 'stable' },
  ]},
  { title: 'Components — Feedback', links: [
    { title: 'Badge', href: '/components/badge', status: 'stable' },
    { title: 'Alert', href: '/components/alert', status: 'stable' },
  ]},
  { title: 'Components — Overlays', links: [
    { title: 'Dialog', href: '/components/dialog', status: 'stable' },
    { title: 'Tooltip', href: '/components/tooltip', status: 'stable' },
    { title: 'DropdownMenu', href: '/components/dropdown-menu', status: 'stable' },
  ]},
  { title: 'Components — Navigation', links: [ { title: 'Tabs', href: '/components/tabs', status: 'stable' } ]},
  { title: 'Components — Data display', links: [
    { title: 'Card', href: '/components/card', status: 'stable' },
    { title: 'Accordion', href: '/components/accordion', status: 'stable' },
    { title: 'Table', href: '/components/table', status: 'stable' },
    { title: 'DataTable', href: '/components/data-table', status: 'beta' },
  ]},
  { title: 'Recipes', links: [
    { title: 'Index', href: '/recipes' },
    { title: 'Command palette', href: '/recipes/command-palette' },
    { title: 'Dashboard layout', href: '/recipes/dashboard-layout' },
    { title: 'Data table with filters', href: '/recipes/data-table-with-filters' },
    { title: 'Login form', href: '/recipes/login-form' },
    { title: 'Multi-step wizard', href: '/recipes/multi-step-wizard' },
    { title: 'Notification center', href: '/recipes/notification-center' },
    { title: 'Onboarding modal', href: '/recipes/onboarding-modal' },
    { title: 'Settings page', href: '/recipes/settings-page' },
  ]},
  { title: 'Changelog', links: [ { title: 'Releases', href: '/changelog' } ]},
];
```

- [ ] **Step 3: `BrandLockup.astro`**

```astro
---
import mark from '@brand/cynosure-mark.svg?url';
---
<a href="/" data-brand-lockup aria-label="Cynosure home">
  <img src={mark} width="28" height="28" alt="" />
  <span>Cynosure</span>
</a>
```

- [ ] **Step 4: `VersionPill.astro`**

```astro
---
import { site } from '../../config/site';
---
<a href="/changelog" data-version-pill>v{site.version}</a>
```

- [ ] **Step 5: `ThemeSwitcher.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { THEMES, THEME_STORAGE_KEY, type Theme } from '../../lib/theme-init';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    const t = (document.documentElement.getAttribute('data-theme') as Theme) || 'light';
    setTheme(t);
  }, []);
  const apply = (t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t === 'light' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, t);
  };
  return (
    <label data-theme-switcher>
      <span className="visually-hidden">Theme</span>
      <select value={theme} onChange={(e) => apply(e.target.value as Theme)}>
        {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </label>
  );
}
```

- [ ] **Step 6: `SearchInput.astro`** — Pagefind client. **No `innerHTML`.** Build DOM nodes safely with `createElement`/`textContent`.

```astro
<div data-search>
  <input type="search" id="search" placeholder="Search docs…  ⌘K" autocomplete="off" />
  <div id="search-results" role="listbox" hidden></div>
</div>
<script>
  interface PagefindResult { url: string; meta: { title: string }; excerpt: string }
  interface PagefindModule { search(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] }> }

  const input = document.getElementById('search') as HTMLInputElement;
  const results = document.getElementById('search-results') as HTMLDivElement;

  function renderResults(items: PagefindResult[]): void {
    while (results.firstChild) results.removeChild(results.firstChild);
    for (const item of items) {
      const a = document.createElement('a');
      a.href = item.url;
      a.setAttribute('role', 'option');
      const title = document.createElement('strong');
      title.textContent = item.meta.title ?? item.url;
      const excerpt = document.createElement('p');
      excerpt.textContent = item.excerpt.replace(/<[^>]+>/g, ''); // strip Pagefind mark tags — plain text only
      a.appendChild(title);
      a.appendChild(excerpt);
      results.appendChild(a);
    }
  }

  // Pagefind bundle is emitted by the build step.
  // @ts-expect-error dynamic URL import at runtime
  const pagefind = (await import('/pagefind/pagefind.js')) as PagefindModule;

  input.addEventListener('input', async () => {
    const q = input.value.trim();
    if (!q) { results.hidden = true; while (results.firstChild) results.removeChild(results.firstChild); return; }
    const search = await pagefind.search(q);
    const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
    results.hidden = false;
    renderResults(items);
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); }
  });
</script>
```

- [ ] **Step 7: `GitHubLink.astro`**

```astro
---
import { site } from '../../config/site';
---
<a href={site.github} target="_blank" rel="noreferrer" aria-label="GitHub repository">GitHub</a>
```

- [ ] **Step 8: `TopBar.astro`**

```astro
---
import BrandLockup from './BrandLockup.astro';
import VersionPill from './VersionPill.astro';
import SearchInput from './SearchInput.astro';
import ThemeSwitcher from './ThemeSwitcher.tsx';
import GitHubLink from './GitHubLink.astro';
---
<header data-topbar>
  <BrandLockup />
  <VersionPill />
  <SearchInput />
  <ThemeSwitcher client:load />
  <GitHubLink />
</header>
```

- [ ] **Step 9: `Sidebar.astro` + `SidebarSection.astro`**

`Sidebar.astro`:
```astro
---
import { sidebar } from '../../config/sidebar';
import SidebarSection from './SidebarSection.astro';
const current = Astro.url.pathname.replace(/\/$/, '');
---
<aside data-sidebar>
  {sidebar.map((s) => <SidebarSection section={s} current={current} />)}
</aside>
```

`SidebarSection.astro`:
```astro
---
import type { SidebarSection } from '../../config/sidebar';
interface Props { section: SidebarSection; current: string }
const { section, current } = Astro.props;
---
<details open>
  <summary>{section.title}</summary>
  <ul>
    {section.links.map((l) => (
      <li data-current={current === l.href ? '' : undefined}>
        <a href={l.href}>{l.title}</a>
        {l.status ? <span data-status={l.status}>{l.status}</span> : null}
      </li>
    ))}
  </ul>
</details>
```

- [ ] **Step 10: `Toc/Toc.astro`** — TOC + scrollspy via IntersectionObserver; no innerHTML.

```astro
---
import type { MarkdownHeading } from 'astro';
interface Props { headings: MarkdownHeading[] }
const { headings } = Astro.props;
const filtered = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
---
<nav data-toc aria-label="On this page">
  <p>On this page</p>
  <ul>
    {filtered.map((h) => (
      <li data-depth={h.depth}><a href={`#${h.slug}`}>{h.text}</a></li>
    ))}
  </ul>
</nav>
<script>
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-toc] a');
  const targets = [...links].map((a) => document.getElementById(a.hash.slice(1))).filter((x): x is HTMLElement => x !== null);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const link = [...links].find((a) => a.hash === `#${e.target.id}`);
      if (!link) continue;
      if (e.isIntersecting) link.setAttribute('data-active', ''); else link.removeAttribute('data-active');
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  for (const t of targets) io.observe(t);
</script>
```

- [ ] **Step 11: Extend `site.css`** with chrome layout (CSS grid `topbar / [sidebar main toc]`). Tokens only — `var(--color-bg)`, `var(--color-fg)`, `var(--color-border)`, `var(--space-*)`, `var(--radius-*)`, `var(--font-sans)`. Add `.visually-hidden` utility. No raw hex.

- [ ] **Step 12: Commit**

```bash
git add packages/docs/src/config packages/docs/src/components/Chrome packages/docs/src/components/Sidebar packages/docs/src/components/Toc packages/docs/src/styles/site.css
git commit -m "feat(docs): add top bar, sidebar, TOC, theme switcher, search"
```

---

## Task 9: Layouts + dynamic route + brand asset wiring

**Files:**
- Create: `packages/docs/src/layouts/BaseLayout.astro`
- Create: `packages/docs/src/layouts/DocLayout.astro`
- Create: `packages/docs/src/pages/[...slug].astro`
- Create: symlinks in `packages/docs/public/`

- [ ] **Step 1: `BaseLayout.astro`**

```astro
---
import { getThemeInitScript } from '../lib/theme-init';
import '../styles/site.css';
import { site } from '../config/site';
interface Props { title: string; description: string }
const { title, description } = Astro.props;
const initScript = getThemeInitScript();
---
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — {site.name}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:image" content="/og-image.png" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <script is:inline set:html={initScript}></script>
  </head>
  <body><slot /></body>
</html>
```

- [ ] **Step 2: `DocLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import TopBar from '../components/Chrome/TopBar.astro';
import Sidebar from '../components/Sidebar/Sidebar.astro';
import Toc from '../components/Toc/Toc.astro';
import type { MarkdownHeading } from 'astro';
interface Props { title: string; description: string; headings: MarkdownHeading[] }
const { title, description, headings } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <TopBar />
  <div data-doc-layout>
    <Sidebar />
    <main><slot /></main>
    <Toc headings={headings} />
  </div>
</BaseLayout>
```

- [ ] **Step 3: `pages/[...slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import DocLayout from '../layouts/DocLayout.astro';
export async function getStaticPaths() {
  const entries = await getCollection('docs');
  return entries.map((entry) => ({
    params: { slug: entry.slug === 'index' ? undefined : entry.slug },
    props: { entry },
  }));
}
interface Props { entry: CollectionEntry<'docs'> }
const { entry } = Astro.props;
const { Content, headings } = await entry.render();
---
<DocLayout title={entry.data.title} description={entry.data.description} headings={headings}>
  <article>
    <h1>{entry.data.title}</h1>
    <p>{entry.data.description}</p>
    <Content />
  </article>
</DocLayout>
```

- [ ] **Step 4: Wire brand assets** (run once, from repo root):

```bash
mkdir -p packages/docs/public
ln -sf ../../../brand/favicon.ico packages/docs/public/favicon.ico
ln -sf ../../../brand/apple-touch-icon.png packages/docs/public/apple-touch-icon.png
ln -sf ../../../brand/og-image.png packages/docs/public/og-image.png
```

- [ ] **Step 5: Smoke-build**

Run: `pnpm --filter @arshad-shah/cynosure-docs dev`
Open `http://localhost:4321/`. Expected: placeholder home renders with topbar + sidebar + empty article.

- [ ] **Step 6: Commit**

```bash
git add packages/docs/src/layouts packages/docs/src/pages packages/docs/public
git commit -m "feat(docs): add base/doc layouts, dynamic docs route, brand asset wiring"
```

---

## Task 10: Components manifest + page-coverage test

**Files:**
- Create: `packages/docs/src/lib/components-manifest.ts`
- Create: `packages/docs/scripts/verify-component-pages.ts`
- Create: `packages/docs/scripts/component-page-allowlist.json`
- Create: `packages/docs/tests/page-coverage.test.ts`

- [ ] **Step 1: `components-manifest.ts`**

```ts
export const EXPECTED_COMPONENT_SLUGS = [
  'button', 'input', 'textarea', 'checkbox', 'radio', 'switch', 'select', 'combobox',
  'badge', 'alert', 'card', 'dialog', 'tooltip', 'dropdown-menu', 'tabs',
  'accordion', 'table', 'data-table',
] as const;
export type ComponentSlug = (typeof EXPECTED_COMPONENT_SLUGS)[number];
```

- [ ] **Step 2: Failing coverage test**

```ts
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { EXPECTED_COMPONENT_SLUGS } from '../src/lib/components-manifest';

describe('component page coverage', () => {
  for (const slug of EXPECTED_COMPONENT_SLUGS) {
    it(`has an MDX page for ${slug}`, () => {
      const p = resolve(__dirname, `../src/content/docs/components/${slug}/index.mdx`);
      expect(existsSync(p), `missing ${p}`).toBe(true);
    });
  }
});
```

Run: `pnpm --filter @arshad-shah/cynosure-docs test page-coverage`
Expected: FAIL (no component pages yet).

- [ ] **Step 3: `verify-component-pages.ts`**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED_COMPONENT_SLUGS } from '../src/lib/components-manifest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPO = resolve(ROOT, '../..');

const allowlist: string[] = JSON.parse(
  readFileSync(resolve(__dirname, 'component-page-allowlist.json'), 'utf8'),
);

const missing: string[] = [];
for (const slug of EXPECTED_COMPONENT_SLUGS) {
  const p = resolve(ROOT, `src/content/docs/components/${slug}/index.mdx`);
  if (!existsSync(p)) missing.push(slug);
}

// Check exports keys for components without pages (beyond the 18).
const reactPkg = JSON.parse(readFileSync(resolve(REPO, 'packages/react/package.json'), 'utf8')) as { exports: Record<string, unknown> };
const NON_COMPONENT_KEYS = new Set([
  '.', './package.json', './styles.css', './all.css', './theme',
  './forms', './overlay', './navigation', './data-display', './feedback',
]);
const undocumented: string[] = [];
for (const key of Object.keys(reactPkg.exports)) {
  if (NON_COMPONENT_KEYS.has(key)) continue;
  const slug = key.replace(/^\.\//, '');
  if ((EXPECTED_COMPONENT_SLUGS as readonly string[]).includes(slug)) continue;
  if (allowlist.includes(slug)) continue;
  const p = resolve(ROOT, `src/content/docs/components/${slug}/index.mdx`);
  if (!existsSync(p)) undocumented.push(slug);
}

if (missing.length > 0 || undocumented.length > 0) {
  if (missing.length) console.error(`Missing required component pages:\n${missing.map((s) => ` - components/${s}/index.mdx`).join('\n')}`);
  if (undocumented.length) console.error(`Exported components with no docs page and not in allowlist:\n${undocumented.map((s) => ` - ${s}`).join('\n')}`);
  process.exit(1);
}
console.log(`All required component pages present; ${allowlist.length} entries allowlisted.`);
```

- [ ] **Step 4: `component-page-allowlist.json`** — seed with every currently-exported component slug that is not in `EXPECTED_COMPONENT_SLUGS`. Generate by running:

```sh
node -e "const p=require('./packages/react/package.json'); const skip=new Set(['.', './package.json','./styles.css','./all.css','./theme','./forms','./overlay','./navigation','./data-display','./feedback']); const expected=new Set(['button','input','textarea','checkbox','radio','switch','select','combobox','badge','alert','card','dialog','tooltip','dropdown-menu','tabs','accordion','table','data-table']); console.log(JSON.stringify(Object.keys(p.exports).filter(k=>!skip.has(k)).map(k=>k.replace(/^\.\//, '')).filter(s=>!expected.has(s)).sort(), null, 2))" > packages/docs/scripts/component-page-allowlist.json
```

- [ ] **Step 5: Commit (tests still fail — the 18 pages are built in Task 13)**

```bash
git add packages/docs/src/lib/components-manifest.ts packages/docs/scripts/verify-component-pages.ts packages/docs/scripts/component-page-allowlist.json packages/docs/tests/page-coverage.test.ts
git commit -m "feat(docs): add component page coverage check"
```

---

## Task 11: Getting-started + foundations content

Create 12 MDX files copying prose from `/docs/foundations/*.mdx` + `/docs/getting-started/*.mdx`, normalizing frontmatter to the collection schema.

**Files (each file → one step, `feat(docs): add <section>/<name> page` commit):**
- `src/content/docs/getting-started/{introduction,installation,quickstart,rsc,rtl}.mdx`
- `src/content/docs/foundations/{design-principles,design-tokens,theming-overview,dark-mode,custom-themes,terminal-theme-recipe,accessibility}.mdx`

- [ ] **Step 1: Pattern** — for each file, use this frontmatter shape and copy the body from the existing doc:

```mdx
---
title: "<Page title>"
description: "<One-line summary pulled from the existing file's first paragraph>"
order: <integer — 1..N within section>
category: <getting-started | foundations>
---

<body copied from /docs/<section>/<file>.mdx>
```

For `foundations/design-tokens.mdx`, add after the intro:

```mdx
import TokenTable from '@/components/TokenTable.astro';

## Color

<TokenTable group="color" />

## Spacing

<TokenTable group="space" />

## Radii

<TokenTable group="radius" />
```

For `getting-started/installation.mdx`, render framework tabs (Next App, Next Pages, Vite, Remix, CRA) as a `<Tabs>` React island using `@arshad-shah/cynosure-react`:

```mdx
import { Tabs } from '@arshad-shah/cynosure-react';

<Tabs client:visible defaultValue="next-app">
  <Tabs.List>
    <Tabs.Trigger value="next-app">Next (App)</Tabs.Trigger>
    <Tabs.Trigger value="next-pages">Next (Pages)</Tabs.Trigger>
    <Tabs.Trigger value="vite">Vite</Tabs.Trigger>
    <Tabs.Trigger value="remix">Remix</Tabs.Trigger>
    <Tabs.Trigger value="cra">CRA</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="next-app">...code...</Tabs.Panel>
  ...
</Tabs>
```

(Read `packages/react/src/navigation/Tabs/Tabs.tsx` to confirm the exact compound-component API before copying this snippet into MDX.)

- [ ] **Step 2: Build + verify routes**

Run: `pnpm --filter @arshad-shah/cynosure-docs build`
Expected: each of the 12 pages lands at its slug in `dist/`.

- [ ] **Step 3: Commit (12 small commits or one grouped commit at executor's discretion).**

---

## Task 12: Token table

**Files:**
- Create: `packages/docs/src/components/TokenTable.astro`

- [ ] **Step 1: Inspect token package**

Run: `ls packages/tokens/dist && cat packages/tokens/package.json | head -40`
Confirm how tokens are exposed (JSON export, CSS custom props, TS object). Use whichever is the public supported import.

- [ ] **Step 2: Implement `TokenTable.astro`** (JSON shape shown; adapt to actual export):

```astro
---
import tokens from '@arshad-shah/cynosure-tokens/tokens.json' with { type: 'json' };
interface Props { group: 'color' | 'space' | 'radius' | 'font' | 'shadow' | 'z' }
const { group } = Astro.props;
const rows = Object.entries((tokens as Record<string, Record<string, string>>)[group] ?? {});
if (rows.length === 0) throw new Error(`TokenTable: unknown group "${group}"`);
---
<table data-token-table>
  <thead><tr><th>Token</th><th>Value</th><th>Preview</th></tr></thead>
  <tbody>
    {rows.map(([name, value]) => (
      <tr>
        <td><code>--{group}-{name}</code></td>
        <td><code>{value}</code></td>
        <td>{group === 'color' ? <span data-swatch style={`background:${value}`}></span> : null}</td>
      </tr>
    ))}
  </tbody>
</table>
```

If `tokens.json` is not a public export, import the generated TS object from `@arshad-shah/cynosure-tokens` directly (e.g. `import { tokens } from '@arshad-shah/cynosure-tokens'`) and adapt the iteration.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/TokenTable.astro
git commit -m "feat(docs): add TokenTable component"
```

---

## Task 13: Component-page template (Button — canonical)

Implement **Button** in full. Tasks 13a–r replay this template for each remaining component.

**Files:**
- Create: `src/content/docs/components/button/index.mdx`
- Create: `src/content/docs/components/button/_examples/{basic,variants,sizes,with-icon,loading,disabled}.tsx`

- [ ] **Step 1: Read source** — `packages/react/src/primitives/Button/Button.tsx` — confirm variant names, size names, all props.

- [ ] **Step 2: Example files**

`basic.tsx`:
```tsx
import { Button } from '@arshad-shah/cynosure-react';
export default function Example() { return <Button>Click me</Button>; }
```

`variants.tsx`:
```tsx
import { Button } from '@arshad-shah/cynosure-react';
export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

`sizes.tsx`:
```tsx
import { Button } from '@arshad-shah/cynosure-react';
export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
```

`with-icon.tsx`, `loading.tsx`, `disabled.tsx`: analogous minimal examples. Write each using only props confirmed in Step 1. If Step 1 reveals different variant names (e.g. `primary` instead of `solid`), use those.

- [ ] **Step 3: `index.mdx`**

```mdx
---
title: Button
description: Trigger an action. Built on native <button>; fully keyboard + screen-reader accessible.
order: 1
category: components
status: stable
since: 0.1.0
a11y: Uses native <button>; supports disabled, aria-busy during loading; focus ring honors tokens.
bundleSize: "6 kB"
tags: [primitive, action]
---
import LivePreview from '@/components/LivePreview/LivePreview.astro';
import PropsTable from '@/components/PropsTable.astro';
import StatusBadge from '@/components/StatusBadge.astro';
import BundleSizePill from '@/components/BundleSizePill.astro';

<div><StatusBadge status="stable" /> <BundleSizePill name="Button" /></div>

<LivePreview example="button/basic" />

## Usage

<LivePreview example="button/basic" />

## Variants

<LivePreview example="button/variants" />
<LivePreview example="button/sizes" />
<LivePreview example="button/with-icon" />
<LivePreview example="button/loading" />
<LivePreview example="button/disabled" />

## API

<PropsTable component="Button" />

## Accessibility

- Rendered as a native `<button>` — inherits all ARIA semantics for free.
- `loading` sets `aria-busy="true"`; the text is still announced.
- Focus outline uses `var(--focus-ring)`; never removed.

## Recipes

- Pair with `<Tooltip>` when the label is icon-only.
- Use `variant="ghost"` inside toolbars to reduce visual weight.
```

- [ ] **Step 4: Build + preview**

Run: `pnpm --filter @arshad-shah/cynosure-docs dev`
Open: `http://localhost:4321/components/button`
Verify: hero preview mounts a real Button; variants render; props table populated from `props.json`; copy button works.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/content/docs/components/button
git commit -m "feat(docs): add Button page"
```

---

## Task 13a–13r: Remaining 17 component pages

For each of the 17 components in the table at the top, replicate Task 13 **exactly**:

1. Read `packages/react/src/**/<Component>.tsx` — note exact prop names, required props, variants, sizes.
2. Create every `_examples/*.tsx` listed in the table. Each example imports the real component from `@arshad-shah/cynosure-react`.
3. Create `index.mdx` with frontmatter (title, description, order, `category: components`, status, since, a11y, `bundleSize` looked up from `/.size-limit.json`, tags) and the same sections: hero `<LivePreview>`, `## Usage`, `## Variants` (one `<LivePreview>` per variants example), `## API` with `<PropsTable component="<Name>" />`, `## Accessibility`, `## Recipes`.
4. Verify in dev: preview renders, copy works, props table populated (if empty, re-run `pnpm generate:props` — the component's types may have landed after the last run).
5. Commit per component: `feat(docs): add <Name> page`.

**Execution order:**

- 13a Input → 13b Textarea → 13c Checkbox → 13d Radio → 13e Switch → 13f Select → 13g Combobox
- 13h Badge → 13i Alert
- 13j Card
- 13k Dialog (example must start closed; provide a trigger `<Button>` that opens it; mark `client:visible`)
- 13l Tooltip → 13m DropdownMenu
- 13n Tabs
- 13o Accordion → 13p Table → 13q DataTable (`status: beta`)
- 13r After last, run: `pnpm --filter @arshad-shah/cynosure-docs test page-coverage`. Expected: all pass.

---

## Task 14: Stricter coverage wired into build

**Files:**
- Modify: `packages/docs/scripts/verify-component-pages.ts` (already written in Task 10 — re-verify it's invoked via `build`).

- [ ] **Step 1: Run**

Run: `pnpm --filter @arshad-shah/cynosure-docs exec tsx scripts/verify-component-pages.ts`
Expected: PASS.

- [ ] **Step 2: Sanity-check an intentional failure**

Temporarily remove `src/content/docs/components/button/index.mdx` → run the script → expect exit 1 with the missing path printed → restore the file.

- [ ] **Step 3: (No commit — verification only.)**

---

## Task 15: Home page

**Files:**
- Rewrite: `src/content/docs/index.mdx`
- Create: `src/components/Home/Hero.astro`
- Create: `src/components/Home/FeatureGrid.astro`
- Create: `src/components/Home/Playground.tsx`
- Create: `src/components/Home/BundleSizeTable.astro`
- Create: `src/components/Home/Footer.astro`

- [ ] **Step 1: `Hero.astro`** — brand mark + Geist wordmark + tagline, `npx cynosure init` copy block:

```astro
---
import lockup from '@brand/cynosure-lockup.svg?url';
---
<section data-hero>
  <img src={lockup} alt="Cynosure" width="240" height="48" />
  <p>Tiny, accessible, themeable React components.</p>
  <div data-cli>
    <code>npx cynosure init</code>
    <button type="button" data-copy-btn data-code="npx cynosure init" aria-label="Copy install command">Copy</button>
  </div>
</section>
<script>
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-hero] [data-copy-btn]')) {
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(btn.dataset.code ?? '');
      const prev = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = prev; }, 1500);
    });
  }
</script>
```

- [ ] **Step 2: `FeatureGrid.astro`** — 6 cards (tiny, accessible, themed, RSC-safe, forms, documented) built with the real `<Card>` from `@arshad-shah/cynosure-react`.

- [ ] **Step 3: `Playground.tsx`** — React island rendering `<Button>` + `<Input>` + `<Dialog>` side-by-side, wired to local state:

```tsx
import { useState } from 'react';
import { Button, Input, Dialog } from '@arshad-shah/cynosure-react';

export default function Playground() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Type something…" />
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
          <p>You typed: {value || '(nothing yet)'}</p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
```

(Confirm the Dialog compound API by reading `packages/react/src/overlay/Dialog/Dialog.tsx` first; adjust accordingly.)

- [ ] **Step 4: `BundleSizeTable.astro`**

```astro
---
import sizeLimit from '@repo/.size-limit.json';
const rows = (sizeLimit as { name: string; limit: string }[]).filter((r) => r.name !== 'Full barrel (warning-only)');
---
<section data-bundle-sizes>
  <h2>Bundle sizes</h2>
  <table>
    <thead><tr><th>Component</th><th>Limit (gzipped)</th></tr></thead>
    <tbody>{rows.map((r) => <tr><td><code>{r.name}</code></td><td>{r.limit}</td></tr>)}</tbody>
  </table>
</section>
```

- [ ] **Step 5: `Footer.astro`** — MIT license notice, GitHub link, version.

- [ ] **Step 6: `index.mdx`**

```mdx
---
title: Cynosure
description: Tiny, accessible, themeable React components.
order: 0
category: home
---
import Hero from '@/components/Home/Hero.astro';
import FeatureGrid from '@/components/Home/FeatureGrid.astro';
import Playground from '@/components/Home/Playground.tsx';
import BundleSizeTable from '@/components/Home/BundleSizeTable.astro';
import Footer from '@/components/Home/Footer.astro';

<Hero />
<FeatureGrid />
<Playground client:visible />
<BundleSizeTable />
<Footer />
```

- [ ] **Step 7: Verify**

Run dev, open `/`. Confirm: mark + wordmark visible; CTA copies `npx cynosure init`; feature grid renders with real Cards; Playground Dialog opens and closes; bundle-size table has ≥ 20 rows.

- [ ] **Step 8: Commit**

```bash
git add packages/docs/src/content/docs/index.mdx packages/docs/src/components/Home
git commit -m "feat(docs): build home page (hero, features, playground, bundle sizes)"
```

---

## Task 16: Recipes content + changelog

**Files:**
- Create: 9 files under `src/content/docs/recipes/` (copy from `/docs/recipes/`, normalize frontmatter to `category: recipes`).
- Create: `packages/docs/scripts/build-changelog.ts`
- (`build` script already calls it — added in Task 1.)

- [ ] **Step 1: Recipes** — for each of `index`, `command-palette`, `dashboard-layout`, `data-table-with-filters`, `login-form`, `multi-step-wizard`, `notification-center`, `onboarding-modal`, `settings-page`:

```mdx
---
title: <Recipe title>
description: <One-liner>
order: <n>
category: recipes
---

<body copied from /docs/recipes/<file>.mdx>
```

- [ ] **Step 2: `build-changelog.ts`**

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../react/CHANGELOG.md');
const OUT = resolve(__dirname, '../src/content/docs/changelog.mdx');

const body = await readFile(SRC, 'utf8');
const frontmatter = `---
title: Changelog
description: Release notes for @arshad-shah/cynosure-react.
order: 100
category: changelog
---

`;
await writeFile(OUT, frontmatter + body, 'utf8');
console.log(`Wrote ${OUT}`);
```

- [ ] **Step 3: Build**

Run: `pnpm --filter @arshad-shah/cynosure-docs build`
Expected: `dist/changelog/index.html` exists.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/content/docs/recipes packages/docs/scripts/build-changelog.ts
git commit -m "feat(docs): add recipes + auto-imported changelog"
```

---

## Task 17: Cloudflare Pages configuration

**Files:**
- Create: `packages/docs/wrangler.toml`
- Create: `packages/docs/public/_headers`
- Create: `packages/docs/public/_redirects`
- Create: `packages/docs/public/robots.txt`
- Extend: `packages/docs/README.md`

- [ ] **Step 1: `wrangler.toml`**

```toml
name = "cynosure-docs"
pages_build_output_dir = "dist"
compatibility_date = "2025-01-15"
```

- [ ] **Step 2: `public/_headers`**

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

- [ ] **Step 3: `public/_redirects`** — includes old Storybook-URL rewrites so the Cloudflare project currently serving Storybook can be swapped in-place.

```
/docs                      /getting-started/introduction   301
/docs/*                    /:splat                          301
/?path=/docs/*             /:splat                          301
/?path=/story/*            /:splat                          301
/iframe.html               /                                301
```

- [ ] **Step 4: `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://cynosure.arshadshah.com/sitemap-index.xml
```

- [ ] **Step 5: README**

````md
# @arshad-shah/cynosure-docs

Public documentation site for Cynosure UI. Deploys to Cloudflare Pages.

> Storybook remains the internal dev/CI tool (Chromatic, visual-regression, a11y). This package replaces it as the public-facing deployment.

## Deploying

### Mode A — Root-mode (monorepo)

Pages dashboard settings:

- **Root directory:** `/` (repo root)
- **Build command:** `pnpm --filter @arshad-shah/cynosure-docs... build`
- **Build output:** `packages/docs/dist`
- **Env:** `PNPM_VERSION=10.33.0`, `NODE_VERSION=22`

### Mode B — Package-mode

- **Root directory:** `packages/docs`
- **Build command:** `pnpm build`
- **Build output:** `dist`

`wrangler.toml` in this package sets `pages_build_output_dir = "dist"`, so Pages auto-discovers the output in Mode B.

### Manual deploy

```sh
pnpm --filter @arshad-shah/cynosure-docs build
npx wrangler pages deploy packages/docs/dist --project-name cynosure-docs
```

## Local development

```sh
pnpm docs        # dev server on :4321
pnpm docs:build  # full production build
```
````

- [ ] **Step 6: Verify build output**

Run: `pnpm --filter @arshad-shah/cynosure-docs build`
Expected: `dist/` contains `index.html`, `_headers`, `_redirects`, `robots.txt`, `pagefind/`, `sitemap-index.xml`.

- [ ] **Step 7: Commit**

```bash
git add packages/docs/wrangler.toml packages/docs/public packages/docs/README.md
git commit -m "feat(docs): add cloudflare pages config (headers, redirects, wrangler, storybook URL rewrites)"
```

---

## Task 18: Turbo + CI wiring

**Files:**
- Modify: `turbo.json`
- Create: `.github/workflows/docs.yml`

- [ ] **Step 1: `turbo.json`** — append scoped task:

```json
"@arshad-shah/cynosure-docs#build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", "src/generated/**"],
  "inputs": ["src/**", "scripts/**", "public/**", "astro.config.mjs", "tsconfig.json", "package.json"]
}
```

- [ ] **Step 2: `.github/workflows/docs.yml`**

```yaml
name: docs
on:
  pull_request:
    paths:
      - 'packages/docs/**'
      - 'packages/react/**'
      - 'packages/tokens/**'
      - 'packages/themes/**'
      - 'brand/**'
      - '.github/workflows/docs.yml'
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10.33.0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @arshad-shah/cynosure-docs... build
      - run: pnpm --filter @arshad-shah/cynosure-docs check
      - uses: actions/upload-artifact@v4
        with:
          name: cynosure-docs-dist
          path: packages/docs/dist
          retention-days: 14
```

- [ ] **Step 3: Commit**

```bash
git add turbo.json .github/workflows/docs.yml
git commit -m "ci(docs): build and upload docs dist on every PR"
```

---

## Task 19: Final verification

- [ ] **Step 1: Clean build**

```bash
pnpm --filter @arshad-shah/cynosure-docs clean
pnpm --filter @arshad-shah/cynosure-docs build
```

Expected: `dist/index.html`, `dist/pagefind/pagefind.js`, `dist/sitemap-index.xml` all exist; no warnings about missing pages.

- [ ] **Step 2: Preview**

```sh
pnpm --filter @arshad-shah/cynosure-docs preview
```

Verify: homepage renders; theme toggle (light/dark/terminal/high-contrast) flips `data-theme` and persists across reload with no FOUC (hard-reload under Slow 3G throttling to confirm pre-paint script works).

- [ ] **Step 3: Typecheck + lint**

```sh
pnpm --filter @arshad-shah/cynosure-docs check
pnpm --filter @arshad-shah/cynosure-docs lint
```

Expected: zero errors.

- [ ] **Step 4: Lighthouse**

Open Chrome DevTools → Lighthouse → Mobile, run on `http://localhost:4321/`.
Targets: Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95, SEO = 100.
Fix any regressions (missing alt, contrast, missing meta, blocking resources).

- [ ] **Step 5: Commit polish (if any)**

```bash
git add -A
git commit -m "chore(docs): final verification polish"
```

---

## Cross-cutting notes

- **Strict TS, no `any`.** `noUncheckedIndexedAccess: true` applies everywhere.
- **Tokens-only CSS.** No raw hex in `site.css` or any chrome `.astro`.
- **No `innerHTML` with untrusted content.** Use `textContent` + `createElement`. Pagefind excerpts are stripped of HTML tags before rendering.
- **Reduced motion:** everything gated by `@media (prefers-reduced-motion: reduce)`.
- **No runtime Google Fonts:** DevTools Network tab must show zero `fonts.googleapis.com` requests.
- **Version pill:** sourced from `@arshad-shah/cynosure-react/package.json`. No manual bump needed.
- **Brand assets via `@brand` alias or symlink only** — no binary duplicates checked in.
- **Storybook stays internal.** Docs site replaces Storybook as the public deployment; Storybook continues to back Chromatic, visual-regression tests, and a11y audits.

## Items to flag in final summary (outside allowed scope)

1. The existing Cloudflare Pages project that currently serves Storybook at the public domain needs to be repointed at `packages/docs/dist` (or the new `cynosure-docs` Pages project needs to take over that hostname). This is a dashboard change, not a file change.
2. Any pipeline step that publishes Storybook to the public hostname (distinct from Chromatic) should be removed. Keep the Chromatic step untouched — it runs against `storybook-static` and is not public-facing.
3. If token JSON isn't a public export of `@arshad-shah/cynosure-tokens`, Task 12 needs a minor adjustment — use the TS export instead. Verify during execution.

## Self-review

- **Spec coverage:** each deliverable → task (scaffold → 1–3; theme/fonts → 4; props → 5,7; previews → 6,7; chrome → 8; layouts → 9; coverage gate → 10,14; content → 11,12,15,16; Cloudflare → 17; monorepo/CI → 18; verification → 19).
- **Placeholders:** each code block is concrete. Task 13a–13r is intentionally templated because the 17 pages share Task 13's shape exactly; per-page content is enumerated in the opening table.
- **Type consistency:** `Example`, `ComponentRecord`, `PropRecord`, `Theme`, `THEMES`, `THEME_STORAGE_KEY`, `getThemeInitScript`, `extractProps`, `EXPECTED_COMPONENT_SLUGS`, `sidebar`, `site`, `SidebarLink`, `SidebarSection` — used identically across tasks.
