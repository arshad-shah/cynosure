---
'@arshad-shah/cynosure-react': minor
---

Polish `ColorPicker` into a fully-featured form component. Adds:

- `size="sm" | "md" | "lg"` — drives panel width, area height, slider
  thickness, thumb size, and channel-cell density, so the same component
  covers compact toolbars, default forms, and prominent design surfaces.
- `variant="popover" | "inline"` — popover stays the default; inline drops
  the trigger and renders the picker body in place inside a bordered surface.
- `alpha` — opt-in alpha slider; uses RAC's `defaultStyle` render-prop so the
  color gradient composes with a checker layer correctly.
- `swatches` + `onSwatchesChange` — controlled saved-color palette with a
  "save current" affordance (capped by `maxSwatches`).
- Segmented HEX / RGB / HSL toggle now drives **slot-based channel cells**
  instead of one text input: hex mode shows `#` + value, RGB/HSL split across
  one tiny numeric cell per channel (with alpha cell when enabled). Each cell
  is a Cynosure-styled well with a mono glyph + per-channel `ColorField`, so
  invalid input snaps back on blur and `aria-label` per channel is correct.
- `defaultFormat` — pick which format the toggle starts on.
- Browser eyedropper (`eyedropper`, default `true`), feature-detected via
  `window.EyeDropper`; copy-to-clipboard with a transient check icon — both
  now sit in a right-aligned toolbar next to the format toggle.
- SB area gets `cursor: crosshair`, area + slider thumbs get
  `cursor: grab` / `[data-dragging]` → `grabbing` for parity.

Internals now compose `IconButton`, `ToggleGroup`, `Inline`, `Text`,
`ColorSwatch`, and per-channel `ColorField`s instead of emitting raw DOM, so
token/style changes flow through the rest of the library. The existing
`children` escape hatch and all previous props are preserved.

Value props now also accept a string (e.g. `value="#6366F1"`) in addition to
a RAC `Color`, parsed internally.
