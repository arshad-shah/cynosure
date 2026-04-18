# Cynosure UI

> A gorgeous, tiny, customisable, accessible React UI framework — designed for production.

Cynosure is a headless-at-the-core, themed-on-top component library built around a tiny set of layout primitives, W3C DTCG design tokens, and hybrid Radix + React Aria behaviour. Every component ships as its own ESM entry point with its own CSS, so consumers pay only for what they import.

[![npm](https://img.shields.io/npm/v/%40cynosure%2Freact)](https://www.npmjs.com/package/@arshad-shah/cynosure-react)
[![license](https://img.shields.io/npm/l/%40cynosure%2Freact)](./LICENSE)
[![bundle](https://img.shields.io/bundlephobia/minzip/%40cynosure%2Freact)](https://bundlephobia.com/package/@arshad-shah/cynosure-react)

---

## Install

```bash
pnpm add @arshad-shah/cynosure-react @arshad-shah/cynosure-tokens
```

Peer requirements: `react@^19`, `react-dom@^19`.

Import the CSS once at the root of your app:

```ts
import '@arshad-shah/cynosure-tokens/css';          // design tokens (light by default)
import '@arshad-shah/cynosure-tokens/css/dark';     // dark-mode overrides
import '@arshad-shah/cynosure-react/styles.css';    // component styles
```

Optional prebuilt themes:

```ts
import '@arshad-shah/cynosure-themes/terminal';
import '@arshad-shah/cynosure-themes/high-contrast';
```

---

## Hello, Cynosure

```tsx
import { Button, Stack, ThemeProvider } from '@arshad-shah/cynosure-react';

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
import { Button } from '@arshad-shah/cynosure-react/button';
import { Stack } from '@arshad-shah/cynosure-react/stack';
```

---

## What you get

- **90+ components** across layout, typography, forms, overlays, navigation, data display, and feedback.
- **Theming that is data.** Six built-in themes (light, dark, terminal, high-contrast, + two variants), or author your own by writing CSS custom properties.
- **Accessibility at the floor.** WCAG 2.2 AA, keyboard complete, RTL-safe, reduced-motion honoured. Every component ships with an axe-passing story.
- **Tree-shakeable ESM.** Per-component entries (`@arshad-shah/cynosure-react/button`, `@arshad-shah/cynosure-react/combobox`, …) and per-component CSS.
- **Forms you can actually compose.** `Form` + `FormField` + `FormControl` auto-wire `id`, `aria-describedby`, `aria-invalid`, `name`, `required`, `disabled`. Drop-in adapter for `react-hook-form`.
- **Storybook-first docs** with interactive playgrounds, MDX recipes, and Chromatic visual regression.

---

## Packages

| Package                 | What it ships                                                                   |
| ----------------------- | ------------------------------------------------------------------------------- |
| `@arshad-shah/cynosure-react`          | The component library — primitives, typography, forms, overlays, nav, data.    |
| `@arshad-shah/cynosure-tokens`         | W3C DTCG design tokens; compiled CSS (`:root` + dark) and typed TS constants.  |
| `@arshad-shah/cynosure-themes`         | Prebuilt alternative themes (terminal, high-contrast) as side-effect CSS.      |
| `@arshad-shah/cynosure-core`           | Framework-agnostic primitives (reserved for cross-framework reuse).            |
| `@arshad-shah/cynosure-icons`          | Tree-shaken Lucide re-exports.                                                 |

---

## Documentation

Full docs live in Storybook:

- [**Live docs**](https://cynosure.arshadshah.com) (once deployed)
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
import { ThemeProvider } from '@arshad-shah/cynosure-react';

<ThemeProvider themes={['light', 'dark', 'terminal']} defaultTheme="system">
  {children}
</ThemeProvider>
```

Flip themes at runtime by setting `data-theme` on `<html>`. Authoring a custom theme is one CSS file — see [`docs/foundations/custom-themes.mdx`](./docs/foundations/custom-themes.mdx).

---

## Status

Cynosure is currently on the road to `v1.0.0`. See [`docs/specs/PROGRESS.md`](./docs/specs/PROGRESS.md) for phase-by-phase status.

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
