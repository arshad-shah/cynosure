---
"@arshad-shah/cynosure": minor
---

`useCynosureTheme()` gains `resolveColor(value, within?)`: any CSS colour value (a colour, `var(--x)` or a bare `--x`, `color-mix()`, `light-dark()`) resolved where the theme is painted, as `#rrggbb` or `#rrggbbaa` (`""` when it is no colour or unset). A new function comes with each palette, so canvas and chart code that lists it in an effect re-resolves a product's own colour roles built on Cynosure's when the mode or contrast changes.
