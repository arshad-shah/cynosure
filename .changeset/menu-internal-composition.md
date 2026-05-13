---
'@arshad-shah/cynosure-react': patch
---

Rebuild `Menu` internally on top of Cynosure primitives — public API and
visual surface unchanged.

- `Menu` and `MenuGroup` layouts now use `Stack` / `Inline` instead of
  hand-rolled `display: flex` blocks.
- `MenuGroup` collapse is delegated to `Collapsible` (Radix), so
  `aria-expanded`, `aria-controls`, and `data-state` are wired automatically
  and stay in lockstep with the trigger.
- `MenuDivider` delegates to `Divider`, picking up consistent tone / spacing /
  dark-mode rules.
- `MenuItem`'s `badge` slot renders through `<Badge variant="ghost"
  colorScheme="neutral" size="xs">`, so menu badges follow the same
  size / shape / theming rules as every other badge in the library.
- Group bodies expose `role="group"` + `aria-labelledby` when a `label` is
  set, so screen readers announce the group as named.
- `MenuItem` `aria-disabled` is now always emitted alongside the native
  `disabled` attribute.
- Focus rings switched from a hand-rolled 2px box-shadow to the
  `vars.shadow.focusRing` token, matching `Link` / `Button`.
- Fixed `MenuItem asChild`: now uses the `Slot` + `Slottable` pattern (same as
  `Button`), so the consumer-provided element (e.g. a router `<a>`) becomes
  the item and `icon` / `badge` / `iconRight` render as siblings instead of
  being nested inside the label span.
