# Theming

```ts
const theme = createTheme({
  accent: "#e8462e", // any hex, rgb(), hsl(), oklch()
  scale: "compact", // compact 0.875 · comfortable 1 · spacious 1.2 · or a number
  radius: 1, // multiplier on the Facet radius (0.3 × control height)
  font: { sans: "Hanken Grotesk, system-ui" },
  motion: "reduced", // or partial durations/easings
  tokens: { space: { "4": 10 } }, // any global token
  palettes: { dark: { bg: "#0f0e0c" } }, // any colour, per palette
  components: { button: { radius: "4px" } }, // any component token
  mode: "dark", // optional: fix the theme to one mode (see Named themes)
});
```

`createTheme` derives accent hover/active (OKLCH), soft and ring mixes, on-accent text with WCAG contrast ≥ 4.5:1, the code colours (`--cy-color-syntax-*`, keywords from the accent; see [Code editors](code-editors.md)) and eight chart series colours. Invalid colours or unsafe values throw `CynosureThemeError`.

Apply it: `<CynosureTheme theme={theme} mode="system">`, at build time with `themeToCss(theme)`, or in a shadow root with `styles.inline` plus `themeToCss(theme, ":host")`. Modes: `light | dark | system`; contrast: `normal | more | system`. `useColorMode({ storage })` persists the user's choice.

## Named themes

A theme people pick by name (Cynosure, Midnight, a plugin's theme) is a `ThemeDefinition`: a `ThemeInput` plus an `id` and a `name`, all plain JSON, so a plugin can ship one and an app can save one.

```tsx
import { createThemeRegistry } from "@arshad-shah/cynosure";

const themes = createThemeRegistry([
  { id: "cynosure", name: "Cynosure" }, // follows the colour mode
  { id: "paper", name: "Paper", mode: "light", accent: "#2563eb" },
  {
    id: "midnight",
    name: "Midnight",
    mode: "dark", // dark-only: the colour-mode switch does not flip it
    accent: "#7a5cff",
    palettes: { dark: { bg: "#05070d", surface: "#0b0f16", surfaceRaised: "#111827" } },
  },
]);

themes.register(JSON.parse(pluginJson)); // throws CynosureThemeError for bad input
<CynosureTheme theme={themes.get(id)?.theme} mode={mode}>
  …
</CynosureTheme>;
```

- `mode: "light" | "dark"` fixes a theme to one mode. Its light and dark palettes are the same (that mode's), so `themeToCss` and `themeProperties` emit no `light-dark()` pairs, and `CynosureTheme` sets that mode on its wrapper (and on nested wrappers) whatever `mode` it is given. Contrast still works: `more` shows the mode's contrast palette.
- `defineTheme(json)` checks one definition and returns `{ id, name, mode, definition, theme }`. It rejects, with `CynosureThemeError`, an unknown field, a value of the wrong type, an unknown token or palette, an unsafe value (the same central checks as `createTheme`), and a theme whose text does not read at 4.5:1 (ink on the background and surfaces, muted text on the surface, on-accent text on the accent) in any palette it shows.
- `createThemeRegistry(initial)` holds the themes an app offers: `register` (replaces a theme with the same id in place), `unregister`, `get`, `list` (a stable array until something changes) and `subscribe`, which fits `useSyncExternalStore(themes.subscribe, themes.list)` for a theme picker.
- `JSON.stringify(named.definition)` round-trips: `defineTheme(JSON.parse(text))` builds the same theme.

## Themes in code: canvas and charts

Canvas engines and chart libraries cannot read `var(--…)`. `useCynosureTheme()` returns the theme in force where it is called, resolved:

```tsx
const { theme, palette, colors, fontSize } = useCynosureTheme();
// palette: "light" | "dark" | "light-contrast" | "dark-contrast"
// colors: that palette as hex (color-mix() values worked out), fontSize: the type ramp in px
useEffect(() => addTheme("app", swiftChartTheme(theme, palette)), [theme, palette]);
```

It reads the nearest `CynosureTheme` (Cynosure's own theme, following the OS, when there is none) and re-renders when the theme, mode or contrast changes, including the OS setting a `system` mode follows. Pass the user's mode to `CynosureTheme` (from `useColorMode`) so the hook knows it.

Without React, `resolveColors(theme, palette)` gives the same colours.

### Series colours

Every palette has `seriesColors`: eight categorical colours for chart series, starting at the accent and turning around the hue wheel from it, so neighbouring series sit far apart. Each reads at least 3:1 (graphics contrast) on the background, surface and raised surface, and they stay distinguishable from each other; a unit test checks both in every palette for several accents. CSS gets them as `--cy-color-series-1` to `--cy-color-series-8`. A palette patch can replace them, all eight at once.

### swift-chart

`swiftChartTheme(theme, palette)` returns the theme object `@arshad-shah/swift-chart`'s `addTheme(name, theme)` takes (`bg`, `surface`, `grid`, `text`, `textMuted`, `axis`, `positive`, `negative`, `onAccent`, `colors`, `tooltipBg`, `tooltipBorder`, `tooltipText`), every value concrete. Cynosure does not depend on swift-chart; the shape is written out as `SwiftChartTheme`. It sits beside `monacoTheme` and `textMateTheme` and is in the React-free `@arshad-shah/cynosure/tokens` entry too.
