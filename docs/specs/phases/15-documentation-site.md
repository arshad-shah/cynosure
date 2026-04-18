# Phase 15 — Documentation site

> **Goal:** Ship a public documentation site that is the authoritative resource for Cynosure. Storybook is the primary tool; we enhance it to serve as a proper docs site rather than bolt on Docusaurus.

**Depends on:** Phases 01–14.
**Blocks:** Phase 16 (release).

---

## Strategy decision

**Storybook is the docs site.** Don't build a separate Docusaurus/Astro/Next site. Storybook 9/10's Docs mode is excellent: MDX pages, interactive component playgrounds, auto-generated API tables from TypeScript types, search, and responsive viewport testing. Running a second docs site means duplicating effort and keeping examples in sync manually.

Published at `docs.cynosure.arshad.example` (or similar — on the arshadshah.com infra Arshad already moved to Cloudflare Pages).

---

## Site structure

```
Cynosure
├── Getting started
│   ├── Introduction
│   ├── Installation
│   ├── Quickstart
│   └── Migrating from <other>
├── Foundations
│   ├── Design principles
│   ├── Design tokens
│   ├── Theming
│   │   ├── Overview
│   │   ├── Dark mode
│   │   ├── Authoring a custom theme
│   │   └── GitHub Dark Terminal recipe
│   ├── Typography
│   ├── Spacing & layout
│   ├── Colour
│   ├── Motion
│   ├── Accessibility
│   └── RTL support
├── Layout
│   ├── Box
│   ├── Stack
│   ├── Inline
│   ├── Flex
│   ├── Grid
│   ├── Center
│   ├── Container
│   └── …
├── Typography (components)
│   ├── Text
│   ├── Heading
│   └── …
├── Forms
│   ├── Button
│   ├── Input
│   ├── Checkbox
│   └── …
├── Overlays
├── Navigation
├── Data display
├── Feedback
├── Hooks
│   ├── useDisclosure
│   ├── useControllableState
│   └── …
├── Recipes
│   ├── Form with react-hook-form + Zod
│   ├── Data table with sorting + selection
│   ├── Multi-step wizard
│   ├── Dashboard layout
│   ├── Command palette
│   ├── Notification center
│   ├── Authentication forms
│   └── …
├── Guides
│   ├── Using with Next.js
│   ├── Using with Remix
│   ├── Using with Vite + React Router
│   ├── Using with TanStack Start
│   ├── Using with Astro (islands only)
│   ├── Tree-shaking & bundle size
│   ├── CSS extraction in SSR
│   └── Integrating with react-hook-form
├── Reference
│   ├── Changelog (auto-generated from Changesets)
│   ├── Roadmap
│   ├── Migration guides
│   └── Contributing
└── About
    ├── Philosophy
    ├── FAQ
    └── License
```

---

## Storybook setup for docs mode

### MDX pages

Every section starts with an MDX index page. Example — `packages/react/src/components/Button/Button.mdx`:

```mdx
import { Meta, Title, Subtitle, Description, Primary, Controls, Stories, Source, Canvas } from '@storybook/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

<Title />
<Subtitle />

<Description />

## Installation

```bash
pnpm add @arshad-shah/cynosure-react
```

## Basic usage

<Primary />

<Controls />

## Variants

<Canvas of={ButtonStories.Variants} />

## Sizes

<Canvas of={ButtonStories.Sizes} />

## With icons

<Canvas of={ButtonStories.WithIcons} />

## Loading state

<Canvas of={ButtonStories.Loading} />

## asChild composition

<Canvas of={ButtonStories.AsChild} />

## API

<Stories />

## Accessibility

…

## Keyboard interactions

| Key     | Description                 |
| ------- | --------------------------- |
| Tab     | Moves focus to the button.  |
| Enter   | Activates the button.       |
| Space   | Activates the button.       |

## Design tokens

This component reads from these tokens:

- `--cynosure-color-accent-solid`
- `--cynosure-color-accent-solidHover`
- `--cynosure-radius-component-md`
- …
```

Pattern applies to every component.

### Foundations pages

Standalone MDX files not tied to a component. Example — `docs/foundations/theming.mdx`. These go under `docs/` at the repo root, not inside packages.

### Table of contents & navigation

Storybook auto-builds the sidebar from story titles (`title: 'Components/Forms/Button'`). Apply consistent hierarchy:

- `title: 'Foundations/Theming/Overview'`
- `title: 'Layout/Box'`
- `title: 'Forms/Button'`
- `title: 'Hooks/useDisclosure'`
- `title: 'Recipes/Authentication form'`

### Search

Storybook's built-in search works out of the box. Configure `parameters.options.storySort` for alphabetical ordering within groups.

---

## API reference generation

Storybook's `argTypes` picks up TypeScript prop types via `react-docgen-typescript`. Verify this is enabled:

```ts
// .storybook/main.ts
typescript: {
  reactDocgen: 'react-docgen-typescript',
  reactDocgenTypescriptOptions: {
    shouldExtractLiteralValuesFromEnum: true,
    propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName),
  },
},
```

