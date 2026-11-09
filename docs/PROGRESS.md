# Cynosure progress

## Status

Plan 3 (Milestone 2 structure and overlays) in progress on `next`: Tasks 1–8 done. Plans 1 and 2 complete. Storybook live at https://arshad-shah.github.io/cynosure/.

Done in Plan 3:

- **Task 1:** Stack, Inline and the `useRovingFocus` hook.
- **Task 2:** Card.
- **Task 3:** Toolbar.
- **Task 4:** Tabs, with overflow fades, closable tabs, and auto or manual activation.
- **Task 5:** Disclosure and Accordion. The height animates without script; headers are headings and open sections are regions.
- **Task 6:** Popover and `useDismiss`. One layer stack: Escape closes the topmost layer, outside clicks close, and focus returns. Tooltip joined the stack.
- **Task 7:** Menu, with arrows, type-ahead, sections, checkable items and shortcuts.
- **Task 8:** DialogBase (foundation for `<dialog>`), Dialog and Sheet. Native modal (`showModal`), focus in and back, Escape and backdrop through the shared layer stack, bottom sheet in narrow containers, no writes to `body`, shadow-root safe.

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

Plan 3 Task 9: Toast. Not started.

## Next step

Continue Plan 3 at Task 9 (`docs/superpowers/plans/2026-11-09-cynosure-structure.md`):

1. **Toast:** write the stories first. Cover:
   - shows and auto-dismisses; timers pause on hover and focus, then resume
   - max visible, older toasts collapse
   - the action button works
   - announced once (`aria-live` polite, assertive for danger)
   - reduced motion
   - swipe to dismiss (touch tag)
2. **Implement** `<Toaster position max>` with a per-Toaster `toast()` store from context (no globals), in the top layer (`popover="manual"`).
3. **Remaining tasks:**
   - **Task 10:** Notice and EmptyState
   - **Task 11:** CopyButton
   - **Task 12:** carry-overs: React 18 fixture smoke test, dark-contrast baselines
   - **Task 13:** docs, PROGRESS and push
4. **Final whole-branch review** for Plan 3, then Plan 4.
5. **Before merging this work into `next`:** run the Dialog, Sheet and DialogBase stories on Firefox and WebKit (not run in the session that built them; see Verification).

The resume ledger lives in `.superpowers/sdd/2026-11-09-cynosure-structure/progress.md` (git-ignored, local only). Rulings are also summarised below.

## Plans

- [x] Plan 1: Foundation (`docs/superpowers/plans/2026-11-09-cynosure-foundation.md`)
- [x] Plan 2: Milestone 1 controls (`docs/superpowers/plans/2026-11-09-cynosure-controls.md`)
- [ ] Plan 3: Milestone 2 structure and overlays (`docs/superpowers/plans/2026-11-09-cynosure-structure.md`). Tasks 1–8 done, Task 9 next.
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

## Verification

- **Local `pnpm verify`** (Plan 3 Tasks 1–7, earlier machine): 283 unit tests, 477 story runs (Chromium, WebKit, touch) and 233 Firefox runs; coverage ≥ 95% branches.
- **Task 8 session (cloud container):** `cy check`, lint, typecheck, unit and Preact tests, every story on Chromium plus the touch project (268 runs), coverage (95.19% branches), build, publint, attw and size all pass. The Dialog and Sheet were also checked visually (centred, bottom sheet at phone width, scrolling body, end sheet in RTL).
  - **Not run:** Firefox and WebKit. The container could not download them (`cdn.playwright.dev` is blocked), and CI only runs on `next`, `main` and pull requests, not on the session branch.
- **CI:** GitHub Actions on Linux runs conventions, lint, types, unit tests, stories on all three engines plus touch, coverage, visual regression, build, publint, attw and size.
- **Not verified:**
  - real extension contexts (Prism and Aperture shadow roots under MV3 CSP)
  - Safari and Edge outside the Playwright engines
  - the React 18 runtime (Task 12)
  - Dialog, Sheet and DialogBase on Firefox and WebKit

## How to resume

```bash
git clone https://github.com/arshad-shah/cynosure.git && cd cynosure && git checkout next
nvm use && corepack enable && pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm cy progress && pnpm verify
pnpm storybook
```
Then continue at "Current task" above, following `AGENTS.md`.
