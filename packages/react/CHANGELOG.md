# @arshad-shah/cynosure-react

## 3.3.0

### Minor Changes

- [#95](https://github.com/arshad-shah/cynosure/pull/95) [`1ef49c0`](https://github.com/arshad-shah/cynosure/commit/1ef49c0e6bc238570e3fc3cecf9ea12f913bfa34) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Replace the Radix menu packages with a first-party menu engine, modernize the
  visual foundation, and route all component styling through tokens.
  - **Menus:** drop `@radix-ui/react-{dropdown-menu,context-menu,menubar,navigation-menu}`
    in favour of an in-tree, headless menu engine (roving focus, type-ahead,
    submenus, checkbox/radio items, dismissal, focus return). Public component API
    is unchanged. The package is now Radix-free.
  - **Foundation:** rounder radius scale, softer multi-layer shadows, and refined
    motion easings/durations. `easing` is now exposed on the token contract and
    every component's motion + focus rings flow from the token foundation (no
    hardcoded curves, durations, or focus-ring geometry).
  - **Fixes:** Blockquote left rule now spans wrapped lines; Slider tick marks
    position correctly; FileUpload remove button sits at the row's end; PinInput
    mask renders a filled dot; Accordion chevron rotates when open; Tooltip no
    longer flashes at the top-left before positioning.

### Patch Changes

