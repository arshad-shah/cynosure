# Cynosure progress

## Status

Plan 3 (Milestone 2 structure and overlays): complete on `next`, including the final review (one open design question, below). Plans 1 and 2 complete. Storybook live at https://arshad-shah.github.io/cynosure/.

Done in Plan 3:

- **Task 1:** Stack, Inline and the `useRovingFocus` hook.
- **Task 2:** Card.
- **Task 3:** Toolbar.
- **Task 4:** Tabs, with overflow fades, closable tabs, and auto or manual activation.
- **Task 5:** Disclosure and Accordion. The height animates without script; headers are headings and open sections are regions.
- **Task 6:** Popover and `useDismiss`. One layer stack: Escape closes the topmost layer, outside clicks close, and focus returns. Tooltip joined the stack.
- **Task 7:** Menu, with arrows, type-ahead, sections, checkable items and shortcuts.
- **Task 8:** DialogBase (foundation for `<dialog>`), Dialog and Sheet. Native modal (`showModal`), focus in and back, Escape and backdrop through the shared layer stack, bottom sheet in narrow containers, no writes to `body`, shadow-root safe.
- **Task 9:** Toast: `<Toaster position max>` and `useToast()` with a store per Toaster (no globals). Announced once (`status`, or `alert` for danger, text inserted once into an existing live element); timers pause on hover, focus and a hidden page; older toasts collapse in place; swipe to dismiss on touch.
- **Task 10:** Notice (status or alert by tone, action drops under the text below 26rem, 4.5:1 in every tone and mode) and EmptyState (real heading at a chosen level, `sm` for panels).
- **Task 11:** CopyButton: injectable `copy` writer, announced result, failed state for a missing clipboard, a refused permission or a throwing writer; never throws.
- **Task 12:** React 18 smoke fixture (`tests/react18`, own React 18.3.1, aliases force the library onto it; in `verify` and CI) and dark + more-contrast visual snapshots in the visual hook.
- **Task 13:** README, Introduction and migration coverage list Milestone 2.

Also shipped in this stretch:

- **Docs pages:** every component and foundation has a hand-written docs page (`<Name>.mdx`) and there is no autodocs. Tables use GFM, and `cy check` enforces a docs page and no text glyphs in docs.
- **TextArea:** hand-made resize grip.
- **Fields:** a `labelHidden` option, alignment kept beside error messages, and a sunken fill for read-only fields.
- **Input variants:** a contract story checks that inputs and buttons line up at every size.
- **Plan 2 review fixes:**
  - Select: a disabled or invalid Select now behaves like the native one in forms.
  - Colour mode: synced across instances and hydration-safe.
  - Select list: aligned to the trigger, and long labels truncate.
- **Firefox focus flakes:** root-caused (the test frame was not focused). Each story now calls `window.focus()` before it runs. Firefox runs in its own pass and there are no retries.

## Current task

Plan 3 is complete on `next` (Tasks 1–13 and the final review). Next: Plan 4.

## Next step

1. **Plan 3 review:** done; one finding is open (toasts under a modal Dialog, see "Plan 3 final review"). Decide its design at the start of Plan 4.
2. **Visual baselines:** the `[baselines]` commit regenerates Chromium baselines, including the new `-dark-contrast` snapshots and the new components. Check the "Update visual baselines" run and the CI run after it on `next`.
3. **WebKit check:** on a machine with WebKit, open `components-dialog--content-scrolls-inside` and find out why jest-dom called the Save button "not visible" there while its geometry was correct. The story now checks geometry instead.
4. **Write Plan 4** (Milestone 3 and the product migration issues): `docs/superpowers/plans/`, following the spec §8. The migration issues (one per product repo, see `docs/migration.md`) open once Plan 4 is agreed with Arshad.

## Plan 3 final review

An independent review of the Plan 3 Tasks 8–12 code found nine issues. Fixed (each with a story or unit test):

- Dialog read `document` during render: guarded for server rendering.
- A Tooltip inside a Dialog swallowed the first backdrop click: pointer-down topmost checks skip layers that ignore pointer downs (`useDismiss`).
- A Dialog opened from a Menu item lost focus on close: focus goes to the button controlling the closed popover.
- Dismissing a toast from the keyboard dropped focus on the body: it moves to the next toast's close button, or the region stops pausing.
- CopyButton could reject when `value()` threw, and a second copy was not announced: both fixed.
- DialogBase: a late `close` event could close a reopened dialog: ignored when the dialog is open again.
- Toast: a cancelled swipe (the browser took the gesture) springs back instead of dismissing.
- New layout effects use `useClientLayoutEffect` (no React 18 SSR warnings).
- Notice docs overstated announcements of a status Notice that mounts filled: corrected.

