---
'@arshad-shah/cynosure-react': minor
---

Polish the `Switch` and add an async toggle flow.

- **Async `onCheckedChange`**: when the handler returns a `Promise`, the switch
  flips optimistically to the new state, shows the spinner while pending,
  **commits** on resolve, and **reverts** on reject — no manual `loading`
  wiring needed (the `loading` prop still works for externally managed spinners).
- **More visible border** on the track (a `border.strong` hairline) so the
  off state reads clearly on any surface.
- **Reworked geometry** (absolute, RTL-aware thumb): the resting thumb sits a
  balanced gap from the leading edge instead of hugging the border, the `sm`
  size is larger and better-proportioned, and the off thumb is no longer
  cramped.
