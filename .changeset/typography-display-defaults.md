---
'@arshad-shah/cynosure-react': patch
---

Fix `Kbd`, `Code` (block variant), `Link`, `Blockquote` (attribution), and
`List` (ordered/unordered + description) silently reverting to their UA
default `display` when the bundled stylesheet emitted a duplicated
`layoutPropsStyle` rule after their class. Each now drives `display` through
the same `--cynosure-lp-d-*` variable used by `Flex`/`Stack`/`Inline`/etc.,
so the per-primitive default survives the cascade and user `display="…"`
overrides still win via inline style.
