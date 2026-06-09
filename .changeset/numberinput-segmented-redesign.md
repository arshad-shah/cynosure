---
'@arshad-shah/cynosure-react': minor
---

Redesign `NumberInput` as a segmented control and remove the native focus outline on pointer press across all clickable components.

**NumberInput** — the cramped vertical ▲/▼ stepper column is replaced by a horizontal segmented control, `[ − ][ value ][ + ]`, inside a tinted track. Large, touch-friendly targets (~44px tall at `md`), pressed-segment feedback, hold-to-repeat stepping (via React Aria's press-and-hold), and an opt-in `clearOnLongPress` to clear the value on a long-press. The public API is a superset of before — existing usage (`value`/`onChange`, `minValue`/`maxValue`/`step`, `formatOptions`, `prefix`/`suffix`, `size`/`variant`, invalid/disabled/read-only) is unchanged. **Breaking (visual/DOM only):** the rendered class names and DOM shape changed; consumers depending on internal NumberInput CSS classes or the old vertical-column layout will need updates.

**Global focus reset** — the browser's native (sharp, blue) focus outline is now suppressed on pointer presses (`:focus:not(:focus-visible)`), and the mobile tap-highlight is cleared on clickable elements. Keyboard `:focus-visible` rings are unchanged, so keyboard accessibility is preserved.