**Open (design decision for Plan 4):** a toast raised while a modal Dialog is open sits under the dialog and is inert (not clickable, not announced), because the Toaster's region is outside the modal. Options: a Toaster region inside each Dialog that `useToast()` prefers while the dialog is open, or re-showing the region inside the topmost modal. Documented in the Toast docs until then.

## Plans

- [x] Plan 1: Foundation (`docs/superpowers/plans/2026-11-09-cynosure-foundation.md`)
- [x] Plan 2: Milestone 1 controls (`docs/superpowers/plans/2026-11-09-cynosure-controls.md`)
- [x] Plan 3: Milestone 2 structure and overlays (`docs/superpowers/plans/2026-11-09-cynosure-structure.md`). Tasks 1–13 and the final review done.
- [ ] Plan 4: Milestone 3 and product migration issues (not written)

## Plan 3 rulings so far

- **Roving focus:** `useRovingFocus` reads the text direction from the container (there is no `rtl` option). The Tab stop follows the selection while focus is elsewhere, and text inputs keep their arrow keys.
- **Card:** interactive only through `href` (LinkBase) or `onClick` (ButtonBase). Card owns its type scale.
- **Toolbar:** radios inside are separate stops (APG toolbar).
- **Tabs:**
  - horizontal only
  - tabs without a TabPanel omit `aria-controls`
  - budget 4.5 kB including the shared roving hook
- **Disclosure:** animates `grid-template-rows` from 0fr to 1fr. Closed content is `visibility: hidden`, so find-in-page will not open it.
- **Accordion:** regions on by default, `regions={false}` for long lists. Budget 3.25 kB including Disclosure.
- **Popover:** the trigger is a render prop.
- **Layer stack:** the topmost layer is the most recently opened one with no open layer nested inside it.
- **Overlay budget:** the overlay core is budgeted once at 2 kB.
- **Menu:** checkable items keep it open, and disabled items are skipped by arrows.
- **Docs:** no autodocs, hand-written MDX per component, and words instead of arrow glyphs.
- **Dialog:**
  - the `<dialog>` fills the viewport and is the scrim and the size container; the panel sits inside. A pointer down on the dialog itself is a backdrop click.
  - below a container width of 36rem it docks to the bottom (container query on the dialog; container queries cannot use tokens, so the threshold is a rem literal).
  - Escape goes through `useDismiss` (its `preventDefault` on keydown stops the native cancel); `DialogBase` also prevents `cancel` (Android back) and reports uncancelable closes through `onClose`.
  - `useDismiss` `outside` can be a function; then only the topmost layer closes, so a backdrop click with a Menu open closes just the Menu.
  - focus: first control in the content, else the first action, else the dialog itself (focusing the close button would pop its tooltip). Focus to return to is read while rendering, before `showModal` moves it.
  - `dismissible={false}` hides the close button and ignores Escape and the backdrop.
  - no scroll lock (it would write to `body`); the content uses `overscroll-behavior: contain`.
- **Sheet:** the same `DialogFrame` with `side` (`bottom` default, `end`). `size` sets the width of an end sheet.
- **Toast:** the region (`<section aria-label>`, `popover="manual"`) is shown for the Toaster's whole life so live elements exist before text. Each toast is its own live element whose text arrives 50ms after it mounts. Collapsed toasts stay in the DOM (folded, inert) so they are never re-announced. A modal Dialog opened later covers the toasts and makes them inert. Budget 3.5 kB (Dialog 3.25 kB).
- **Notice:** `role="alert"` only for danger. Uncontrolled dismiss hides itself; with `onDismiss` the parent decides.
- **EmptyState:** transparent; contrast is measured on the page background.
- **CopyButton:** the live `role="status"` is always rendered (empty until a result). The button's name follows the state.
- **React 18:** set `inert` as a DOM property, never as a prop (React 18 drops `inert={true}`).

## Feedback round (2026-11-09, after Plan 1)

- **LoadingDots:** its own component of three pulsing dots, with size, tone, colour and speed, visible under reduced motion. Button reuses it.
- **Button API:** `variant` (solid, soft, outline, ghost) × `tone` (accent, neutral, danger, success, warning, info). Every pair is tested distinct and ≥ 4.5:1.
- **Colours:** ember brand accent `#c2410c` with white text, crimson danger (`#b4235a` / `#ff6b8f`), and per-tone text roles.
- **Brand:** logo and lockup recoloured to ember; wordmark readable on light backgrounds; PNG and ICO regenerated.
- **Icons:** Facet icons are stroke only (accent dot removed). 136 icons in 15 categories with a categorised gallery.
- **Props:** shared prop vocabulary (`size`, `tone`, `variant`, `color`) in `docs/conventions.md` and the `cy new component` template, with Storybook controls for every prop.

## Feedback round (2026-11-09, during Plan 3)

