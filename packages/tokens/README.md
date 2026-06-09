# @arshad-shah/cynosure-tokens

> W3C DTCG design tokens for Cynosure UI — the CSS custom properties every component reads from.

Source of truth for colour, spacing, typography, radius, elevation, motion, and z-index across the Cynosure ecosystem. Tokens are authored as DTCG JSON and compiled by Style Dictionary to CSS custom properties, a TypeScript module, and platform outputs.

---

## Install

```bash
pnpm add @arshad-shah/cynosure-tokens
```

No peer dependencies. CSS has no side effects outside the `:root` selector.

---

## Usage

### As an app consumer

Import the stylesheets once at the root of your app. Light tokens load by default; the dark stylesheet registers overrides keyed to `prefers-color-scheme: dark` and `[data-theme="dark"]`:

```ts
import '@arshad-shah/cynosure-tokens/css';        // light tokens
import '@arshad-shah/cynosure-tokens/css/dark';   // dark-mode overrides
```

From there, every CSS variable is available:

```css
.card {
  background: var(--cynosure-color-surface-1);
  padding: var(--cynosure-space-4);
  border-radius: var(--cynosure-radius-md);
  box-shadow: var(--cynosure-shadow-sm);
}
```

### As a JavaScript consumer

Tokens are also exported as typed objects for places CSS variables don't reach (canvas, React Native, animation values). The base palette is `baseTokens`; dark-mode overrides live in `darkTokens`:

```ts
import { baseTokens } from '@arshad-shah/cynosure-tokens';

chart.colors = [
  baseTokens.color.accent.solid,
  baseTokens.color.feedback.danger.solid,
  baseTokens.color.feedback.success.solid,
];
```

---

## Customising

Override any token at a scoping ancestor — the variables cascade like any other CSS custom property:

```css
[data-theme="brand"] {
  --cynosure-color-accent-solid: oklch(64% 0.18 284);
  --cynosure-color-accent-solid-hover: oklch(60% 0.18 284);
  --cynosure-radius-md: 12px;
}
```

See the [custom-themes guide](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/custom-themes.mdx) for the full token reference and scoping patterns.

---

## What's inside

- **Colours** — palette scales (`gray`, `blue`, `green`, `red`, `amber`, `violet`, `iris`) plus semantic aliases: `accent` (solid / soft / ring / onSolid + hover/active variants), `feedback` (danger, warning, success, info — each with the same role set), and `background` / `foreground` / `border` aliases for surfaces and text
- **Spacing** — quarter-step scale: `0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64`, plus the component aliases (`component-xs`, `-sm`, `-md`, `-lg`)
- **Typography** — font families, sizes, weights, line-heights, letter-spacing
- **Radius** — `none, xs, sm, md, lg, xl, 2xl, full`
- **Elevation** — shadow scale with ambient + directional layers
- **Motion** — duration and easing (cubic-bezier) tokens
- **Z-index** — layered scale for overlays, dropdowns, toasts, modals

---

## Links

- [Main repo](https://github.com/arshad-shah/cynosure)
- [Design tokens docs](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/design-tokens.mdx)
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
