# Build-tool adapters

Cynosure needs no plugin: import `@arshad-shah/cynosure/styles.css` (or per-component `styles/<name>.css`) and the components. For shadow roots use `@arshad-shah/cynosure/styles.inline` (`css` string or `createStyleSheet()`).

## Which stylesheets a component needs

A component's CSS is not always in a file of its own name: Inline's rules are in `stack.css`, Sheet needs `dialog.css`, Accordion `disclosure.css`, IconButton `tooltip.css`, Button's loading state `loading-dots.css`, and every component needs `base.css` (which also holds shared rules such as `.cy-visually-hidden`). Do not keep that list by hand:

- `@arshad-shah/cynosure/styles/manifest.json` maps each component to every file it needs, base first, worked out from the source imports at build time: `{ "Inline": ["base.css", "stack.css"], "Sheet": ["base.css", "icon.css", "button.css", "dialog.css", … ] }`. Add `styles/tokens.css` (the default tokens) or your theme.
- With the Vite or Astro adapter, `styles: "imports"` does it for you: every module that imports components from the package also imports the stylesheets they need.
- A unit test fails when a component renders a styled class that its manifest entry does not bring.

## Vite (`@arshad-shah/cynosure/vite`)

```ts
// vite.config.ts
import { cynosure } from "@arshad-shah/cynosure/vite";
export default { plugins: [cynosure({ theme: { accent: "#e8462e", scale: "compact" } })] };
```

```ts
// app entry
import "@arshad-shah/cynosure/styles.css";
import "virtual:cynosure/theme.css"; // the product theme, built at compile time
// extension content script / shadow root:
import css from "virtual:cynosure/inline"; // all CSS + theme as a string
```

Options: `theme` (any `createTheme` input; invalid input fails the build), `selector` (default `:root`/`:host`), `stylesheet` (override the compiled CSS path), `styles: "imports"` (add only the stylesheets the imported components need, from `styles/manifest.json`, plus `tokens.css` when no `theme` is given; then import `virtual:cynosure/theme.css` for a theme instead of `styles.css`).

## Astro (`@arshad-shah/cynosure/astro`)

Astro renders on the server, where `CynosureTheme target="document"` never runs. The integration themes the page in the HTML itself: the product theme as CSS on `:root`, Cynosure's stylesheet on every page, and the saved-mode script inline in `<head>`.

```js
// astro.config.mjs
import { cynosure } from "@arshad-shah/cynosure/astro";
export default {
  integrations: [cynosure({ theme: { accent: "#0f766e" }, initScript: { key: "nimaz-mode" } })],
};
```

```astro
---
// src/layouts/Base.astro
import { htmlAttributes } from "@arshad-shah/cynosure/astro";
---
<html lang="en" {...htmlAttributes({ mode: "system" })}>
```

Options: everything the Vite adapter takes, plus `styles` (default true: add `styles.css` to every page; `"imports"`: only what each page's components need) and `initScript` (default true; `false` for pages whose content security policy forbids inline scripts, or `themeInitScript` options, whose `key` must match ThemeToggle's `storageKey`). `htmlAttributes({ mode, contrast })` gives `<html>` the `data-cy-mode` (default `system`) and `data-cy-contrast` attributes the stylesheet switches on. Components still render as React islands where they need script; the theme does not.

**Contract for new adapters** (esbuild/extforge…): one factory export in `src/adapters/<tool>/`, zero runtime cost in the product bundle, the same virtual ids, a unit test, and a section here.

## Optional font

```ts
import "@arshad-shah/cynosure/fonts/hanken.css"; // Hanken Grotesk, variable weight, Latin subset, self-hosted (OFL)
```

It registers the font face and points `--cy-font-sans` and `--cy-font-display` at it. Without it Cynosure uses the system font stack (zero bytes).
