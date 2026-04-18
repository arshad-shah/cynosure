# @arshad-shah/cynosure-themes

> Prebuilt theme stylesheets for Cynosure UI — drop-in imports that override the default tokens.

Each theme is a single CSS file that redefines Cynosure's design-token custom properties under a scoping selector. Import one at the root of your app and every component re-renders in that theme automatically.

---

## Install

```bash
pnpm add @arshad-shah/cynosure-themes
```

Requires [`@arshad-shah/cynosure-tokens`](https://www.npmjs.com/package/@arshad-shah/cynosure-tokens) already loaded — the themes override tokens, they don't replace them.

---

## Usage

Pick a theme and import its stylesheet. Order matters: themes must load **after** the base tokens so their overrides win the cascade.

```ts
import '@arshad-shah/cynosure-tokens/css';
import '@arshad-shah/cynosure-tokens/css/dark';
import '@arshad-shah/cynosure-themes/terminal';        // or…
import '@arshad-shah/cynosure-themes/high-contrast';
```

By default, the theme applies globally. Scope it to a subtree by setting `data-theme` on a wrapper element:

```tsx
<div data-theme="terminal">
  <Dashboard />
</div>
```

---

## Available themes

### `terminal`
```ts
import '@arshad-shah/cynosure-themes/terminal';
```
JetBrains Mono everywhere, phosphor-green accents on near-black surfaces. Designed for IDE- and CLI-adjacent UIs.

### `high-contrast`
```ts
import '@arshad-shah/cynosure-themes/high-contrast';
```
WCAG AAA contrast across every component, black-and-white with single-hue accents. For users who enable `prefers-contrast: more` or who ship in accessibility-critical environments.

---

## Rolling your own

A "theme" in Cynosure is just a CSS file that overrides token custom properties. To author one, copy the scaffold under `src/terminal/` or `src/high-contrast/` in the [main repo](https://github.com/arshad-shah/cynosure/tree/main/packages/themes/src) and change the token values. See the [custom-themes guide](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/custom-themes.mdx).

---

## Links

- [Main repo](https://github.com/arshad-shah/cynosure)
- [Theming overview](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/theming-overview.mdx)
- [Terminal theme recipe](https://github.com/arshad-shah/cynosure/blob/main/docs/foundations/terminal-theme-recipe.mdx)
- [Changelog](./CHANGELOG.md)

## License

MIT © [Arshad Shah](https://github.com/arshad-shah)
