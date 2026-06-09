# Cynosure UI

> A gorgeous, tiny, customisable, accessible React UI framework — designed for production.

Cynosure is a headless-at-the-core, themed-on-top component library built around a tiny set of layout primitives and W3C DTCG design tokens. Most behaviour — toggles, accordions, tabs, the form controls, the layout cascade, all the overlay primitives (dialog, drawer, popover, tooltip, hover card, alert dialog, scroll area) — is first-party in-tree. Calendars and other locale-aware controls lean on `react-aria-components`. Only the menu family still wraps Radix. Every component ships as its own ESM entry point with its own CSS, so consumers pay only for what they import.

[![npm](https://img.shields.io/npm/v/@arshad-shah/cynosure-react.svg?label=%40arshad-shah%2Fcynosure-react)](https://www.npmjs.com/package/@arshad-shah/cynosure-react)
[![license](https://img.shields.io/npm/l/@arshad-shah/cynosure-react.svg)](./LICENSE)
[![bundle](https://img.shields.io/bundlephobia/minzip/@arshad-shah/cynosure-react.svg?label=minzip)](https://bundlephobia.com/package/@arshad-shah/cynosure-react)
[![types](https://img.shields.io/npm/types/@arshad-shah/cynosure-react.svg)](https://www.npmjs.com/package/@arshad-shah/cynosure-react)
[![react](https://img.shields.io/badge/react-18%20%7C%2019-61dafb?logo=react&logoColor=white)](https://cynosure.arshadshah.com/getting-started/rsc/)
[![a11y](https://img.shields.io/badge/WCAG-2.2%20AA-0b8043)](https://cynosure.arshadshah.com/foundations/accessibility/)

---

## Install in 30 seconds

```bash
npx cynosure init
```

One command: detects your framework (Next.js App Router, Next.js Pages, Vite, CRA, Remix), installs the right packages, wires the single CSS import, and adds `CynosureProvider` for you.

### Or install manually

```bash
pnpm add @arshad-shah/cynosure-react @arshad-shah/cynosure-tokens
```

```ts
// one CSS import covers tokens (light + dark) + every component
import '@arshad-shah/cynosure-react/all.css';
```

```tsx
import { CynosureProvider, Button } from '@arshad-shah/cynosure-react';

export default function App() {
  return (
    <CynosureProvider>
      <Button>Hello, Cynosure</Button>
    </CynosureProvider>
  );
}
```

Peer requirements: **React 18 or 19** (`react`, `react-dom`). `react-hook-form` is an optional peer for the forms adapter.

> **Upgrading?** The older three-import setup (`tokens/css`, `tokens/css/dark`, `react/styles.css`) still works — `all.css` and `CynosureProvider` are additive.

---

## Why Cynosure

- **102 components** with dedicated subpath exports across layout, typography, forms, overlays, navigation, data display, and feedback — all pre-styled, all themeable. Full inventory in [`components.config.mjs`](./components.config.mjs).
- **Zero-config DX.** One CSS import, one provider, works out of the box with Next.js App Router, Vite, Remix, and CRA.
- **WCAG 2.2 AA** across every component. Every story is locked to axe-passing. RTL-safe, keyboard complete, reduced-motion honoured.
- **Pay for what you import.** Per-component ESM entries (`@arshad-shah/cynosure-react/button`) and per-component CSS — your bundler keeps the rest.
- **Theming that is data.** Six built-in themes (light, dark, terminal, high-contrast) or roll your own by overriding CSS custom properties. No CSS-in-JS runtime.
- **Forms that auto-wire.** `Form` + `FormField` + `FormControl` wire `id`, `aria-describedby`, `aria-invalid`, `name`, `required`, `disabled` for you. Drop-in `react-hook-form` adapter.
- **Ships with a docs site.** Interactive Storybook playgrounds, MDX recipes, and Chromatic visual regression in CI.

---

## Bundle sizes

Minified + brotli, per [`size-limit`](./.size-limit.json) budgets enforced in CI:

| Component | Size | Component | Size |
| --- | ---: | --- | ---: |
| `Box`, `Stack`, `Flex`, `Grid` | **3 kB** | `Button` | **6 kB** |
| `Text`, `Heading`, `Link` | **4 kB** | `Input`, `Textarea` | **8 kB** |
| `Card`, `Badge`, `Alert` | **3–4 kB** | `Checkbox`, `Radio`, `Switch` | **10 kB** |
| `Tooltip`, `Dialog`, `Drawer` | **18 kB** | `DropdownMenu` | **30 kB** |
| `Tabs` | **14 kB** | `Accordion` | **14 kB** |
| `Select` | **55 kB** | `Combobox` | **58 kB** |
| `DatePicker` | **70 kB** | `DataTable` | **60 kB** |
| `Form` | **6 kB** | RHF adapter | **8 kB** |

The full barrel tops out at **260 kB** (warning-only). In practice you import per-component and never pay that.

Run `pnpm size` locally to verify against current master.

---

## Server Components (RSC)

Cynosure is RSC-aware. Structural components (`Box`, `Stack`, `Card`, `Text`, `Heading`, `Badge`, `Alert`, …) render inside Server Components. Interactive components (`Button`, form controls, overlays, menus) go inside a `'use client'` boundary — usually a tiny `providers.tsx` at the root.

Full [compatibility matrix and Next.js App Router recipe →](https://cynosure.arshadshah.com/getting-started/rsc/)

---

## Packages

| Package | What it ships |
| --- | --- |
| [`@arshad-shah/cynosure-react`](./packages/react) | The component library — primitives, typography, forms, overlays, nav, data, feedback. |
| [`@arshad-shah/cynosure-tokens`](./packages/tokens) | W3C DTCG design tokens; compiled CSS (`:root` + dark) and typed TS constants. |
| [`@arshad-shah/cynosure-themes`](./packages/themes) | Prebuilt alternative themes (terminal, high-contrast) as side-effect CSS. |
| [`@arshad-shah/cynosure-cli`](./packages/cli) | `npx cynosure init` scaffolding CLI. |

---

## Theming in two lines

```tsx
import { CynosureProvider } from '@arshad-shah/cynosure-react';

<CynosureProvider theme={{ themes: ['light', 'dark', 'terminal'], defaultTheme: 'system' }}>
  {children}
</CynosureProvider>
```

Flip themes at runtime by setting `data-theme` on `<html>`. Authoring a custom theme is one CSS file — see [Custom themes](https://cynosure.arshadshah.com/foundations/custom-themes/).

---

## Documentation

The full docs site (interactive playgrounds, MDX recipes, props tables, type reference) lives at **[cynosure.arshadshah.com](https://cynosure.arshadshah.com)**. Source lives under [`packages/docs/src/content/docs/`](./packages/docs/src/content/docs/).

| Area | Live link |
| --- | --- |
| Installation & quickstart | [Quickstart](https://cynosure.arshadshah.com/getting-started/quickstart/) |
| Server Components / SSR | [RSC guide](https://cynosure.arshadshah.com/getting-started/rsc/) |
| Theming & custom themes | [Theming overview](https://cynosure.arshadshah.com/foundations/theming-overview/) |
| Accessibility | [Accessibility](https://cynosure.arshadshah.com/foundations/accessibility/) |
| RTL support | [RTL](https://cynosure.arshadshah.com/getting-started/rtl/) |
| Recipes (login, dashboard, data table, …) | [Recipes](https://cynosure.arshadshah.com/recipes/) |
| Storybook playgrounds | [`pnpm storybook`](https://cynosure.arshadshah.com/storybook/) |

### Adding a new component

Component names are centralised in [`components.config.mjs`](./components.config.mjs). Add one entry there, run `pnpm --filter @arshad-shah/cynosure-react sync:components`, and the tsup entries, package.json subpath exports, per-component proxy dirs, and docs sidebar all update from that single source.

---

## Status

Cynosure is **v1.0.1** — released and stable.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the workflow, commit conventions, and how to run tests locally.

- Code of conduct: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- Security disclosure: [`SECURITY.md`](./SECURITY.md)

---

## Licence

[MIT](./LICENSE) © Arshad Shah.
