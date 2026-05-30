# @arshad-shah/cynosure-react

> React component library for Cynosure UI — headless-at-the-core, themed-on-top, pay-for-what-you-import.

[![npm](https://img.shields.io/npm/v/@arshad-shah/cynosure-react.svg)](https://www.npmjs.com/package/@arshad-shah/cynosure-react)
[![license](https://img.shields.io/npm/l/@arshad-shah/cynosure-react.svg)](../../LICENSE)
[![bundle](https://img.shields.io/bundlephobia/minzip/@arshad-shah/cynosure-react.svg?label=minzip)](https://bundlephobia.com/package/@arshad-shah/cynosure-react)
[![types](https://img.shields.io/npm/types/@arshad-shah/cynosure-react.svg)](https://www.npmjs.com/package/@arshad-shah/cynosure-react)
[![react](https://img.shields.io/badge/react-18%20%7C%2019-61dafb?logo=react&logoColor=white)](https://cynosure.arshadshah.com/getting-started/rsc/)

Every component ships as its own ESM entry point with its own CSS, so bundlers keep only what you use. Toggles, switches, accordions, tabs, collapsibles, checkboxes, radios, avatars, `Slot`/`asChild`, the direction provider, scroll area, tooltip, hover card, popover, dialog, drawer, and alert dialog are owned in-tree (backed by two small shared kits — `useFloatingPosition` for anchored overlays and `useDialog` for modal focus-trap + scroll lock). Calendars and other locale-aware controls lean on `react-aria-components`. Only the menu family (DropdownMenu, ContextMenu, MenuBar, NavigationMenu) still wraps Radix; migration is in flight. Styling is driven by W3C DTCG design tokens from [`@arshad-shah/cynosure-tokens`](https://www.npmjs.com/package/@arshad-shah/cynosure-tokens).

---

## Install

```bash
npx cynosure init
```

or manually:

```bash
pnpm add @arshad-shah/cynosure-react @arshad-shah/cynosure-tokens
```

Peer requirements: **React 18 or 19** (`react`, `react-dom`). `react-hook-form@^7` is an optional peer for the forms adapter.

---

## Set up

One CSS import (includes tokens + dark + component styles), one provider:

```ts
import '@arshad-shah/cynosure-react/all.css';
// Optional — registers Geist + JetBrains Mono Variable.
// Skip to fall through to system fonts.
import '@arshad-shah/cynosure-react/fonts.css';
```

```tsx
import { CynosureProvider, Button } from '@arshad-shah/cynosure-react';

export default function App() {
  return (
    <CynosureProvider>
      <Button>Get started</Button>
    </CynosureProvider>
  );
}
```

> Prefer granular control? The legacy three-import path is still exported:
>
> ```ts
> import '@arshad-shah/cynosure-tokens/css';
> import '@arshad-shah/cynosure-tokens/css/dark';
> import '@arshad-shah/cynosure-react/styles.css';
> ```

### Per-component imports

Every component has a subpath export for minimum bundle size:

```ts
import { Button } from '@arshad-shah/cynosure-react/button';
import { Dialog } from '@arshad-shah/cynosure-react/dialog';
import { DataTable } from '@arshad-shah/cynosure-react/data-table';
```

The subpath entry imports only that component's code and CSS — no barrel-file fallout.

---

## Bundle sizes

Brotli-compressed per-component budgets (full table in root [`README.md`](../../README.md#bundle-sizes)):

| Component | Size | Component | Size |
| --- | ---: | --- | ---: |
| `Box`, `Stack`, `Flex`, `Grid` | 3 kB | `Button` | 6 kB |
| `Text`, `Heading` | 4 kB | `Input`, `Textarea` | 8 kB |
| `Dialog`, `Tooltip`, `Drawer` | 18 kB | `Tabs` | 14 kB |
| `Select` | 55 kB | `Combobox` | 58 kB |
| `DatePicker` | 70 kB | `DataTable` | 60 kB |

Enforced by `pnpm size` in CI.

---

## Server Components

This package works with React Server Components. Structural pieces (`Box`, `Stack`, `Card`, `Text`, …) render inside Server Components; stateful pieces (`Button`, form controls, overlays) go inside a `'use client'` boundary. See the [RSC compatibility matrix](https://cynosure.arshadshah.com/getting-started/rsc/) for the full breakdown and a Next.js App Router recipe.

---

## What's inside

**Layout primitives** — `Box`, `Stack`, `Inline`, `Flex`, `Grid`, `Center`, `Spacer`, `Divider`, `AspectRatio`, `Container`, `Section`

**Typography** — `Text`, `Heading`, `Code`, `Kbd`, `Link`, `Blockquote`, `List`, `Mark` (+ `HighlightedText`)

**Buttons** — `Button`, `IconButton`, `ButtonGroup`, `Toggle`, `ToggleGroup`

**Forms** — `Input`, `Textarea`, `NumberInput`, `SearchInput`, `PinInput`, `TagsInput`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Select`, `MultiSelect`, `Combobox`, `Slider`, `RangeSlider`, `Rating`, `Calendar`, `DatePicker`, `DateRangePicker`, `TimePicker`, `ColorPicker`, `FileUpload`, `Label`, `HelperText`, `ErrorText`, `Fieldset`

**Overlays** — `Dialog`, `AlertDialog`, `Drawer`, `Popover`, `HoverCard`, `Tooltip`, `Toast`, `DropdownMenu`, `ContextMenu`, `MenuBar`, `CommandPalette`

**Navigation** — `Tabs`, `Breadcrumb`, `Pagination`, `Menu`, `NavigationMenu`, `Sidebar`, `Stepper`, `Anchor`, `BackToTop`

**Data display** — `Card`, `Table`, `DataTable`, `Tree`, `Timeline`, `Stat`, `LinearProgress`, `CircularProgress`, `Skeleton`, `Spinner`, `Accordion`, `Collapsible`, `ScrollArea`, `Resizable`, `CodeBlock`, `Carousel`, `Chart`

**Feedback** — `Badge`, `Tag`, `Chip`, `Avatar`, `AvatarGroup`, `Alert`, `Notification`, `Callout`, `EmptyState`

**Form composition** — `Form`, `FormField`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, plus an RHF adapter at `@arshad-shah/cynosure-react/rhf`

> The list above is hand-curated for readability. The machine-readable, always-up-to-date inventory lives at the repo root in [`components.config.mjs`](https://github.com/arshad-shah/cynosure/blob/main/components.config.mjs) — every published subpath export is one row there. Props references and live examples live at **[cynosure.arshadshah.com](https://cynosure.arshadshah.com)**.

---

## Themes

Drop-in theme presets from [`@arshad-shah/cynosure-themes`](https://www.npmjs.com/package/@arshad-shah/cynosure-themes):

```ts
import '@arshad-shah/cynosure-themes/terminal';
import '@arshad-shah/cynosure-themes/high-contrast';
```

Or build your own by overriding the token CSS variables — see [Custom themes](https://cynosure.arshadshah.com/foundations/custom-themes/).

---

## Links

- [Docs site](https://cynosure.arshadshah.com) — interactive playgrounds, props tables, recipes
- [Main repo](https://github.com/arshad-shah/cynosure) — source, issues, contributor guide
- [Server Components guide](https://cynosure.arshadshah.com/getting-started/rsc/)
- [Migration to v1](https://cynosure.arshadshah.com/reference/migration-to-v1/)
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
