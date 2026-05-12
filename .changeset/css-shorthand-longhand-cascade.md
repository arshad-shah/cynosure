---
'@arshad-shah/cynosure-react': patch
---

Fix `padding`, `margin`, `overflow`, and `gap` props silently resolving to
zero on every layout primitive that composes `layoutPropsStyle`.

When the `@property` fix made layout vars non-inheriting, an unset var
started resolving to "invalid at computed value time" → revert to the
property's initial value. The shared `layoutPropsStyle` rule sets the
shorthand (`padding: var(--cynosure-lp-p-base)`) followed by every
longhand (`padding-inline`, `padding-top`, …) bound to its own var. When
a consumer set only `padding="8"`, the longhand vars were unset, each
longhand declaration reverted to 0, and clobbered the shorthand expansion.
`Grid`, `Flex`, `Inline` had the same bug for `gap` ↔ `column-gap` /
`row-gap`.

- Longhand declarations in `layoutPropsStyle` now fall back through the
  CSS shorthand hierarchy: `padding-top → padding-block → padding`,
  `padding-right → padding-inline → padding`, and the mirror for margin.
  `overflow-x` / `overflow-y` fall back to `overflow`.
- `Grid`, `Flex`, `Inline` drop their `gap` shorthand CSS rule entirely;
  the `gap` prop now writes both longhand vars from the component so the
  remaining `row-gap` / `column-gap` declarations always have a value to
  resolve to.
- `flex` shorthand vs `flex-grow` / `flex-shrink` / `flex-basis` longhands
  remains unresolved — the shorthand string ("1 0 auto") can't substitute
  as a fallback for the individual numeric longhands. Use one or the
  other on the same element for now; a follow-up will runtime-split
  `flex` into individual longhand var emissions.
