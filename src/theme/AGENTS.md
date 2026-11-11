# src/theme

`CynosureTheme` (applies a theme to its own `display: contents` wrapper, or opt-in to `<html>` with `target="document"`) and `useColorMode` (persisted mode, pluggable sync or async storage, never throws).

- Never write to `<head>`/`<body>`, never inject `<style>`; properties go through React's style object (CSSOM, CSP-safe).
- Mode switching uses `data-cy-mode` + `color-scheme` + `light-dark()` tokens; contrast swaps the contrast palettes.
- Tests: `CynosureTheme.stories.tsx` (wrapper-only, nesting, document target cleanup, shadow root) and `tests/unit/color-mode.test.tsx`.
