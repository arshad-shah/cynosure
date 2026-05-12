---
'@arshad-shah/cynosure-react': patch
---

Fix `position`/`top`/`right`/`bottom`/`left`/`width`/etc. on layout primitives
leaking onto descendants. Layout props are driven by CSS custom properties,
which inherit by default; setting `<Flex position="fixed" top="0">` on a
shell was silently applying the same `position: fixed; top: 0` to every
descendant, collapsing the whole subtree to one rectangle. The build now
emits `@property … { inherits: false }` for every layout var so each one is
element-scoped.

Also fixes the layout primitives' `display` defaults (`Flex`, `Stack`,
`Inline`, `Grid`, `Center`, `Section`) being silently reverted by duplicated
`layoutPropsStyle` emissions later in the bundled stylesheet. Display is now
driven through the shared `--cynosure-lp-d-*` variable so the per-primitive
default survives the cascade.
