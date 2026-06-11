---
"@arshad-shah/cynosure-react": minor
"@arshad-shah/cynosure-tokens": minor
"@arshad-shah/cynosure-themes": minor
---

Charts now follow the active Cynosure theme, and the full SwiftChart catalogue is exposed.

- **Live, token-driven theming.** Chart colours are resolved at runtime from a new `--cynosure-chart-*` custom-property contract (declared in `Chart.css.ts` as references to Cynosure tokens) instead of hard-coded hex. Charts now follow whatever theme is active — light, dark, `terminal`, `high-contrast`, or a consumer's own custom theme — and repaint when the theme changes. Override any slot (e.g. `--cynosure-chart-3`, or `--cynosure-chart-grid`) on an ancestor or via the chart's `style` prop. The static `cynosure-light` / `cynosure-dark` themes remain registered as an SSR/first-paint fallback, and an explicit `theme` prop still wins.
- **Tooltips themed.** The resolved theme now also drives SwiftChart's tooltip background, border, and text from Cynosure surface/border/foreground tokens.
- **12 new chart wrappers.** `GaugeChart`, `RadialBarChart`, `FunnelChart`, `HeatmapChart`, `CandlestickChart`, `BoxplotChart`, `BubbleChart`, `BulletChart`, `ComboChart`, `MarimekkoChart`, `NetworkChart`, and `SankeyChart` join the existing charts — every SwiftChart type is now exposed and pre-themed.
- **`tokens`:** adds a categorical `color.chart.1`–`color.chart.8` series palette (light + dark).
- **`themes`:** the `terminal`, `high-contrast`, and `high-contrast-dark` themes ship tuned chart palettes so series colours stay on-brand and accessible in each.
- A new `resolveChartTheme(element, scheme)` helper is exported for advanced/imperative use.
