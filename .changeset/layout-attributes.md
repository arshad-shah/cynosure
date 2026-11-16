---
"@arshad-shah/cynosure": minor
---

Stack, Inline, Grid, GridItem, Container and Section take every event handler (pointer, keyboard, drag and drop, focus), any `data-*` attribute, `tabIndex`, `dir` and `lang`, on top of `id`, `role` and `aria-*`, and pass them to their element with the `ref`: a layout box can be a drop zone or a keyboard-reachable region without a wrapper `div`. Section now takes the same attribute set as the other layout primitives (it had only `id`, `role`, `aria-label` and `aria-labelledby`).
