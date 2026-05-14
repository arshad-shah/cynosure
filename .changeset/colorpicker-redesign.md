---
"@arshad-shah/cynosure-react": minor
---

**ColorPicker redesign** — distinctive hero-preview composition, theme-correct chrome, and an icon-only trigger.

- Adds a hero strip at the top of the popover/inline panel: preview chip (checker-backed for transparency) + bold hex + format-aware secondary readout that updates with the format toggle.
- Replaces hardcoded `2px solid white` thumb borders with `background.surface` so slider/area thumbs stay visible in dark and brand themes. All chrome now routes through `vars.color.*`, `vars.radius.*`, `vars.space.*`.
- Saved-colours grid gains an uppercase section label with `N of MAX` count, an inline `+` save tile (replaces the floating IconButton), and an `accent.solid` highlight on the active tile.
- New `label={null}` on the popover trigger renders an icon-only swatch button (default `label="Pick a color"` is unchanged — fully additive).
- Storybook gains `All sizes`, `Icon-only trigger`, and `Dark theme check` stories.

Public API is unchanged. Consumers passing custom `children` continue to work; the legacy `colorFieldClassName` re-export is retained and marked `@deprecated`.
