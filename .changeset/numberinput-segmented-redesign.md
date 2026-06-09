---
'@arshad-shah/cynosure-react': minor
---

**NumberInput — segmented redesign.** The vertical ▲/▼ stepper column is
replaced with a horizontal segmented control — `[ − ][ value ][ + ]` — three
raised segments inside a tinted track. This gives large, touch-friendly tap
targets (~44px at the default `md` size) and brings the component in line with
the library's other segmented controls.

- `variant` (`outline` / `filled` / `ghost`) now tints the track; the
  `− / value / +` structure is constant across variants.
- Sizes (`sm` / `md` / `lg`), `$`/`%` affixes, and the
  invalid / disabled / read-only states are all preserved.
- Stepper buttons render Lucide `Minus` / `Plus` icons and depress with an
  accent tint on press. Press-and-hold repeat (with acceleration and a
  touch-aware initial delay) comes from React Aria's `NumberField` and is
  always on. The mobile numeric keypad and locale-correct parsing are
  unchanged.
- New opt-in `clearOnLongPress` prop (default `false`): long-press the value
  segment (~500ms) to clear it — to `minValue` if set, otherwise empty.

Public props are a superset of before, so typical usage
(`<NumberInput value … />`) is source-compatible. The **rendered DOM and CSS
class names change**, so anyone who reached into NumberInput's internal markup
or class names (rather than the public API) will need to update; the
vertical-column layout is gone.
