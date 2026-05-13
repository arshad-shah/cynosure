---
'@arshad-shah/cynosure-react': patch
---

Fix `color` and `grow` props on layout primitives clobbering each other.
Both were emitting to the same custom property (`--cynosure-lp-fg`), so
`<Box color="fg.muted" grow="1">` only applied whichever was emitted last.
`flex-grow` now uses `--cynosure-lp-grow-{bp}`; `color` keeps `--cynosure-lp-fg`.
