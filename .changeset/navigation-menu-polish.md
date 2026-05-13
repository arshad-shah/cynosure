---
'@arshad-shah/cynosure-react': patch
---

`NavigationMenu`: fix layering bug, animate content panels even without a
shared viewport, and tighten visual chrome — public API unchanged.

- **Fix `z-index: NaN`.** `NavigationMenuContent` was emitting `z-index: NaN`
  (invalid; browsers rejected the declaration). Content panels effectively had
  `z-index: auto` and could disappear under sticky headers or sibling
  overlays. The CSS var is now passed through directly so the panel sits on
  the `--cynosure-z-dropdown` layer like the rest of the dropdown family.
- **Animate without a viewport.** Open/close animations were gated on
  `data-motion`, which Radix only emits when a `<NavigationMenuViewport>` is
  mounted. Panels without a viewport flashed open. The selectors now key off
  `data-state="open" | "closed"`, so both configurations animate.
- **Trigger sizing.** `ChevronDown` was rendering at its default 24 px,
  inflating the trigger to 41 px tall. Sized to 14 px; trigger settles to
  ~33 px with the chevron centered on the cap height.
- **Token-consistent focus.** Trigger / link focus rings replaced hand-rolled
  `0 0 0 2px accent.ring` with `vars.shadow.focusRing`, matching `Link`,
  `Button`, and the rest of the library.
- **Smooth hover.** Added `transition: background-color, color` (duration
  `vars.duration.fast`, suppressed under `[data-cynosure-reduced-motion]`) to
  trigger and link.
- **Focus on the panel.** `NavigationMenuContent` now shows a focus ring when
  it receives focus (Radix moves focus into the panel on open); keyboard users
  previously had no indicator on the panel itself.
