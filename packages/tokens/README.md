# @arshad-shah/cynosure-tokens

> W3C DTCG design tokens for Cynosure UI — the CSS custom properties every component reads from.

Source of truth for colour, spacing, typography, radius, elevation, motion, and z-index across the Cynosure ecosystem. Tokens are authored as DTCG JSON and compiled by Style Dictionary to CSS custom properties, a TypeScript module, and platform outputs.

**See tokens applied across the component library, live:** [cynosure.arshadshah.com](https://cynosure.arshadshah.com)

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

Tokens are also exported as a typed object for places CSS variables don't reach (canvas, React Native, animation values):

```ts
import { tokens } from '@arshad-shah/cynosure-tokens';

chart.colors = [
  tokens.color.accent[500],
  tokens.color.danger[500],
  tokens.color.success[500],
];
```

---

## Customising

Override any token at a scoping ancestor — the variables cascade like any other CSS custom property:

```css
[data-theme="brand"] {
  --cynosure-color-accent-500: oklch(64% 0.18 284);
  --cynosure-radius-md: 12px;
}
```

See the [custom-themes guide](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/custom-themes.mdx) for the full token reference and scoping patterns.

---

## What's inside

- **Colours** — semantic scales (accent, neutral, danger, warning, success, info) plus surface, text, and border aliases
- **Spacing** — 8-point grid, `0` through `20`
- **Typography** — font families, sizes, weights, line-heights, letter-spacing
- **Radius** — none, sm, md, lg, xl, full
- **Elevation** — shadow scale with ambient + directional layers
- **Motion** — duration and easing (cubic-bezier) tokens
- **Z-index** — layered scale for overlays, dropdowns, toasts, modals

---

## Links

- [Storybook — tokens applied in context](https://cynosure.arshadshah.com)
- [Main repo](https://github.com/arshad-shah/cynosure)
- [Design tokens docs](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/design-tokens.mdx)
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
