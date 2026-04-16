---
'@lumen/react': minor
'@lumen/tokens': patch
---

Phase 06 — typography.

`@lumen/react` gains the full text-rendering component set. Every one of them composes `Box` under the hood — none contain raw intrinsic JSX — and they all use the semantic `font.heading.*` / `font.body.*` composite tokens rather than re-declaring font sizes.

- **Components:** `Text`, `Heading` (with decoupled semantic `level` + visual `size`), `Code`, `Kbd`, `Link` (with `external` → safe `rel`/`target` + decorative icon), `Blockquote`, and the list family `List` / `OrderedList` / `ListItem` / `DescriptionList` / `DescriptionTerm` / `DescriptionDetails`. Each lives in its own folder and ships a dedicated per-component entry point (`@lumen/react/text`, `@lumen/react/heading`, …).
- **Responsive typography:** `size`, `weight`, and `align` accept `Responsive<T>` maps and propagate through cascading CSS custom properties so breakpoint overrides inherit from the nearest lower breakpoint — the same mobile-first pattern the layout primitives use.
- **Composite tokens in CSS:** `@lumen/tokens` now emits the pre-expanded `font.heading.*` and `font.body.*` composites as CSS custom properties (`--lumen-font-heading-1-size`, `--lumen-font-body-md-line-height`, …), which Phase 02 introduced but whose CSS output had been dropped by a filter bug in the expansion preprocessor (fixed here).
- **Shared recipe:** `typography/shared/shared.css.ts` centralises the styles every text component reuses — `align`, `italic`, `underline`/`strikethrough`, single-line truncate, multi-line clamp, and the body/heading size → CSS variable maps — so component `.css.ts` files stay tiny.
- **Build:** each typography component is listed in the package `exports` map, has a Node10-resolution sidecar `package.json`, and is wired as its own tsup entry to keep per-component imports tree-shakable.