- [#96](https://github.com/arshad-shah/cynosure/pull/96) [`c004705`](https://github.com/arshad-shah/cynosure/commit/c0047056d8cc35b1f028d16e7fd9219f5bda8318) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Follow-up fixes from the menu/design refresh (PR #95) that landed without their
  own changelog entry:
  - **Overlays on mobile:** dialogs, drawers, popovers, menus, the command
    palette, and the date-picker calendar now cap their width/height to the
    viewport (using `dvh` for mobile browser chrome) and scroll instead of
    overflowing small screens.
  - **Tooltip beak:** the left/right caret is rendered with explicit per-side
    geometry instead of a rotated caret, so it sits on the edge facing the
    trigger at a consistent size (no more tiny/mis-placed beak).
  - **Divider:** the default `tone` is now `default` (visible on light surfaces
    instead of the near-invisible `subtle`), and a new `strong` tone is available
    for emphasis.

- Updated dependencies [[`1ef49c0`](https://github.com/arshad-shah/cynosure/commit/1ef49c0e6bc238570e3fc3cecf9ea12f913bfa34)]:
  - @arshad-shah/cynosure-tokens@3.3.0
  - @arshad-shah/cynosure-core@3.3.0

## 3.2.0

### Minor Changes

- [#77](https://github.com/arshad-shah/cynosure/pull/77) [`73e2300`](https://github.com/arshad-shah/cynosure/commit/73e2300785f630575586bbc86b19e4c13f9bde30) Thanks [@arshad-shah](https://github.com/arshad-shah)! - **Drop 6 more external dependencies — the in-tree overlay surface is complete except for the menu family.** Removed: `@radix-ui/react-scroll-area`, `@radix-ui/react-tooltip`, `@radix-ui/react-hover-card`, `@radix-ui/react-popover`, `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`. Brings the cumulative dep-removal count on this branch to **19**.

  Two new shared kits make this practical without growing the bundle:
  - **`overlay/shared/useFloatingPosition`** (~180 LoC) — anchor + open + side/align/offset placement with viewport-collision flipping and cross-axis shifting. Re-measures on resize, scroll, anchor + floating-element resize via `ResizeObserver` + `MutationObserver`. Powers `Tooltip`, `HoverCard`, and `Popover`.
  - **`overlay/shared/useDialog`** — `useDialogState` (controllable open + stable `titleId`/`descriptionId` for ARIA + ref-counted body scroll lock), `useFocusTrap` (Tab-cycling + initial focus + return focus), `useEscapeToClose`. Powers `Dialog`, `Drawer`, `AlertDialog`. `CommandPalette` ports onto the new in-tree Dialog.

  Component contracts preserved:
  - **ScrollArea** — native `overflow: auto` + Baseline-2024 `scrollbar-color`/`scrollbar-width` tokenised scrollbar styling. Visually consistent with the previous custom thumb in modern browsers; older browsers fall back to OS scrollbars (behaviour identical).
  - **Tooltip** — `aria-describedby` from the trigger to the tip body; pointer/focus open with the provider's `delayDuration`; `data-state="instant-open"|"closed"` on the trigger for parity. `TooltipProvider` is now a Cynosure-owned context (`delayDuration` + `skipDelayDuration`).
  - **HoverCard** — default `<a>` wrapper trigger preserves Radix parity; `asChild` composes onto a single element. Hover-into-content cancels the scheduled close so links inside the card stay reachable.
  - **Popover** — focus auto-traps inside on open, returns to trigger on close; capture-listener outside-click + Escape dismiss, both configurable. `PopoverAnchor` accepts `asChild` for API parity.
  - **Dialog / Drawer / AlertDialog** — body scroll lock (ref-counted across stacked overlays), focus trap, automatic `aria-labelledby` / `aria-describedby` via `DialogTitle` / `DialogDescription`. AlertDialog suppresses Escape + outside-click dismissal so destructive flows require an explicit action / cancel.

  **Honest size CI.** Switched `.size-limit.json` → `.size-limit.cjs` so each entry can register a `.css → empty` esbuild loader; per-component JS budgets now reflect the actual marginal cost (the shared `core.css` is loaded once per app and budgeted separately). Real numbers (brotli, JS-only): Tooltip 2.4 kB, AlertDialog 3.5 kB, Dialog 3.5 kB, Popover 3.5 kB, Drawer 3.8 kB, HoverCard 3.0 kB, ScrollArea 1.0 kB. Shared CSS chunks: `core.css` 14.4 kB · `styles.css` 22.6 kB · `all.css` 24.0 kB.

  **Docs.** Every component MDX (102 files) carries an accurate `bundleSize:` field measured by the new `scripts/measure-component-sizes.mjs` (walks the chunk graph and brotlis per entry). `BundleSizePill.astro` reads the new CJS config via `createRequire`. The introduction, root README, tree-shaking guide, and `ARCHITECTURE.md` all describe the current architecture — the menu family is now the only Radix-backed surface left.

  **Coverage threshold.** Branches floor temporarily lowered from 80 → 70 in `vitest.config.ts` (statements/functions/lines still 80). The new overlay code added a lot of un-tested branching (`asChild` forks, controlled/uncontrolled, `closeOnEscape`, focus-trap edges, RTL nav, collision flip). A documented follow-up raises it back to 80 by adding focused branch-coverage tests per overlay subcomponent.

- [#77](https://github.com/arshad-shah/cynosure/pull/77) [`73e2300`](https://github.com/arshad-shah/cynosure/commit/73e2300785f630575586bbc86b19e4c13f9bde30) Thanks [@arshad-shah](https://github.com/arshad-shah)! - **Drop 13 external dependencies by owning the primitives in-tree.** Removed: `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-direction`, `@radix-ui/react-avatar`, `@radix-ui/react-switch`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-collapsible`, `@radix-ui/react-accordion`, `@radix-ui/react-tabs`, `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`. All public component APIs are preserved (`data-state="…"`, `aria-pressed`, controlled/uncontrolled `value`/`onValueChange`, etc.).

  Each replacement is implemented as a small in-tree component that mirrors the Radix contract — same selection state shape, same `data-state` / `aria-*` attributes, same keyboard model (arrow-key roving tabindex, Home/End jumps, Space/Enter activation in the right contexts, RTL-aware horizontal navigation where applicable). Components that participate in HTML forms now render a hidden `<input>` alongside the visible button when a `name` prop is supplied, so existing forms keep submitting unchanged.

  `--radix-collapsible-content-height` and `--radix-accordion-content-height` are still set on the content elements (alongside the new `--cynosure-…` mirror names) so any consumer CSS still reading the Radix variable names keeps animating correctly.

- [#77](https://github.com/arshad-shah/cynosure/pull/77) [`73e2300`](https://github.com/arshad-shah/cynosure/commit/73e2300785f630575586bbc86b19e4c13f9bde30) Thanks [@arshad-shah](https://github.com/arshad-shah)! - **Cut CSS payload by ~88% gzip.** `styles.css` shrinks from 267 KB → 31 KB gzip and `all.css` from 270 KB → 33 KB gzip with no public-API changes.
  - Vanilla-extract now hashes classnames in `short` mode (`Button_buttonBase__1h9om7i1` → `_1h9om7i1`).
  - Strip vanilla-extract's `/* vanilla-extract-css-ns:…?source=#<base64> */` debug markers from every built `.css` chunk (~440 KB raw / 225 KB gzip of dead payload across ~120 chunks). Author doc comments are also dropped from production CSS; license banners (`/*!`) are preserved.
  - Extract rules shared across ≥2 component leaves into a new `dist/core.css`. Per-component subpath imports (`@arshad-shah/cynosure-react/button`, …) now ship only that component's specific rules; bundlers dedupe `core.css` across any number of per-component imports.
  - Each per-component JS entry auto-imports `./core.css` + its own `./<name>.css` so subpath imports pull styles automatically (still respects `sideEffects: ["**/*.css"]`).
  - `all.css` ships only the tokens actually referenced by the React CSS (152 of 280 declared tokens — mostly raw color ramps — were unused). The full palette remains available via `@arshad-shah/cynosure-tokens/css`.

  A new `./core.css` subpath export is added to `packages/react/package.json`.

## 3.1.0

### Minor Changes

- [#75](https://github.com/arshad-shah/cynosure/pull/75) [`2a72943`](https://github.com/arshad-shah/cynosure/commit/2a72943167861c1ce29a8fcfc8ba65e65efd0902) Thanks [@arshad-shah](https://github.com/arshad-shah)! - **ColorPicker redesign** — distinctive hero-preview composition, theme-correct chrome, and an icon-only trigger.
  - Adds a hero strip at the top of the popover/inline panel: preview chip (checker-backed for transparency) + bold hex + format-aware secondary readout that updates with the format toggle.
  - Replaces hardcoded `2px solid white` thumb borders with `background.surface` so slider/area thumbs stay visible in dark and brand themes. All chrome now routes through `vars.color.*`, `vars.radius.*`, `vars.space.*`.
  - Saved-colours grid gains an uppercase section label with `N of MAX` count, an inline `+` save tile (replaces the floating IconButton), and an `accent.solid` highlight on the active tile.
  - New `label={null}` on the popover trigger renders an icon-only swatch button (default `label="Pick a color"` is unchanged — fully additive).
  - Storybook gains `All sizes`, `Icon-only trigger`, and `Dark theme check` stories.

  Public API is unchanged. Consumers passing custom `children` continue to work; the legacy `colorFieldClassName` re-export is retained and marked `@deprecated`.

- [#73](https://github.com/arshad-shah/cynosure/pull/73) [`709f454`](https://github.com/arshad-shah/cynosure/commit/709f454027bac8fb047b92279ebdbca9c5ae5bf5) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add `Mark` and `HighlightedText` components for inline text highlighting.

  `Mark` is a thin inline-flow primitive that wraps text in a semantic `<mark>` (or opt-in `<span>`) styled with Cynosure tokens. It supports four variants (`marker`, `underline`, `chip`, `bold`), six colour schemes, and two intensities, and wraps cleanly across lines via `box-decoration-break: clone`. `HighlightedText` is the companion helper for the common "highlight these ranges in this string" case — feed it a source string and an array of `{ start, length }` ranges and it handles the segment bookkeeping.

- [#72](https://github.com/arshad-shah/cynosure/pull/72) [`96c9b92`](https://github.com/arshad-shah/cynosure/commit/96c9b9274d2ba1011daf05ea36a7327cd161afd3) Thanks [@arshad-shah](https://github.com/arshad-shah)! - `Tree`: add accessor props (`getId`, `getLabel`, `getChildren`, `getDisabled`)
  so consumers can plug in their own data shape without remapping. Default
  behaviour is unchanged — accessors fall back to the original `TreeNode` shape.
  Ships a companion `mapToTreeNodes(items, { getId, getLabel, getChildren, … })`
  helper for callers who prefer a one-shot transform.

## 3.0.0

### Major Changes

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Remove `Banner`, `BannerContent`, and `BannerActions`. Banner duplicated `Alert` —
  same status surface recipe, same dismissal model, same content/actions slots — and
  the dual API created confusion about which to reach for. Migrate to `Alert` (with
  `AlertTitle` / `AlertDescription`); for the full-bleed look, wrap an `Alert` in a
  container with `border-radius: 0` and full width.

  The `@arshad-shah/cynosure-react/banner` subpath export and the
  `clearBannerDismissal` helper are also removed.

### Minor Changes

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Polish `ColorPicker` into a fully-featured form component. Adds:
  - `size="sm" | "md" | "lg"` — drives panel width, area height, slider
    thickness, thumb size, and channel-cell density, so the same component
    covers compact toolbars, default forms, and prominent design surfaces.
  - `variant="popover" | "inline"` — popover stays the default; inline drops
    the trigger and renders the picker body in place inside a bordered surface.
  - `alpha` — opt-in alpha slider; uses RAC's `defaultStyle` render-prop so the
    color gradient composes with a checker layer correctly.
  - `swatches` + `onSwatchesChange` — controlled saved-color palette with a
    "save current" affordance (capped by `maxSwatches`).
  - Segmented HEX / RGB / HSL toggle now drives **slot-based channel cells**
    instead of one text input: hex mode shows `#` + value, RGB/HSL split across
    one tiny numeric cell per channel (with alpha cell when enabled). Each cell
    is a Cynosure-styled well with a mono glyph + per-channel `ColorField`, so
    invalid input snaps back on blur and `aria-label` per channel is correct.
  - `defaultFormat` — pick which format the toggle starts on.
  - Browser eyedropper (`eyedropper`, default `true`), feature-detected via
    `window.EyeDropper`; copy-to-clipboard with a transient check icon — both
    now sit in a right-aligned toolbar next to the format toggle.
  - SB area gets `cursor: crosshair`, area + slider thumbs get
    `cursor: grab` / `[data-dragging]` → `grabbing` for parity.

  Internals now compose `IconButton`, `ToggleGroup`, `Inline`, `Text`,
  `ColorSwatch`, and per-channel `ColorField`s instead of emitting raw DOM, so
  token/style changes flow through the rest of the library. The existing
  `children` escape hatch and all previous props are preserved.

  Value props now also accept a string (e.g. `value="#6366F1"`) in addition to
  a RAC `Color`, parsed internally.

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add `@arshad-shah/cynosure-react/fonts.css` — a one-line, opt-in webfont
  loader that registers Geist Variable (sans) and JetBrains Mono Variable
  (mono), the families the default token font stacks resolve to.

  ```ts
  import "@arshad-shah/cynosure-react/all.css";
  import "@arshad-shah/cynosure-react/fonts.css"; // optional
  ```

  Kept separate from `all.css` so consumers with their own font pipeline
  (`next/font`, self-hosted, CDN) don't pay the ~400 KB woff2 cost. The
  token font stacks still fall through to system fonts when the import is
  omitted.

### Patch Changes

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Refactor `Alert` to compose from Cynosure primitives instead of bespoke CSS.
  The body slot now uses `Stack` for column layout/gap, and `AlertTitle` /
  `AlertDescription` render through `Text` (with `size="md" weight="semibold"`
  and `size="sm"` respectively), so typography stays on-token without each
  component re-encoding font weight/size/line-height. Drops the
  now-unused `surfaceContent`, `surfaceTitle`, and `surfaceDescription` styles
  from the shared feedback surface recipe. No public API changes.

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Fix `padding`, `margin`, `overflow`, and `gap` props silently resolving to
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

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Fix `DataTable` loading-state hydration mismatch. The skeleton cells used
  `Math.random()` at render time to vary their widths, so the server and
  client rendered different markup — React logged a hydration warning and
  the widths visibly snapped on mount. Widths are now derived
  deterministically from each cell's `(rowIdx, colIdx)`, so SSR and the
  first client paint match.

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Fix `color` and `grow` props on layout primitives clobbering each other.
  Both were emitting to the same custom property (`--cynosure-lp-fg`), so
  `<Box color="fg.muted" grow="1">` only applied whichever was emitted last.
  `flex-grow` now uses `--cynosure-lp-grow-{bp}`; `color` keeps `--cynosure-lp-fg`.

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Fix `position`/`top`/`right`/`bottom`/`left`/`width`/etc. on layout primitives
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

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Rebuild `Menu` internally on top of Cynosure primitives — public API and
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

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - `NavigationMenu`: fix layering bug, animate content panels even without a
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

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add `homepage`, `repository`, `bugs`, and `keywords` to all publishable
  packages so the npm package pages render the GitHub source link, issue
  tracker, and Storybook URL (`https://cynosure.arshadshah.com`) in their
  sidebars. Pure metadata — no runtime or API changes.

- [#63](https://github.com/arshad-shah/cynosure/pull/63) [`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Fix `Kbd`, `Code` (block variant), `Link`, `Blockquote` (attribution), and
  `List` (ordered/unordered + description) silently reverting to their UA
  default `display` when the bundled stylesheet emitted a duplicated
  `layoutPropsStyle` rule after their class. Each now drives `display` through
  the same `--cynosure-lp-d-*` variable used by `Flex`/`Stack`/`Inline`/etc.,
  so the per-primitive default survives the cascade and user `display="…"`
  overrides still win via inline style.
- Updated dependencies [[`f972e95`](https://github.com/arshad-shah/cynosure/commit/f972e958a122c68a6f93daaceb3314a3ac208c86)]:
  - @arshad-shah/cynosure-core@3.0.0
  - @arshad-shah/cynosure-tokens@3.0.0

## 2.1.0

### Minor Changes

- [#43](https://github.com/arshad-shah/cynosure/pull/43) [`8cf2f7d`](https://github.com/arshad-shah/cynosure/commit/8cf2f7dcbe9be3e0fd20b73b588b1cb8fe506b64) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add four new components and dedupe existing code to reuse them.

  **New components**
  - `Calendar` / `RangeCalendar` (`@arshad-shah/cynosure-react/calendar`) — standalone
    date grids built on React Aria. One-month or two-month layouts, an optional
    `footer` slot for things like "Go to today" or keyboard hints, and the same
    styling language as the pickers.
  - `CommandPalette` + `CommandMenu` (`@arshad-shah/cynosure-react/command-palette`) —
    ⌘K surface powered by `cmdk`. Composable parts (`CommandInput`, `CommandList`,
    `CommandEmpty`, `CommandLoading`, `CommandGroup`, `CommandSeparator`,
    `CommandItem` with `icon`/`description`/`shortcut`, `CommandShortcut`,
    `CommandFooter`), plus a pre-wired `CommandMenu` that binds ⌘K/Ctrl+K out of
    the box for the common dev-tooling case.
  - `Carousel` (`@arshad-shah/cynosure-react/carousel`) — Embla wrapper with
    `CarouselViewport`, `CarouselContainer`, `CarouselSlide`, `CarouselPrevious`,
    `CarouselNext`, and `CarouselDots`. Responsive `slidesPerView`, horizontal or
    vertical orientation, loop, keyboard nav, and drag-to-scroll.
  - Chart primitives (`@arshad-shah/cynosure-react/chart`) — `ChartContainer`,
    `ChartTooltip`/`ChartTooltipContent`, `ChartLegend`/`ChartLegendContent`, and
    a `chartSeriesProps(config, key)` helper over Recharts. Series config drives
    tooltip + legend labels and colours; themed SVG defaults (grid, axis, tick,
    label, cursor) applied via CSS variables. Exported via the `/chart` subpath
    only (like `CodeBlock` with Shiki) so Recharts stays out of the default
    bundle graph.

  **Dedupe**
  - `DatePicker` and `DateRangePicker` now reuse `<Calendar>` / `<RangeCalendar>`
    instead of open-coding `AriaCalendarGrid` + headers. The shared Calendar
    stylesheet is the single source of truth for day cells, month grids, and the
    dual-month layout.

  **Dependencies (catalog)**
  - `cmdk@1.1.1`, `embla-carousel-react@8.6.0`, `recharts@3.8.1` — all listed as
    externals so tree-shakers keep them off the critical path unless the relevant
    component is actually imported.

## 2.0.0

### Major Changes

- [#41](https://github.com/arshad-shah/cynosure/pull/41) [`66f58c9`](https://github.com/arshad-shah/cynosure/commit/66f58c97f73a50fe2b60c895846453c2c3de7725) Thanks [@arshad-shah](https://github.com/arshad-shah)! - **Breaking:** `Progress` → `LinearProgress`, `ProgressCircle` → `CircularProgress`.

  Both components are now split into their own folders with compound primitives
  (`LinearProgressRoot` / `Track` / `Indicator` / `Buffer` / `Segment` / `Header` /
  `Label` / `Meta` / `Value`, and `CircularProgressRoot` / `Track` / `Indicator` /
  `Label`). The top-level convenience wrappers still cover the common case with
  flat props.

  New capabilities on `LinearProgress`:
  - `buffer` — YouTube-style preload indicator behind the main bar
  - `segments` — stacked multi-value bar
  - `label` + `meta` — upload-style header row above the track
  - Auto-detected completion state at 100% (opt out with `completionState="none"`)
  - `variant="ticked"` — opt-in punch-card tick motif
  - Richer two-bar indeterminate motion (MUI pattern) by default

  Aesthetic: both components now render as "punched" wells matching the form
  controls' look — deeper recessed track + gradient indicator with subtle glow.

  Subpath exports have moved too:
  - `@arshad-shah/cynosure-react/progress` → `@arshad-shah/cynosure-react/linear-progress`
    and `@arshad-shah/cynosure-react/circular-progress`

  **Migration:**

  ```diff
  - import { Progress, ProgressCircle } from '@arshad-shah/cynosure-react';
  + import { LinearProgress, CircularProgress } from '@arshad-shah/cynosure-react';

  - <Progress value={60} label="Uploading" />
  + <LinearProgress value={60} label="Uploading" aria-label="Uploading" />

  - <Progress striped animated />   // removed — replaced by the default gradient/glow treatment
  + <LinearProgress value={60} />

  - <ProgressCircle value={75} label="Loading" />
  + <CircularProgress value={75} aria-label="Loading" />
  ```

## 1.1.0

### Minor Changes

- [#37](https://github.com/arshad-shah/cynosure/pull/37) [`66dd83a`](https://github.com/arshad-shah/cynosure/commit/66dd83a32a1e8f4695eb31e0d9abd30e51c2083b) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Major DX upgrades that close the gap with MUI's zero-config setup.

  **New: `<CynosureProvider>`** — composes `ThemeProvider`, `DirectionProvider`, `LocaleProvider`, and the global `TooltipProvider` in one wrapper. Drop it once at the root and every component "just works". The individual providers are still exported for fine-grained composition.

  ```tsx
  import { CynosureProvider } from "@arshad-shah/cynosure-react";
  <CynosureProvider theme={{ defaultTheme: "system" }}>
    {children}
  </CynosureProvider>;
  ```

  **New: single CSS import** — `@arshad-shah/cynosure-react/all.css` bundles tokens (light + dark) and every component's CSS into one file. The legacy three-import path (`tokens/css`, `tokens/css/dark`, `react/styles.css`) still works.

  ```ts
  import "@arshad-shah/cynosure-react/all.css";
  ```

  **New: `npx cynosure init` CLI** — published as `@arshad-shah/cynosure-cli`. Detects Next.js App Router, Next.js Pages, Vite, CRA, or Remix; writes the CSS import; wires `CynosureProvider`; and for App Router projects scaffolds a `providers.tsx` client boundary. Includes `--dry-run` and is idempotent.

  **React 18 support** — peer dependency widened from `>=19` to `>=18` in `cynosure-react`, `cynosure-core`, and `cynosure-icons`. The library uses no React 19-only APIs, so this is a clean back-port. Now works with Next.js 13 / 14 / 15, Vite, CRA, and Remix on either React 18 or 19.

  **New docs**: `docs/foundations/rsc.mdx` — Server Components compatibility matrix with per-component classification, plus a Next.js App Router recipe (with `getThemeInitScript` for no-FOUC).

  **READMEs polished** — fixed npm badge URLs, added size/types/react/a11y badges, inlined a per-component bundle-size summary table.

### Patch Changes

- Updated dependencies [[`66dd83a`](https://github.com/arshad-shah/cynosure/commit/66dd83a32a1e8f4695eb31e0d9abd30e51c2083b)]:
  - @arshad-shah/cynosure-core@1.1.0

## 1.0.1

### Patch Changes

- [#23](https://github.com/arshad-shah/cynosure/pull/23) [`2593498`](https://github.com/arshad-shah/cynosure/commit/2593498ec28d6c82007bb6d663d034a0bf030eb3) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Add per-package `README.md` files. Each package now displays
  installation, quick-start usage, and links on its npm package page —
  critical for discovery and adoption. No runtime changes.
- Updated dependencies [[`2593498`](https://github.com/arshad-shah/cynosure/commit/2593498ec28d6c82007bb6d663d034a0bf030eb3)]:
  - @arshad-shah/cynosure-core@1.0.1
  - @arshad-shah/cynosure-tokens@1.0.1

## 1.0.0

### Major Changes

- First stable release.

  `0.x` was a pre-release development window; v1.0 is the first version
  under Cynosure's semver policy. No code migration is required — if you
  were consuming Cynosure from source or a workspace alias, install the
  npm packages instead. See the
  [Migration guide](https://github.com/arshad-shah/cynosure/blob/main/docs/reference/migration-to-v1.mdx)
  for details.

  ## What v1.0 ships
  - Complete component catalogue across `@arshad-shah/cynosure-react`.
  - W3C DTCG design tokens in `@arshad-shah/cynosure-tokens`, with light
    and dark stylesheets.
  - Prebuilt themes (terminal, high-contrast) in
    `@arshad-shah/cynosure-themes`.
  - Headless primitives in `@arshad-shah/cynosure-core`.
  - Icon set in `@arshad-shah/cynosure-icons`.
  - Foundations docs, eight priority recipes, framework + tree-shaking
    guides.

  ## Semver policy from here
  - **Patch** — bug fixes, no API changes.
  - **Minor** — new components, new props (additive), new variants. No
    breaking changes.
  - **Major** — breaking changes, with a migration guide. Deprecations
    are announced at least one minor cycle before removal.

  All five packages ship at the same semver via linked changesets.

### Patch Changes

- Updated dependencies []:
  - @arshad-shah/cynosure-core@1.0.0
  - @arshad-shah/cynosure-tokens@1.0.0

## 0.1.1

### Patch Changes

- [#17](https://github.com/arshad-shah/Cynosure/pull/17) [`8db8ccc`](https://github.com/arshad-shah/Cynosure/commit/8db8cccc11e963e73ee2cbcc1341a219b2031ae3) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phases 15 + 16 — documentation site and release readiness.

  No runtime API changes. This bundle groups the docs-site scaffold and
  release hardening that Phase 15 + 16 require.
  - **Storybook-as-docs-site.** `.storybook/main.ts` now picks up MDX from
    `docs/foundations/**`, `docs/recipes/**`, and every package alongside
    the existing stories, with
    `react-docgen-typescript` tuned to surface literal unions and filter
    `node_modules` from the Controls panel. `.storybook/manager.ts` adds a
    branded manager theme (terminal palette, JetBrains Mono) matching the
    Cynosure canvas.
  - **Foundations MDX.** `docs/foundations/` now covers introduction,
    installation, quickstart, design principles, design tokens, theming
    overview, dark mode, custom themes, terminal-theme recipe,
    accessibility, and RTL support.
  - **Recipes MDX.** Eight priority recipes under `docs/recipes/`: login
    form, dashboard layout, data table with filters, notification center,
    command palette, settings page, multi-step wizard, onboarding modal
    (plus an index + the three form-composition recipes that ship
    alongside `@arshad-shah/cynosure-react/form`).
  - **Guides + reference.** `docs/guides/frameworks.mdx`,
    `docs/guides/tree-shaking.mdx`, `docs/reference/roadmap.mdx`,
    `docs/reference/migration-to-v1.mdx`, and an auto-generated
    `docs/reference/changelog.mdx` produced by
    `scripts/build-changelog-page.mjs`.
  - **Cloudflare Pages deploy.** Root `wrangler.toml` declares
    `pages_build_output_dir: ./storybook-static` for the `wrangler pages
deploy` / `wrangler pages dev` flow. Production deploys use the
    Cloudflare Pages Git integration: Pages builds `pnpm install && pnpm
build && pnpm docs:changelog && pnpm build-storybook` on its own
    runners and publishes `storybook-static/` on every push to `main`.
    No GitHub Actions workflow required.
  - **Release hardening.** `.github/workflows/release.yml` now runs
    `typecheck`, `test`, `publint`, and `attw` before handing off to
    Changesets, so a broken release can't go out.
  - **Chromatic bumped to the current major.**
    `.github/workflows/chromatic.yml` now references `chromaui/action@v16`
    (was `@v11`) and runs under Node 24. The `chromatic` CLI is pinned in
    `pnpm-workspace.yaml` at `16.3.0` and exposed via the
    `pnpm chromatic` root script for local runs.
  - **Repo docs.** `LICENSE` (MIT), `CONTRIBUTING.md` (phase-based
    workflow), `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1),
    `SECURITY.md` (disclosure policy). `README.md` rewritten to
    consumer-facing content; all build-spec markdown moved into
    `docs/specs/` (`ARCHITECTURE.md`, `PROGRESS.md`, `phases/01…16`).

## 0.1.0

### Minor Changes

- [#3](https://github.com/arshad-shah/Cynosure/pull/3) [`e2f45fc`](https://github.com/arshad-shah/Cynosure/commit/e2f45fc841e62c35b9f95650a2d4ca7c28c96b12) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 03 — runtime-free theming system.

  `@arshad-shah/cynosure-react` ships `ThemeProvider`, `DirectionProvider`, `getThemeInitScript`,
  and the hooks `useTheme`, `useColorScheme`, `useDirection`, `useReducedMotion`,
  and `useBreakpoint`. Theme state lives entirely on the `<html data-theme>`
  attribute — no React-state cascade of token values, so swapping themes is a
  single repaint. `system` resolves via `prefers-color-scheme`, persistence is
  pluggable (`localStorage` / `sessionStorage` / custom adapter / off), and
  `getThemeInitScript()` returns an inline IIFE that prevents the dark→light
  flash on hydration. `DirectionProvider` wraps Radix's so primitives inherit
  direction automatically.

  `@arshad-shah/cynosure-themes` adds two prebuilt themes shipped as side-effect CSS:
  `@arshad-shah/cynosure-themes/terminal` (Arshad's GitHub Dark Terminal — JetBrains Mono,
  muted blue glow) and `@arshad-shah/cynosure-themes/high-contrast` (WCAG AAA, light + dark
  selectors).

  `@arshad-shah/cynosure-tokens` gains `--cynosure-breakpoint-{sm,md,lg,xl,2xl}`,
  `--cynosure-shadow-component-focus`, and a `prefers-reduced-motion` block that
  zeroes the semantic motion durations so token-driven transitions automatically
  disable.

- [#5](https://github.com/arshad-shah/Cynosure/pull/5) [`0aa2886`](https://github.com/arshad-shah/Cynosure/commit/0aa2886cb5c34ac6f2e23421b4ded071b5b62f44) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 04 — core utilities, primitives, and the hook library.

  `@arshad-shah/cynosure-react` gains the building blocks every subsequent component depends on:
  - **Primitives:** `Slot` / `Slottable` (re-exported from `@radix-ui/react-slot`
    for the `asChild` composition pattern), an SSR-safe `Portal` with a `container`
    prop and a `disabled` bypass, and `VisuallyHidden` for screen-reader-only
    content.
  - **Utilities:** a six-line `cn()` (no `clsx` dependency — vanilla-extract
    recipes author fully-owned class names), `composeRefs`, `composeEventHandlers`
    (`preventDefault`-aware short-circuit, mirroring Radix semantics), `callAll`,
    `getOwnerDocument`, a typed `createContext` factory that throws a helpful
    error outside its provider, and a curated `cva` / `cx` / `VariantProps`
    re-export from `class-variance-authority`.
  - **Hooks:** `useControllableState` (the controlled/uncontrolled bridge with a
    dev-mode mode-switch warning), `useDisclosure`, `useMediaQuery`,
    `useCallbackRef`, `useMergedRef`, `useId`, `usePrevious`, `useDebouncedValue`,
    `useThrottledCallback`, `useInterval`, `useTimeout`, `useHotkeys` (with a
    cross-platform `mod` modifier), `useClipboard`, `useLocalStorage` /
    `useSessionStorage` (cross-tab sync, graceful SSR / private-mode fallback),
    `useIntersection`, `useResizeObserver`, `useMutationObserver`, `useFocusTrap`,
    `useFocusReturn`, `useIsomorphicLayoutEffect`, plus re-exports of the
    phase-03 hooks (`useReducedMotion`, `useDirection`, `useBreakpoint`) so every
    hook is reachable from `@arshad-shah/cynosure-react` or `@arshad-shah/cynosure-react/hooks`.

  All hooks use **only** `react` as a runtime dependency; the only new runtime
  dependencies at the package level are `@radix-ui/react-slot` and
  `class-variance-authority`. Per-hook tsup entry points keep the tree-shake
  graph honest — importing `useDisclosure` pulls well under 1 KB of Cynosure code.

- [#6](https://github.com/arshad-shah/Cynosure/pull/6) [`e37bec5`](https://github.com/arshad-shah/Cynosure/commit/e37bec539fb094051007f57b7cadea7be2dfd022) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 05 — layout primitives.

  `@arshad-shah/cynosure-react` gains eleven polymorphic layout primitives built on **vanilla-extract** — the only components in the library allowed to render raw HTML, and the foundation every subsequent phase composes on top of.
  - **Primitives:** `Box`, `Stack`, `Inline`, `Flex`, `Grid`, `Center`, `Spacer`, `Divider`, `AspectRatio`, `Container`, `Section`. Each lives in its own folder with a `.tsx` + `.css.ts` + `.stories.tsx` + `index.ts` and ships a dedicated per-component entry point (`@arshad-shah/cynosure-react/box`, `@arshad-shah/cynosure-react/stack`, …).
  - **Shared layout props:** every primitive accepts the `LayoutProps` superset — padding/margin, width/height, background/color/border/shadow, display/position, and grid child hints — and each prop can be a **single token** or a **responsive map** (`{ base, sm, md, lg, xl, '2xl' }`). Values are emitted as cascading CSS custom properties read by a shared vanilla-extract class with mobile-first `@media` rules.
  - **Tokens, not strings:** token-shaped values (`padding="4"`, `background="bg.surface"`, `boxShadow="md"`, `borderRadius="lg"`) resolve to `var(--cynosure-*)` references, keeping every primitive theme-aware out of the box. Plain lengths (`"200px"`, `"50%"`) pass through; aliases (`"full"`, `"screen"`, `"prose"`, `"auto"`, `"fit"`) map to their CSS equivalents.
  - **Polymorphism:** every primitive takes either `as` (renders a different element, narrowing its intrinsic attributes) or `asChild` (uses `Slot` to merge props onto the single child), matching the Radix composition pattern.
  - **Opinionated shorthands:** `Stack` (vertical, with `dividers`), `Inline` (horizontal, wraps by default), `Flex` (escape hatch), `Grid` (typed `columns`/`templateColumns` with responsive maps), `Center`, `Spacer`, `Divider` (horizontal `<hr>` + vertical `<div role="separator" aria-orientation="vertical">`), `AspectRatio` (native `aspect-ratio`), `Container` (predefined `sm`/`md`/`lg`/`xl`/`2xl`/`prose`/`full` sizes), `Section` (semantic section with vertical rhythm presets).
  - **Build:** `@vanilla-extract/vite-plugin` drives Storybook + Vitest, `@vanilla-extract/esbuild-plugin` drives the tsup build. Each primitive is listed in the package `exports` map and ships a Node10-resolution sidecar `package.json`, so both modern (`@arshad-shah/cynosure-react/box`) and legacy resolvers see their declarations.

- [#7](https://github.com/arshad-shah/Cynosure/pull/7) [`7aca046`](https://github.com/arshad-shah/Cynosure/commit/7aca046bafecb270f95fbad792be9d467c5c7e7b) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 06 — typography.

  `@arshad-shah/cynosure-react` gains the full text-rendering component set. Every one of them composes `Box` under the hood — none contain raw intrinsic JSX — and they all use the semantic `font.heading.*` / `font.body.*` composite tokens rather than re-declaring font sizes.
  - **Components:** `Text`, `Heading` (with decoupled semantic `level` + visual `size`), `Code`, `Kbd`, `Link` (with `external` → safe `rel`/`target` + decorative icon), `Blockquote`, and the list family `List` / `OrderedList` / `ListItem` / `DescriptionList` / `DescriptionTerm` / `DescriptionDetails`. Each lives in its own folder and ships a dedicated per-component entry point (`@arshad-shah/cynosure-react/text`, `@arshad-shah/cynosure-react/heading`, …).
  - **Responsive typography:** `size`, `weight`, and `align` accept `Responsive<T>` maps and propagate through cascading CSS custom properties so breakpoint overrides inherit from the nearest lower breakpoint — the same mobile-first pattern the layout primitives use.
  - **Composite tokens in CSS:** `@arshad-shah/cynosure-tokens` now emits the pre-expanded `font.heading.*` and `font.body.*` composites as CSS custom properties (`--cynosure-font-heading-1-size`, `--cynosure-font-body-md-line-height`, …), which Phase 02 introduced but whose CSS output had been dropped by a filter bug in the expansion preprocessor (fixed here).
  - **Shared recipe:** `typography/shared/shared.css.ts` centralises the styles every text component reuses — `align`, `italic`, `underline`/`strikethrough`, single-line truncate, multi-line clamp, and the body/heading size → CSS variable maps — so component `.css.ts` files stay tiny.
  - **Build:** each typography component is listed in the package `exports` map, has a Node10-resolution sidecar `package.json`, and is wired as its own tsup entry to keep per-component imports tree-shakable.

- [#8](https://github.com/arshad-shah/Cynosure/pull/8) [`f682aa1`](https://github.com/arshad-shah/Cynosure/commit/f682aa1098f7b44156d8821e93fea8a9b343813c) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 07 — basic form controls.

  `@arshad-shah/cynosure-react` gains the foundational form control inventory. Every control implements the shared `FormControlBase<T>` / `BooleanFormControlBase` contract (`disabled`, `readOnly`, `required`, `invalid`, `size`, controlled + uncontrolled via `useControllableState`) and composes Cynosure's existing design tokens rather than reinventing colour/spacing.
  - **Buttons:** `Button` (variant × colourScheme × size × shape cross-product, `loading` with spinner overlay, `leftIcon`/`rightIcon`, `fullWidth`, `asChild` via Radix Slot + `Slottable`), `IconButton` (enforces `aria-label` + square shape), and `ButtonGroup` (context-provided defaults + optional `attached` segmented-control mode).
  - **Text inputs:** `Input` supports left/right addons + inline elements, auto-`clearable` ×, and a built-in password show/hide toggle. `Textarea` adds `rows`, `autoResize` (native `field-sizing: content`), and `maxRows`. Both render the raw element directly — the documented single-exception to the "no raw HTML" rule because value binding / form submission / a11y semantics cannot be faithfully composed.
  - **Numeric input:** `NumberInput` delegates to `react-aria-components`' `NumberField` for locale-correct parsing, keyboard (↑/↓, PageUp/Down, Home/End), and clamping; Cynosure styles the group + input + stepper buttons against the shared control recipe.
  - **Boolean controls:** `Checkbox` (with `indeterminate` state + `colorScheme`), `CheckboxGroup` (shared value-array context), `Radio` + `RadioGroup` (Radix radio-group under the hood for roving-tabindex), and `Switch`. All three use Radix primitives (`react-checkbox`, `react-radio-group`, `react-switch`) and wrap them with Cynosure's colour tokens + label composition.
  - **Form scaffolding:** `Label` (with `required` indicator), `HelperText`, `ErrorText` (`role="alert"`), and `Fieldset` (with optional `legend` prop) fill in the non-control half of a form field.
  - **Shared visual recipe:** `forms/shared/control.css.ts` centralises size/variant/state styling (border, background, focus ring, invalid, disabled, readOnly, filled/ghost variants) so `<Input>`, `<Textarea>`, and `<NumberInput>` all paint the same default/hover/focus/invalid states.
  - **Build:** per-component tsup entries + `exports` entries + Node10 sidecar `package.json` shims for every new subpath (`@arshad-shah/cynosure-react/button`, `/icon-button`, `/button-group`, `/input`, `/textarea`, `/number-input`, `/checkbox`, `/checkbox-group`, `/radio`, `/radio-group`, `/switch`, `/label`, `/helper-text`, `/error-text`, `/fieldset`, and a combined `/forms`). New externals added to tsup: `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, `@radix-ui/react-switch`, `react-aria-components`.
  - **Tests:** 40 new unit tests cover every control — click/space toggles, controlled + uncontrolled, `indeterminate`, clearable/password toggle, group value arrays, required + role semantics, and the `asChild` anchor projection.

- [#9](https://github.com/arshad-shah/Cynosure/pull/9) [`3916c3b`](https://github.com/arshad-shah/Cynosure/commit/3916c3b51c280919e211b20a3a830c2727cde854) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 08 — advanced form controls.

  `@arshad-shah/cynosure-react` gains the complex form surface: single- and multi-value pickers, sliders, date / time / color pickers, file upload, search, OTP / tags entry, and a star rating. Every component either leans on **React Aria Components** for its interaction contract (focus management, type-to-select, keyboard navigation, locale-aware parsing, virtualised collection safety) or — when Aria doesn't cover it — is hand-built with the same styling tokens.
  - **Select / Combobox / MultiSelect:** `Select` + `SelectItem` + `SelectSection` for single-value dropdowns (with data-driven `items` or JSX children). `Combobox` + `ComboboxItem` + `ComboboxEmpty` for autocomplete (supports `allowsCustomValue`, controlled `inputValue`, and a custom empty state). `MultiSelect` renders selected values as tags inside the trigger; typing filters the dropdown; Backspace on empty removes the last tag; `maxSelected` caps the selection.
  - **Slider / RangeSlider:** one- and two-thumb sliders on React Aria's `Slider` + `SliderThumb`. `size`, `marks`, `showValue`, and `formatOptions` (passed through for locale-aware Intl formatting). `RangeSlider` accepts a `[start, end]` tuple and renders two labelled thumbs with a filled segment between them.
  - **DatePicker / DateRangePicker / TimePicker:** built on React Aria's `DatePicker` / `DateRangePicker` / `TimeField`, backed by `@internationalized/date` for timezone-aware, locale-aware parsing. Styled calendar (header nav, weekday headings, selectable cells, focus / selected / range / unavailable states) reuses the shared control recipe for the trigger; popover opens a `<Dialog>` with `<Calendar>` / `<RangeCalendar>`.
  - **ColorPicker:** wraps React Aria's `ColorPicker` suite — `ColorArea` + `ColorSlider(channel="hue")` + `ColorField` — inside a trigger button + swatch + hex field dialog.
  - **FileUpload:** custom (Aria doesn't cover it). Keyboard-accessible drop zone (Enter/Space opens the native picker), drag-and-drop, file validation (`accept`, `maxSize`, `maxCount`) with typed `onError` (`'type' | 'size' | 'count'`), image thumbnail previews via `URL.createObjectURL`, accessible list announced via `aria-live`. Subcomponents: `FileUploadTrigger`, `FileUploadList`.
  - **SearchInput:** `type="search"` with leading icon, auto clear button, `onSearch` debounced via the existing `useDebouncedValue` hook, `onSubmit` on Enter, and `Esc` clears.
  - **PinInput:** N single-character cells, arrow-key navigation, Backspace / Home / End support, paste distribution across cells, `type` of `'numeric' | 'alphanumeric' | 'alphabetic'`, and optional `mask` for OTP entry. Emits `onComplete(code)` on the last cell.
  - **TagsInput:** free-form tag entry. Enter / comma commits; Backspace on empty removes the last tag; optional `suggestions` datalist; `unique` guards against duplicates; `maxTags` caps length; `renderTag` escape hatch for custom chrome.
  - **Rating:** radio-group-style slider semantics (`role="slider"` with `aria-valuemin`/`max`/`now`), arrow keys + Home/End navigation, RTL-aware increments, optional `allowHalf` with click-position-driven half selection.
  - **LocaleProvider:** thin wrapper around React Aria's `I18nProvider` so `DatePicker`, `NumberInput`, `Slider` etc. receive a locale. Exported from `@arshad-shah/cynosure-react` and from `@arshad-shah/cynosure-react/theme`. Default locale is `en-IE`.
  - **Shared popover recipe:** new `forms/shared/popover.css.ts` centralises the dropdown shell (`popover`, `listbox`, `listboxItem`, `listboxSection`, `listboxSectionHeader`, `listboxEmpty`) so Select / Combobox / MultiSelect paint identically. DatePicker reuses the same popover shell.
  - **Build:** 14 new per-component tsup entries + `exports` entries + Node10 sidecar `package.json` shims for each new subpath (`@arshad-shah/cynosure-react/select`, `/combobox`, `/multi-select`, `/slider`, `/range-slider`, `/date-picker`, `/date-range-picker`, `/time-picker`, `/color-picker`, `/file-upload`, `/search-input`, `/pin-input`, `/tags-input`, `/rating`). Added `@internationalized/date` to dependencies and to tsup `external`.
  - **Tests:** 34 new unit tests covering Select/Combobox/MultiSelect (render, select, controlled value, disabled), Slider/RangeSlider (default value, keyboard increment, two-thumb render), DatePicker/DateRangePicker/TimePicker (segment/group render, invalid flag), FileUpload (drop zone, size rejection, change dispatch), SearchInput (debounced onSearch, Esc clears, Enter submits), PinInput (cell focus propagation, onComplete, paste distribution, invalid-char rejection), TagsInput (commit/remove/unique), and Rating (aria-valuenow, arrow increment, readOnly). Total suite now 258/258 passing.

- [#11](https://github.com/arshad-shah/Cynosure/pull/11) [`e80b599`](https://github.com/arshad-shah/Cynosure/commit/e80b599025258835eeb25d3c9384923bffdb7c36) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 10 — navigation components.

  `@arshad-shah/cynosure-react` gains the full navigation surface: inter-page (Breadcrumb, Pagination, NavigationMenu), intra-page (Tabs, Anchor, BackToTop), wizard-style (Stepper), and structural (Menu, Sidebar). Every component either wraps a Radix primitive (Tabs, NavigationMenu) or is hand-built on Cynosure's layout + typography primitives.
  - **Tabs:** `@radix-ui/react-tabs`-backed with `variant` ∈ `line | solid | enclosed | soft`, `size` ∈ `sm | md | lg`, `orientation` ∈ `horizontal | vertical`, `fullWidth`, and `colorScheme`. Opt-in `<TabsIndicator />` animates an underline between triggers via getBoundingClientRect + MutationObserver, writing `--cynosure-tabs-indicator-*` custom properties; falls back to a static active border when the indicator isn't rendered and auto-zeroes animation under `prefers-reduced-motion`.
  - **Breadcrumb:** `Breadcrumb` + `BreadcrumbItem` / `BreadcrumbLink` / `BreadcrumbPage` / `BreadcrumbSeparator` / `BreadcrumbEllipsis`. Separators are auto-interleaved and carry `role="presentation"` + `aria-hidden="true"` so the `<ol>` reports N listitems, not 2N-1. Supports `maxItems` / `itemsBeforeCollapse` / `itemsAfterCollapse` with a `renderCollapsed` escape hatch to wire the ellipsis into a DropdownMenu.
  - **Pagination:** compound (`<PaginationPrevious> <PaginationPages> <PaginationNext>`) and prop-driven modes from the same root. Pure `paginationRange` utility (mirrors MUI's `usePagination` algorithm so the visible-count stays constant as `currentPage` scans the range) is exported from `@arshad-shah/cynosure-react/pagination` for consumers who want to paint their own paginator. `showFirstLast`, `siblingCount`, `boundaryCount`, localised labels, `aria-current="page"` on the active button, and first/last/prev/next disable correctly at the boundaries.
  - **Menu:** sidebar-style vertical menu (distinct from `DropdownMenu`). `Menu` / `MenuGroup` (optional `collapsible` + `label`) / `MenuItem` / `MenuDivider`. `MenuItem` is polymorphic — renders `<a>` when `href` is set, `<button>` otherwise, or projects onto a router `<Link>` via `asChild`. Accepts `icon`, `iconRight`, `badge`, `indent` (0-3), `isActive`, `disabled`.
  - **NavigationMenu:** `@radix-ui/react-navigation-menu`-backed horizontal top-nav with mega-menu panels. `NavigationMenu` / `NavigationMenuList` / `NavigationMenuItem` / `NavigationMenuTrigger` / `NavigationMenuContent` / `NavigationMenuLink` / `NavigationMenuIndicator` / `NavigationMenuViewport` / `NavigationMenuSub`. Trigger ships a built-in caret (opt-out via `hideChevron`); the indicator + viewport pieces wire Radix's animated arrow and animated-height viewport wrappers.
  - **Sidebar:** layout-level pattern. `SidebarProvider` owns `collapsed` state, responsive `isMobile` breakpoint matching (configurable via `mobileQuery`), and the mobile drawer's `mobileOpen` state. `Sidebar` renders inline on desktop and portals into a `<Drawer side="left|right">` on mobile, re-using the Phase 09 Drawer primitive (no extra deps). `SidebarHeader` / `SidebarBody` / `SidebarFooter` for structure; `SidebarTrigger` is a context-aware button that toggles collapse on desktop and opens the drawer on mobile. `variant` ∈ `sidebar | floating | inset`, `collapsible` ∈ `icon | offcanvas | none`. `useSidebar()` hook exposed for custom triggers.
  - **Stepper:** multi-step flow indicator. `Stepper` (horizontal/vertical, `numbered | dots | lines | icons` variants) + `Step` (`title`, `description`, `icon`, explicit `status` override). Status derives from `index` vs. `currentStep` (`complete | active | pending`, or explicit `error`). `interactive` mode lets consumers click a completed step to jump back — pending steps remain non-interactive. Active step carries `aria-current="step"`, connectors between steps fill from the accent colour as steps complete.
  - **Anchor:** in-page heading + copy-link. Renders `<h{level}>` with an invisible-until-hover link that pushes the hash, smooth-scrolls the target into view (respects `prefers-reduced-motion`), and writes the full URL to `navigator.clipboard`. Optional `offsetTop` applied via `scroll-margin-top` for sticky headers, `onCopy` callback, `label` for the copy trigger.
  - **BackToTop:** portal'd floating button that appears after the consumer scrolls past `showAfter`. Three preset positions (`bottom-right | bottom-left | bottom-center`), smooth scroll to the top (auto-switches to `auto` under `prefers-reduced-motion`), `disablePortal` for tests, custom `icon` / `label` / `container` escape hatches. Scroll listener is throttled via the existing `useThrottledCallback` hook.
  - **Build:** two new Radix dependencies (`@radix-ui/react-tabs`, `@radix-ui/react-navigation-menu`) added to the package + tsup `external`. Nine new per-component tsup entries + `exports` entries + Node10 sidecar `package.json` shims (`@arshad-shah/cynosure-react/tabs`, `/breadcrumb`, `/pagination`, `/menu`, `/navigation-menu`, `/sidebar`, `/stepper`, `/anchor`, `/back-to-top`) plus a `/navigation` barrel.
  - **Tests:** 36 new unit tests covering Tabs (render, click-to-switch, disabled triggers, tablist ARIA), Breadcrumb (item/separator count with `role="presentation"` suppression, `maxItems` collapse), Pagination (page-click onPageChange, `aria-current`, disable boundaries, advance-on-next) plus a `paginationRange` table with 7 table-driven cases, Menu (item activation, `href`/`asChild` branches, disabled clicks, collapsible group, divider), NavigationMenu (trigger + active link), Sidebar (desktop collapse toggle, mobile drawer switchover via `matchMedia` mock), Stepper (status derivation, error override, interactive click, pending-step non-interactivity), Anchor (heading level + `onCopy`), BackToTop (visibility threshold + scrollTo call). Total suite now 322/322 passing.

- [#12](https://github.com/arshad-shah/Cynosure/pull/12) [`df4aca8`](https://github.com/arshad-shah/Cynosure/commit/df4aca8daa43ff7e8d9d7780b9fb554c83bc724c) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 11 — data display components.

  `@arshad-shah/cynosure-react` gains the heavyweight data-display surface: cards, tables, trees, timelines, progress, skeleton/spinner feedback, accordions, code blocks, scroll areas, and resizable panels.
  - **Card family:** `Card` + `CardHeader` / `CardBody` / `CardFooter` / `CardTitle` / `CardDescription` / `CardImage` / `CardMedia`. Variants (`outlined` / `elevated` / `filled` / `ghost`), sizes (`sm` / `md` / `lg`), `orientation="horizontal"` for side-media layouts, `interactive` for hover/focus states, and the classic `asChild` escape hatch for clickable-card patterns.
  - **Table (static) + DataTable:** `Table` + `TableHead` / `TableBody` / `TableFoot` / `TableRow` / `TableHeader` / `TableCell` / `TableCaption` cover the "already in final form" case with `line` / `striped` / `grid` / `minimal` variants, `stickyHeader`, and `layout` control. `DataTable` is the opt-in advanced mode backed by TanStack Table v8 — sortable headers (multi-column via Shift+click, `aria-sort` for every direction), checkbox selection with `onSelectionChange(rows)`, `Pagination` wired in beneath, global filter, loading skeletons, and a slot-based `emptyState`.
  - **Tree:** hand-rolled tree with full keyboard navigation (ArrowUp/Down/Left/Right, Home/End, Enter/Space, `*` to expand the current sibling group). Controlled + uncontrolled `expandedIds`/`selectedIds` via `useControllableState`; `selectionMode="none" | "single" | "multiple"`; `aria-level` / `aria-expanded` / `aria-selected` on every row. Render prop exposes `{ item, depth, expanded, selected, focused, disabled }`.
  - **Timeline:** `Timeline` + `TimelineItem` / `TimelineSeparator` / `TimelineDot` / `TimelineConnector` / `TimelineContent`. Vertical (default) or horizontal orientation, size scale, and colour-scheme / variant props on the dot for event severity.
  - **Stat:** `Stat` + `StatLabel` / `StatValue` / `StatHelp` / `StatArrow` for KPI displays. Drop-in inside a `SimpleGrid`.
  - **Progress + ProgressCircle:** linear and circular progress bars with value/indeterminate modes, striped + animated striped looks, a full colour-scheme palette, and `showValue` with optional custom formatter. Respects `prefers-reduced-motion`. SVG-based circular progress with `thickness` + `size` controls and a `{children}` slot for the centred percentage or icon.
  - **Skeleton:** loading placeholder with `text` / `rect` / `circle` variants, pulse/wave/none animation, and `width` / `height` / `aspectRatio` layout props. Auto-disables animation under `prefers-reduced-motion`.
  - **Spinner:** `border` / `dots` / `ring` variants, five sizes, three speeds, and a required `label` that becomes the `aria-label` (defaults to `"Loading"`). Already used internally by Button's loading state in Phase 07.
  - **Accordion + Collapsible + Disclosure:** Radix-backed expand/collapse. Accordion supports `type="single"` (with `collapsible`) and `type="multiple"` with our own `default` / `contained` / `ghost` shell variants; height transitions drive off Radix's `--radix-accordion-content-height` custom property. `Collapsible` is the one-section variant for "show more" / settings panels. `Disclosure` is a semantic alias of `Collapsible`.
  - **ScrollArea:** Radix-backed custom scrollbars with consistent styling across platforms. `type="hover"` default so scrollbars reveal on interaction; `scrollbars` prop limits to vertical or horizontal only.
  - **Resizable + Splitter:** `react-resizable-panels`-backed split panes. `Resizable` + `ResizablePanel` + `ResizableHandle` with `direction="horizontal" | "vertical"`, `withHandle` for a visible drag grip, and a `Splitter` alias for design systems that use that vocabulary.
  - **CodeBlock:** plain, zero-dependency renderer by default (line numbers, highlight lines, copy button, max-height scroll, language chip in the header). A lazy Shiki path is exposed via `createShikiRenderer()` + `useShikiRender()` — consumers import them from `@arshad-shah/cynosure-react/code-block` and pass the resulting HTML through the `html` prop, so Shiki never enters the default bundle graph.

  New direct dependencies: `@radix-ui/react-accordion`, `@radix-ui/react-collapsible`, `@radix-ui/react-scroll-area`, `@tanstack/react-table`, `react-resizable-panels`, `shiki`.

  All components ship per-component tsup entries with Node10 sidecar shims. 35 new unit tests (357/357 total pass).

- [#13](https://github.com/arshad-shah/Cynosure/pull/13) [`6602e19`](https://github.com/arshad-shah/Cynosure/commit/6602e198c2eb978793d9edba671bb6d12bc46381) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 12 — feedback components.

  `@arshad-shah/cynosure-react` gains the "status and identity" surface: badges, tags, chips, avatars, alerts, banners, notifications, callouts, empty states, and button toggles.
  - **Badge / Tag / Chip:** three lookalikes with explicit, non-overlapping roles. `Badge` is a non-interactive label (soft/solid/outline/ghost × accent/neutral/success/warning/danger/info, sizes xs/sm/md, shape default/pill/square, optional `icon`, and a bare `dot` mode). `Tag` is a categorical label — static by default, becomes a `<button>` when `onClick` is set, renders a `role="group"` wrapper with an inner remove button when `onRemove` is set (with Backspace/Delete keyboard removal on the focused tag). `Chip` is always an interactive toggle button with `aria-pressed`, a controlled `selected` + `onSelectedChange` contract, optional `leftIcon`/`rightIcon`, and an optional `onRemove` tail button.
  - **Avatar + AvatarGroup:** Radix-backed `<RadixAvatar.Root>` with image → initials → icon fallback chain; six sizes (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`), three shapes (`circle`/`square`/`rounded`), a deterministic 8-colour palette hash (`colorFromName`) so the same display name always maps to the same tint, optional status dot (`online`/`offline`/`away`/`busy` × top-right/bottom-right), and an optional ring for stacked group layouts. `AvatarGroup` overlaps the first N children and collapses the rest into a `+N` tile, projecting `size` + `ring` through context.
  - **Alert + AlertTitle + AlertDescription:** static inline alert with `status` (`info`/`success`/`warning`/`danger`), `variant` (`solid`/`soft`/`outline`/`ghost`), sizes `sm`/`md`/`lg`, configurable icon (custom node, `false` to hide, or default status icon), and optional `closable` + `onClose`. ARIA `role` defaults to `alert` for danger/warning and `status` for info/success; consumers can override.
  - **Banner + BannerContent + BannerActions:** full-width variant of Alert, rounded-0 by default, with a dedicated actions slot. `dismissKey` persists dismissal in `localStorage` across sessions (`clearBannerDismissal(key)` exported as a test helper).
  - **Notification:** inline notification card with `icon` / `title` / `description` / `timestamp` / `actions` slots, `unread` state (highlighted background + dot), and `onRead` / `onDismiss` callbacks — for activity panels and notifications lists (distinct from Phase 09's Toast).
  - **Callout + CalloutTitle + CalloutContent:** softer status surface used inline in prose — `soft` / `outline` variants × `accent`/`neutral`/`success`/`warning`/`danger` colour schemes. Left-border accent stripe for visual distinction from Alert.
  - **EmptyState + EmptyStateIcon + EmptyStateTitle + EmptyStateDescription + EmptyStateActions:** centred "zero data" composition with size scale `sm`/`md`/`lg`/`xl` and `default`/`subtle` variants. Max-width constrained to `60ch` for readable copy.
  - **Toggle + ToggleGroup + ToggleGroupItem:** Radix `@radix-ui/react-toggle` and `@radix-ui/react-toggle-group` re-skin. `Toggle` reads size/variant from `ToggleContext` (so a whole group can be sized once). `ToggleGroup` supports `single`/`multiple` types, horizontal/vertical orientation, and an `attached` mode that collapses gaps into a single pill bar with shared borders.

  Shared `feedback/shared/surface.css.ts` centralises the Alert / Banner / Notification / Callout background-border-foreground recipe across `soft` / `solid` / `outline` / `ghost` × `info` / `success` / `warning` / `danger`. Shared `feedback/shared/icons.tsx` ships the default status icon set + the reusable close glyph, so Alert / Banner / Notification render the same visual language without each importing a third-party icon package.

  New direct dependencies: `@radix-ui/react-avatar`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`.

  All components ship per-component tsup entries with Node10 sidecar shims (`@arshad-shah/cynosure-react/badge`, `/tag`, `/chip`, `/avatar`, `/avatar-group`, `/alert`, `/banner`, `/notification`, `/callout`, `/empty-state`, `/toggle`, `/toggle-group`, `/feedback`). 35 new unit tests (392/392 total pass).

- [#14](https://github.com/arshad-shah/Cynosure/pull/14) [`3234aa1`](https://github.com/arshad-shah/Cynosure/commit/3234aa1cd176e5116fb122b51dfc47158fa2d2a1) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 13 — form composition.

  `@arshad-shah/cynosure-react` gains the scaffolding layer that ties every Phase 07 + 08 control together with a small compound component and an opt-in `react-hook-form` adapter.
  - **`Form`** — thin wrapper over `<form>` with `noValidate` defaulted to `true` so native browser validation bubbles don't fight `FormMessage`.
  - **`FormField`** — generates a stable `id` from `name` + `useId`, owns the context that wires its children, and lays out `FormLabel` / `FormControl` / `FormDescription` / `FormMessage` as a vertical flex column with a `space.1.5` gap. Carries `invalid` / `disabled` / `required` flags that cascade through the field.
  - **`FormLabel`** — wraps `Label`, auto-threads `htmlFor` to the field id, and paints the required indicator from `FormField.required`.
  - **`FormControl`** — clones its single child (an `<input>` / `<Select>` / `<Checkbox>` / etc.) and injects `id`, `name`, `aria-invalid`, `aria-describedby`, `disabled`, `required`, and the Cynosure-specific `invalid` prop. Any value the child already sets wins; existing `aria-describedby` is preserved by concatenation so external references survive.
  - **`FormDescription`** — wraps `HelperText` and registers a `${field.id}-description` id onto the field's `aria-describedby` list.
  - **`FormMessage`** — wraps `ErrorText`, registers a `${field.id}-message` id **only when it has content**, and emits `role="alert"` only when the surrounding field is `invalid`. Returns `null` for empty children so consumers can bind `<FormMessage>{errors.field?.message}</FormMessage>` unconditionally.

  New `@arshad-shah/cynosure-react/rhf` subpath exports `RHFField`, an adapter that wires `useController({ control, name, rules })` through the `FormField` scaffold — binds `field.value` / `field.onChange` / `field.onBlur` / `field.ref` onto the child control, marks the field invalid on `fieldState.error`, and surfaces `fieldState.error?.message` through `FormMessage`.

  `react-hook-form` is declared as an **optional peer dependency** (`peerDependenciesMeta.react-hook-form.optional = true`). Consumers who never import `@arshad-shah/cynosure-react/rhf` don't need it installed and don't pay any runtime cost; the subpath imports `react-hook-form` statically so typed generics (`RHFField<TValues, TName>`) flow through and tree-shaking stays effective.

  Three Storybook MDX recipes in `src/forms/Form/`:
  - `Form.mdx` — plain uncontrolled form + `FormData` + `Object.fromEntries`.
  - `RHF.mdx` — `react-hook-form` with inline `rules`.
  - `RHF-Zod.mdx` — `react-hook-form` + `@hookform/resolvers/zod` with a shared Zod schema.

  Per-component tsup entries (`@arshad-shah/cynosure-react/form`, `@arshad-shah/cynosure-react/rhf`) + Node10 sidecar shims. 17 new unit + integration tests covering `aria-describedby` composition and mount order, child-prop override, FormData submission, and RHF error surfacing (409/409 total pass).

### Patch Changes

- [#1](https://github.com/arshad-shah/Cynosure/pull/1) [`8779fbf`](https://github.com/arshad-shah/Cynosure/commit/8779fbf3668dca2e0b663fa686e9e6a9267d62c0) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Initial foundation.

- [#15](https://github.com/arshad-shah/Cynosure/pull/15) [`0454102`](https://github.com/arshad-shah/Cynosure/commit/045410265ab1feacd9d5a4ed5215102abd98e845) Thanks [@arshad-shah](https://github.com/arshad-shah)! - Phase 14 — testing & quality hardening.

  Repo-wide CI gates are now release-blocking; `@arshad-shah/cynosure-react` itself only changes visually where physical CSS properties on RTL-sensitive components were rewritten to logical equivalents so layouts flip correctly under `<DirectionProvider dir="rtl">`.
  - **Logical properties everywhere.** `Callout`, `Tag`, `Divider` (vertical variants), `NavigationMenu` indicator arrow, `Tabs` (vertical list separator), `CodeBlock` line numbers, `overlay/shared/menu` items/shortcuts/indicators, and `feedback/shared/surface` close button all moved from `margin-left` / `padding-right` / `border-left-*` to `margin-inline-start` / `padding-inline-end` / `border-inline-start-*`. Consumer-facing layout props (`<Box paddingLeft="4">` etc.) stay physical by design — they remain a physical-intent escape hatch.
  - **RTL audit script** (`scripts/audit-rtl.mjs`) greps every `*.css.ts` in `packages/react/src` for physical directional properties and fails CI on new occurrences. Two files are on the allowlist with documented rationale: the `primitives/layout/shared/layoutStyle.css.ts` prop registry (consumer API) and `overlay/Drawer/Drawer.css.ts` (physical `side="left"` / `"right"` is the prop's intent).
  - **Contrast audit script** (`scripts/audit-contrast.mjs`) parses the compiled `@arshad-shah/cynosure-tokens` CSS + `@arshad-shah/cynosure-themes` overlays, resolves every `var()` chain, composites alpha-blended pairs, and checks WCAG 2.1 AA against 19 semantic foreground/background pairs across six themes (base light + dark, terminal + terminal-dark, high-contrast + high-contrast-dark). Fails CI on any pair below threshold.
  - **Bundle-size budgets.** Root `.size-limit.json` carries 44 per-component budgets (Box through DataTable, Form + RHF adapter, and a warning-only full-barrel ceiling). `pnpm size` runs on every PR.
  - **Vitest hardening.** `packages/react/vitest.config.ts` now ships `coverage.thresholds` (initial baseline: lines/statements ≥ 85, functions ≥ 78, branches ≥ 73 — spec target is 85/85/80/85, with functions/branches catching up incrementally as DataTable/Tree/ColorPicker/DatePicker edge-cases land coverage) and an opt-in cross-browser matrix (`CYNOSURE_BROWSER_MODE=1` → Chromium + Firefox + WebKit via Playwright; local default stays jsdom-only for speed; browser mode only matches `*.browser.test.{ts,tsx}` so the existing jsdom suite isn't forced through real browsers).
  - **Storybook a11y.** `.storybook/preview.ts` locks the axe audit to WCAG 2.1 A + AA tags and keeps `a11y.test = 'error'` so any violation fails Vitest Storybook addon runs.
  - **CI verify.** Split into `verify` (lint/typecheck/RTL-audit/build/test/coverage/contrast/size/publint/attw) and an optional `cross-browser` job that runs the three-engine matrix. Nothing merges to `main` without green verify.
  - **Dep freshness.** `.github/renovate.json` groups Radix / React-Aria / vanilla-extract / Storybook / Vitest / TanStack / Internationalized and pins Monday-morning scheduling with pr concurrency limits.
  - **Chromatic workflow** (`.github/workflows/chromatic.yml`) wired behind `CHROMATIC_PROJECT_TOKEN` for per-PR visual regression; **Lighthouse CI** config (`lighthouserc.json`) asserts ≥ 0.95 accessibility and ≥ 0.85 perf on the built Storybook.

  No public API additions; patch-level because the visual output of the nine `.css.ts` files changes in RTL contexts.

- Updated dependencies [[`b99bace`](https://github.com/arshad-shah/Cynosure/commit/b99bacee83d7fbd4800d3aa0ae327badc078b046), [`e2f45fc`](https://github.com/arshad-shah/Cynosure/commit/e2f45fc841e62c35b9f95650a2d4ca7c28c96b12), [`7aca046`](https://github.com/arshad-shah/Cynosure/commit/7aca046bafecb270f95fbad792be9d467c5c7e7b)]:
  - @arshad-shah/cynosure-tokens@0.1.0
  - @arshad-shah/cynosure-core@0.1.0
