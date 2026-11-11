# Build-tool adapters

Cynosure needs no plugin: import `@arshad-shah/cynosure/styles.css` (or per-component `styles/<name>.css`) and the components. For shadow roots use `@arshad-shah/cynosure/styles.inline` (`css` string or `createStyleSheet()`).

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

Options: `theme` (any `createTheme` input; invalid input fails the build), `selector` (default `:root`/`:host`), `stylesheet` (override the compiled CSS path).

**Contract for new adapters** (esbuild/extforge, Astro…): one factory export in `src/adapters/<tool>/`, zero runtime cost in the product bundle, the same virtual ids, a unit test, and a section here.

## Optional font

```ts
import "@arshad-shah/cynosure/fonts/hanken.css"; // Hanken Grotesk, variable weight, Latin subset, self-hosted (OFL)
```

It registers the font face and points `--cy-font-sans` and `--cy-font-display` at it. Without it Cynosure uses the system font stack (zero bytes).
