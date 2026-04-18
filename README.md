# Lumen UI

> A gorgeous, tiny, customisable, accessible React UI framework — designed for production.

Lumen is a headless-at-the-core, themed-on-top component library built around a tiny set of layout primitives, W3C DTCG design tokens, and hybrid Radix + React Aria behaviour. Every component ships as its own ESM entry point with its own CSS, so consumers pay only for what they import.

[![npm](https://img.shields.io/npm/v/%40lumen%2Freact)](https://www.npmjs.com/package/@lumen/react)
[![license](https://img.shields.io/npm/l/%40lumen%2Freact)](./LICENSE)
[![bundle](https://img.shields.io/bundlephobia/minzip/%40lumen%2Freact)](https://bundlephobia.com/package/@lumen/react)

---

## Install

```bash
pnpm add @lumen/react @lumen/tokens
```

Peer requirements: `react@^19`, `react-dom@^19`.

Import the CSS once at the root of your app:

```ts
import '@lumen/tokens/css';          // design tokens (light by default)
import '@lumen/tokens/css/dark';     // dark-mode overrides
import '@lumen/react/styles.css';    // component styles
```

Optional prebuilt themes:

```ts
import '@lumen/themes/terminal';
import '@lumen/themes/high-contrast';
```

---

## Hello, Lumen

```tsx
import { Button, Stack, ThemeProvider } from '@lumen/react';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Stack gap="3" align="center">
        <Button>Get started</Button>
        <Button variant="soft" colorScheme="accent">
          Read the docs
        </Button>
      </Stack>
    </ThemeProvider>
  );
}
```

Per-component imports for the smallest possible bundle:

```ts
import { Button } from '@lumen/react/button';
import { Stack } from '@lumen/react/stack';
```

---

## What you get

- **90+ components** across layout, typography, forms, overlays, navigation, data display, and feedback.
- **Theming that is data.** Six built-in themes (light, dark, terminal, high-contrast, + two variants), or author your own by writing CSS custom properties.
- **Accessibility at the floor.** WCAG 2.2 AA, keyboard complete, RTL-safe, reduced-motion honoured. Every component ships with an axe-passing story.
- **Tree-shakeable ESM.** Per-component entries (`@lumen/react/button`, `@lumen/react/combobox`, …) and per-component CSS.
- **Forms you can actually compose.** `Form` + `FormField` + `FormControl` auto-wire `id`, `aria-describedby`, `aria-invalid`, `name`, `required`, `disabled`. Drop-in adapter for `react-hook-form`.
- **Storybook-first docs** with interactive playgrounds, MDX recipes, and Chromatic visual regression.

---

## Packages

| Package                 | What it ships                                                                   |
| ----------------------- | ------------------------------------------------------------------------------- |
| `@lumen/react`          | The component library — primitives, typography, forms, overlays, nav, data.    |
| `@lumen/tokens`         | W3C DTCG design tokens; compiled CSS (`:root` + dark) and typed TS constants.  |
| `@lumen/themes`         | Prebuilt alternative themes (terminal, high-contrast) as side-effect CSS.      |
| `@lumen/core`           | Framework-agnostic primitives (reserved for cross-framework reuse).            |
| `@lumen/icons`          | Tree-shaken Lucide re-exports.                                                 |

---

## Documentation

Full docs live in Storybook:

- [**Live docs**](https://lumen.arshadshah.com) (once deployed)
- Run locally with `pnpm storybook`

In-repo documentation:

| Area                                             | Where                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Architecture (the seven laws, styling pipeline)  | [`docs/specs/ARCHITECTURE.md`](./docs/specs/ARCHITECTURE.md)             |
| Build progress + decisions log                   | [`docs/specs/PROGRESS.md`](./docs/specs/PROGRESS.md)                     |
| Phase-by-phase build spec                        | [`docs/specs/phases/`](./docs/specs/phases/)                             |
| Foundations (installation, theming, tokens, …)   | [`docs/foundations/`](./docs/foundations/)                               |
| Recipes (login, dashboard, data table, …)        | [`docs/recipes/`](./docs/recipes/)                                       |
| Component source + MDX docs                      | [`packages/react/src/`](./packages/react/src/)                           |

---

## Theming in two lines

```tsx
import { ThemeProvider } from '@lumen/react';

<ThemeProvider themes={['light', 'dark', 'terminal']} defaultTheme="system">
  {children}
</ThemeProvider>
```

Flip themes at runtime by setting `data-theme` on `<html>`. Authoring a custom theme is one CSS file — see [`docs/foundations/custom-themes.mdx`](./docs/foundations/custom-themes.mdx).

---

## Status

Lumen is currently on the road to `v1.0.0`. See [`docs/specs/PROGRESS.md`](./docs/specs/PROGRESS.md) for phase-by-phase status.

- **Shipped** (phases 01–14): foundation, tokens, theming, core utilities, layout primitives, typography, forms (basic + advanced), overlays, navigation, data display, feedback, form composition, quality hardening.
- **In progress** (phases 15–16): hosted docs site, v1.0.0 release.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the phase-based workflow, commit conventions, and how to run tests locally.

- Code of conduct: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- Security disclosure: [`SECURITY.md`](./SECURITY.md)

---

## Licence

[MIT](./LICENSE) © Arshad Shah.