Every component's `Controls` panel becomes its prop table in the docs. No manual API tables.

### JSDoc for better descriptions

Every component's props interface should have JSDoc comments. These surface in the Controls panel.

```tsx
export interface ButtonProps {
  /**
   * The visual style.
   * @default 'solid'
   */
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

  /**
   * When true, disables and shows a spinner.
   */
  loading?: boolean;
}
```

---

## Recipe pages — critical for adoption

These are worked examples. Each is an MDX page + a full working Storybook story.

Priority recipes (must ship v1):

1. **Login form** — Form + FormField + Input + Button with RHF + Zod.
2. **Dashboard layout** — Sidebar + Container + Grid + Card + Stat.
3. **Data table with filters** — DataTable + Input filter + Popover for advanced filters.
4. **Notification center** — Popover + Tabs + Notification list + toast.
5. **Command palette** — Combobox + Dialog + keyboard shortcut (Cmd+K via `useHotkeys`).
6. **Settings page** — Tabs + Form sections + Switch + Select.
7. **Multi-step wizard** — Stepper + Form state across steps.
8. **Onboarding modal** — Dialog + step progression.

Each recipe lives under `docs/recipes/<slug>/` with its MDX + stories.

---

## Changelog page

Auto-generated from Changesets. In CI, after release:

```yaml
- name: Build changelog page
  run: node scripts/build-changelog-page.mjs
```

The script reads `packages/*/CHANGELOG.md`, merges them into a single `docs/reference/changelog.mdx`, and commits.

---

## Hosting

### Option A: Vercel (recommended for SSR features)

```bash
pnpm build-storybook
```

Deploy `storybook-static/` to Vercel/Cloudflare Pages. Static hosting — no SSR needed.

### Option B: Cloudflare Pages (matches Arshad's existing infra)

Cloudflare Pages integration with the monorepo:

```yaml
# wrangler or cloudflare dashboard config
build_command: pnpm build-storybook
output_directory: storybook-static
```

Consistent with Arshad's `arshadshah.com` setup.

**Decision: Cloudflare Pages.** Matches existing infra; zero additional vendors.

---

## Custom Storybook theme

Match the Cynosure aesthetic. `.storybook/manager.ts`:

```ts
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const theme = create({
  base: 'dark',
  brandTitle: 'Cynosure UI',
  brandUrl: 'https://cynosure.arshadshah.com',
  brandImage: '/cynosure-logo.svg',
  brandTarget: '_self',

  // Colours derived from Cynosure's own terminal theme
  colorPrimary: '#388bfd',
  colorSecondary: '#388bfd',
  appBg: '#0d0f14',
  appContentBg: '#161b22',
  appBorderColor: '#30363d',
  textColor: '#e6edf3',
  fontBase: '"JetBrains Mono", ui-monospace, monospace',
});

addons.setConfig({ theme });
```

Storybook's sidebar and toolbar inherit the theme; docs pages already render through our design system.

---

## Search improvements

Storybook search is basic; consider `@storybook/addon-search` (if available) or a lightweight third-party integration. Start with default; upgrade if usage surveys reveal discoverability issues.

---

## Versioned docs (optional, v1+)

For now, single-version docs on `main`. Defer versioned docs until we have a v2 in flight — at that point, deploy per-major-version subdomains (`v1.cynosure.…`, `v2.cynosure.…`) and link from a version selector in the nav.

---

## Analytics

Self-hosted Plausible or Umami. No Google Analytics. Tracks:
- Page views per component.
- Search queries (what are consumers looking for?).
- External clicks (install commands, GitHub).

Informs what to document better.

---

## Domain & deployment

- Primary: `cynosure.arshadshah.com` (subdomain of Arshad's existing root).
- CDN: Cloudflare Pages.
- SSL: automatic via Cloudflare.
- Robots.txt + sitemap generated at build time.

---

## Launch checklist

Before announcing:

- [ ] Every component has an MDX page with at least: description, basic example, props table, 1+ variant examples, accessibility note.
- [ ] Every foundation page exists.
- [ ] At least 8 recipes published.
- [ ] Changelog auto-generates.
- [ ] Search returns sensible results for "button", "form", "dark mode", "theme".
- [ ] Site loads under 1.5s on 3G Fast.
- [ ] Lighthouse a11y ≥ 95, perf ≥ 85.
- [ ] All code examples are copy-pasteable and work.
- [ ] Open Graph images and metadata set.
- [ ] Favicon + branded 404 page.

---

## Exit criteria

- [ ] Docs site builds cleanly from `pnpm build-storybook`.
- [ ] Deployed to Cloudflare Pages with the `cynosure.arshadshah.com` subdomain (or temporary one).
- [ ] Every component in the library has an MDX doc page.
- [ ] All 8 priority recipes published and working.
- [ ] Launch checklist complete.
- [ ] Changesets: `@arshad-shah/cynosure-react` patch "Documentation site".

## Decisions to log

- Storybook as the sole docs tool. Rationale: single source of truth, interactive examples by default, no sync overhead with a separate docs site.
- Cloudflare Pages hosting matches Arshad's existing infra.
- No versioned docs until v2 lands.