- **Visual checks:** check everything visually, and make the variants of inputs good. This led to `labelHidden`, alignment beside errors, the read-only fill, the input-variants contract and vertical Toolbar alignment.
- **Docs pages:** they must explain the component, not repeat stories. This led to hand-written MDX for all components and foundations, plus the `cy check` docs rule.
- **TextArea:** must be resizable. It now has a hand-made grip.
- **Tables:** markdown tables in docs rendered as raw text. Fixed with remark-gfm, and a test guards it.

## Plan 2 notes (2026-11-09)

- **`inherit-chain` rule:** new `cy check` rule. Every element with a `cy-` class carries `.cy-reset` or declares its font size; it found 10 real host-CSS leaks.
- **Overlays:** Tooltip and Select use the Popover API (top layer) with a shared positioner (`src/overlay`), so overlays work in shadow roots and never clip.
- **Build output:** the library ships minified ESM with sourcemaps, and `"use client"` only on interactive modules.

## Blockers

None. Npm publish and deprecating the old packages wait for Arshad's authorisation.

## Decision log

- **2026-11-09 (setup):**
  - Single package `@arshad-shah/cynosure` on branch `next`.
  - Facet icons and Facet look approved.
  - English strings with `labels` overrides.
- **2026-11-09 (Arshad's feedback):**
  - Remove the accent dot from icons (stroke only).
  - One prop vocabulary across components.
  - The loading indicator is its own component (three pulsing dots).
- **2026-11-09 (stack):** React components (Preact via compat), plain modern CSS, and tokens in TS → CSS. No web components (content-script registry).
- **2026-11-09 (toolchain):** Vite 8, Vitest 5, Storybook 10.6 and TypeScript 5.9 (not 7, because the tooling uses the TS API). pnpm refuses packages younger than 14 days.
- **2026-11-09 (security):** theme input is validated centrally, and gamut mapping is bounded.
- **2026-11-09 (CSS):** component roots never carry `.cy-reset` (found by the hostile-host and shadow-root tests).
- **2026-11-09 (attribution):** no AI attribution in commits, PRs or issues.
- **2026-11-09 (Plan 1 final review fixes):**
  - component roots use doubled selectors (Tailwind v3 `[type=button]`)
  - tokens only on `:root`/`:host`, so nested themes inherit
  - no `color-scheme` on the host `<html>`
  - hover and active states move away from on-accent text
  - transparent focus outline for forced colors
  - coverage floor 95%
- **2026-11-09 (visual baselines):** Chromium on Linux. Refresh by pushing a commit to `next` containing `[baselines]` (dispatch needs the workflow on `main`).
- **2026-11-09 (Plan 2 review):** six Important findings fixed. The deferred minors are listed in the Plan 2 final review section of the controls ledger.
- **2026-11-09 (Plan 3):** docs pages are hand-written. Firefox stories run in their own pass, with `window.focus()` before each story and no retries.
- **2026-11-09 (published Storybook fixes, after the Dialog merge):**
  - touch stories are tagged `["touch", "!dev"]`: they run in the touch project but stay off the published Storybook, where a desktop pointer fails them. `cy check` enforces it (`touch-hidden`).
  - ChoiceBase (`indeterminate`) and HiddenValue (validity, invalid and reset listeners) use layout effects: production React runs passive effects after paint, so the mixed state flashed and validity was stale right after mount. Found by loading every story of the built Storybook.
  - Dialog fades on the `<dialog>` itself, not the panel: WebKit left the panel at opacity 0 (CI failure).
  - Tabs `reveal()` measures tabs from rects relative to the list, not `offsetLeft` (WebKit RTL CI failure).

## Verification

- **Plan 3 Tasks 9–13 (cloud container):** `cy check`, lint, typecheck, unit and Preact tests, the React 18 smoke tests, every story on Chromium plus the touch project, coverage (≥ 95% branches), build and size budgets pass locally. Firefox and WebKit cannot be downloaded in the container (`cdn.playwright.dev` is blocked); CI on `next` runs them.
- **Published Storybook:** every story and docs page of a production build was loaded under `/cynosure/` in Chromium; no load or render errors. Touch-only stories are hidden from the site (`!dev`).
- **CI on `next`:** conventions, lint, types, unit, React 18, stories on all three engines plus touch, coverage, visual regression, build, publint, attw and size.
- **Not verified:**
  - real extension contexts (Prism and Aperture shadow roots under MV3 CSP)
  - Safari and Edge outside the Playwright engines

## How to resume

```bash
git clone https://github.com/arshad-shah/cynosure.git && cd cynosure && git checkout next
nvm use && corepack enable && pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm --dir tests/react18 install && pnpm cy progress && pnpm verify
pnpm storybook
```
Then continue at "Current task" above, following `AGENTS.md`.
