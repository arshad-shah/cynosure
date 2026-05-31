---
'@arshad-shah/cynosure-react': patch
---

Fix overlay positioning flash, DatePicker calendar horizontal scroll, and
theme-blind hardcoded colors.

- **Popover & HoverCard**: position the floating surface with `top`/`left`
  instead of `transform: translate3d(...)`. The shared `popoverContent`
  entrance keyframe animates `transform`, and a running CSS animation overrides
  an element's inline `transform` for its whole duration — so the surface was
  painting at the (0,0) origin during the animation and snapping to the anchor
  when it ended. This is the same fix already applied to Tooltip.
- **DatePicker**: the calendar popover was pinned to `width: 18rem`, ~12px
  narrower than the month grid's intrinsic width, so `overflow: auto` surfaced a
  permanent horizontal scrollbar (and the fixed width couldn't fit the
  dual-month layout). It now sizes to the calendar via `width: fit-content`,
  still capped by `maxWidth` on narrow screens.
- **Theme-aware colors**: replaced hardcoded color literals that ignored the
  active theme with `color-mix(…)` over foundation tokens, so they adapt to
  dark/high-contrast themes. Affects the inset sheen on every form control
  (Input, Textarea, Select, …), the dismiss-button / Tag hover wash, and the
  ColorPicker area/slider thumb shadows.
