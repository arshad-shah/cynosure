# Architecture

```
src/tokens       schema → createTheme(input) → Theme → themeToCss / themeProperties
src/theme        CynosureTheme (applies a Theme to a subtree) · useColorMode
src/foundations  native elements live only here (ButtonBase, Icon, …)
src/components   composites built from foundations and other components
src/icons        Facet icon data, one module per icon
src/styles       base.css (modes, inner reset) · inline.ts (CSS string + CSSStyleSheet)
src/adapters     optional build-tool adapters (vite, astro)
tools/           build-css.ts (Lightning CSS) · cli (cy)
```

**Package:** one ESM package with one runtime dependency, `@arshad-shah/detent` (drag, reorder and resize; zero dependencies of its own), React `>=18 <20` peer (Preact via `preact/compat`). Vite library build with `preserveModules`, so consumers tree-shake per module. CSS is built separately: `dist/styles.css` (tokens + base + every component), `dist/styles/<name>.css`, `dist/styles/manifest.json` (each component's files, from its imports; `tools/style-manifest.ts`), and the same CSS as a string in `styles.inline`.

**Isolation:** prefixed classes (`cy-*`), data-attribute variants, component roots declaring their own reset properties, inner parts carrying `.cy-reset`, and `box-sizing` forced with `!important` (hosts often force it on `*`). Proven by the hostile-host stories.

**Theming:** the default tokens on `:where(:root,:host)` (`DEFAULT_SELECTOR` in `src/tokens/to-css.ts`); colours use `light-dark()`, modes switch `color-scheme`, contrast swaps palettes. `CynosureTheme` gives its own `.cy-theme` wrapper the theme's tokens as inline properties (`themeProperties`), and touches nothing else.

**Why not web components:** Chrome content scripts have no `customElements` registry, which would break in-page extension UI.
