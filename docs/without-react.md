# Using Cynosure without React

Pages that don't run React (Astro pages, static sites, plain TypeScript apps) can still use Cynosure's tokens and icons. They do not get the components: those are React, because the components are what provide keyboard, focus and accessibility behaviour.

## Tokens

The quickest way is the default theme as plain CSS:

```html
<link rel="stylesheet" href="node_modules/@arshad-shah/cynosure/dist/styles/tokens.css" />
```

or, with a bundler, `import "@arshad-shah/cynosure/styles/tokens.css";`. Every `--cy-*` custom property is then available to your own CSS:

```css
.card {
  background: var(--cy-color-surface);
  color: var(--cy-color-ink);
  border-radius: var(--cy-radius-md);
  padding: var(--cy-space-4);
}
```

For your own accent, scale or palette, build the CSS from a theme with the React-free `@arshad-shah/cynosure/tokens` entry, at build time or in a small script:

```ts
import { createTheme, themeToCss } from "@arshad-shah/cynosure/tokens";

const css = themeToCss(createTheme({ accent: "#2f66b0", scale: "compact" }));
// write `css` to a file, or inline it in a <style> in the page head
```

With Vite (Astro uses Vite too), the adapter does this for you: see `docs/adapters.md`.

## Light and dark without a flash

`themeInitScript()` returns a tiny script that sets the saved colour mode before the first paint. Inline it in the `<head>` (not in browser extensions: their pages block inline scripts):

```astro
---
import { themeInitScript } from "@arshad-shah/cynosure/tokens";
---
<script is:inline set:html={themeInitScript({ key: "my-site-theme" })}></script>
```

## Icons

`iconToSvg` returns the same SVG markup as the React `Icon`. Load `@arshad-shah/cynosure/styles/icon.css` (or `styles.css`) so it is sized and coloured the same way.

```ts
import { iconToSvg, search } from "@arshad-shah/cynosure/icons";
import { github } from "@arshad-shah/cynosure/brands";

button.innerHTML = iconToSvg(search, { label: "Search" });
footer.innerHTML += iconToSvg(github, { size: 20, label: "GitHub" });
```

In Astro, render it into the page with `<Fragment set:html={iconToSvg(search)} />`. See `docs/icons.md` for the brand marks and how brands allow their marks to be used.

## Interactive pieces

Where a page needs a real control (a theme toggle, a form, a dialog), use the React component as an island (in Astro, `@astrojs/react` and a `client:` directive) inside `CynosureTheme`.
