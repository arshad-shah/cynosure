# Cynosure Milestone 3 Components and Product Migration Implementation Plan (Plan 4 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Milestone 3 components that the products actually use (ProgressBar, Slider, Combobox, Tree, CommandPalette, ColorField), close the open Plan 3 question (toasts raised inside a modal Dialog), and prepare one migration issue per product repo.

**Architecture:** Unchanged. Composites build on existing foundations and components; a new native element needs a foundation first (`src/foundations/AGENTS.md`). Lists reuse `useRovingFocus` or the active-descendant pattern; floating lists reuse `src/overlay` (positioner, top layer, `useDismiss`). Form values go through `HiddenValue`.

**Spec:** `docs/superpowers/specs/2026-11-09-cynosure-next-design.md` (§8 Milestone 3, §14 product migration). Conventions: `docs/conventions.md`. Testing: `docs/testing.md`.

## Product evidence (searched 2026-11-10)

Spec §8 admits a component only when two products use it, or one cannot work without it. Code search across `user:arshad-shah`:

| Component      | Evidence in product repos                                               | Verdict                    |
| -------------- | ----------------------------------------------------------------------- | -------------------------- |
| ProgressBar    | `<progress>` / `role="progressbar"` in verql, whetstone, Nimaz          | In                         |
| Slider / range | `type="range"` in aperture-css, algo-visual, algosnap, verql, whetstone | In                         |
| Combobox       | `role="combobox"` in aperture-css, algo-visual, verql                   | In (meets "two products")  |
| Tree           | `role="tree"` in aperture-css, verql                                    | In                         |
| CommandPalette | command palettes in aperture-css, verql (and verql-next)                | In                         |
| ColorField     | `type="color"` in aperture-css (plus css-inspector)                     | In (essential to Aperture) |

Record the evidence in each component's README under `## Used by`. Prism is not in the code-search index; a clone shows its tree in `src/ui/VirtualTree.tsx` (virtual, with custom rows), so Tree gained `virtual` and `renderLabel`.

## Global Constraints

- Everything in Plans 1 to 3 still holds:
  - the prop vocabulary
  - behavioural stories on Chromium, Firefox, WebKit and touch (touch stories tagged `["touch", "!dev"]`)
  - hostile host and shadow root
  - `cy check`
  - hand-written docs page and README per component
  - overridable `labels`
  - no writes to `<html>`/`<body>`
  - React 18 and Preact compatibility
  - no AI attribution
- Overlays: entrances use `@keyframes` (never `@starting-style`), and stories call `shownFully()` after opening (`src/test/settle.ts`).
- Size budgets: ≤ 3 kB JS + CSS gzip per component; Slider ≤ 3.5 kB (single and range, vertical, marks, forms); Combobox, Tree and CommandPalette ≤ 4.5 kB each, ColorField ≤ 4 kB (Slider counted separately).
- Before telling Arshad the published Storybook is fine, build it and load every story under `/cynosure/` (`docs/testing.md`).

## Review Focus

1. **Toasts inside modal dialogs:** a toast raised from inside an open Dialog is visible, clickable and announced, and it still works once the dialog closes. (Task 1)
2. **Slider on touch and keyboard:** APG slider keys, large steps, thumb hit area ≥ 44 on touch, no page scroll while dragging, RTL, range with two thumbs that cannot cross. (Task 3)
3. **Combobox with async options:** typing never loses characters, the active option stays in view, `aria-activedescendant` is valid, and results arriving late do not move focus. (Task 4)
4. **Tree with thousands of nodes and lazy children:** keyboard (APG tree view), type-ahead, expand and collapse, and loading states stay fast and correct. (Task 5)
5. **CommandPalette shortcut:** the global shortcut opens it from anywhere without fighting text fields, and works inside a shadow root (extensions). (Task 6)

---

### Task 1: Toasts inside modal dialogs (open question from Plan 3)

- **Problem:** a modal Dialog makes everything outside it inert, including the Toaster region. A toast raised while a Dialog is open is hidden under the scrim, cannot be clicked and is not announced.
- **Design:** each open Dialog provides a nested toast host (a region inside the `<dialog>`, in the top layer above it). `useToast()` sends toasts to the nearest open modal host, otherwise to the Toaster. When the dialog closes, toasts still showing move to the page Toaster with their remaining time.
- **Tests:** raised inside a Dialog it is visible (`shownFully`), clickable and announced once; Escape closes the dialog, not the toast; closing the dialog hands live toasts over without a second announcement; works in a shadow root.

### Task 2: ProgressBar

- **Props:** `<ProgressBar value max label tone size indeterminate showValue labels>`, `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and `aria-valuetext` via `labels`.
- **Indeterminate:** no `aria-valuenow`; animated stripe; static under reduced motion.
- **Tests:** values clamp; indeterminate semantics; tone contrast ≥ 3:1 for the bar against its track; reduced motion; RTL fill direction; hostile host.

### Task 3: Slider (single and range)

- **Props:** `<Slider value defaultValue onChange onCommit min max step largeStep orientation marks label name disabled>`; `value` may be `[from, to]` for a range.
- **Behaviour:** thumbs are `role="slider"` (APG): arrows, Page Up/Down (large step), Home, End. Range thumbs cannot cross. `onCommit` fires on pointer up or key release.
- **Pointer and touch:** drag on the track or thumb; pointer capture; `touch-action` so the page does not scroll while dragging; thumb hit area ≥ 44 on coarse pointers.
- **Forms:** values through `HiddenValue` (one per thumb).
- **Tests:** keys; pointer drag; touch drag; clamping and stepping; range crossing; RTL; vertical; form value and reset; disabled; hostile host.

### Task 4: Combobox

- **Props:** `<Combobox options value onChange inputValue onInputChange filter allowCustom loading emptyText label name>` (APG combobox with a listbox popup, editable input).
- **Behaviour:** typing filters (default filter or your own); Down opens; Enter selects; Escape closes, then clears; `aria-activedescendant` follows the active option. Async results do not steal focus or reset the typed text.
- **Reuse:** Select's list styles and positioner; `useDismiss`; `HiddenValue`; `InputBase`.
- **Tests:** keyboard paths; filtering; async loading with late results; custom values on or off; empty state; form value and reset; touch rows ≥ 44; shadow root; hostile host.

### Task 5: Tree

- **Props:** `<Tree items selection onSelectionChange expanded onExpandedChange selectionMode ("single" | "multiple") loadChildren label>`, where items are `{ id, label, icon?, children? }`.
- **Behaviour (APG tree view):** Up and Down, Right opens or moves to the first child, Left closes or moves to the parent, Home, End, type-ahead, `*` expands siblings, Enter or Space selects. One Tab stop.
- **Lazy children:** `loadChildren(item)` shows a loading row, then the children; errors show a retry row.
- **Performance:** render only expanded branches; a story checks 5,000 nodes stay responsive.
- **Tests:** every key; selection modes; lazy loading and failure; RTL (Left and Right swap); touch rows ≥ 44; hostile host.

### Task 6: CommandPalette

- **Props:** `<CommandPalette open onOpenChange commands onRun placeholder shortcut labels>`, where commands are `{ id, label, group?, shortcut?, icon?, keywords? }`.
- **Built from:** Dialog (top of the screen, narrow sheet on small containers), Combobox-style list with groups, Kbd for shortcuts.
- **Shortcut:** `useHotkey("mod+k", handler)` opens it; ignored while typing in a text field unless the field opts in; works in shadow roots.
- **Tests:** shortcut opens and closes; search by label and keywords; groups; arrows wrap; Enter runs and closes; recent commands; Escape; focus returns; shadow root.

### Task 7: ColorField

- **Props:** `<ColorField value onChange format ("hex" | "rgb" | "oklch") alpha label name>`.
- **Parts:** a text input accepting any CSS colour (validated through `rgb()` parsing in a canvas), a swatch button that opens a Popover with a saturation and lightness area plus hue and alpha Sliders, and an EyeDropper button where the API exists.
- **Forms:** normalised value through `HiddenValue`.
- **Tests:** typing valid and invalid colours; the picker area by pointer and keyboard; alpha; format output; EyeDropper present and absent; contrast of the swatch border on any colour; form value and reset; touch.

### Task 8: Carry-overs

- **WebKit:** confirm on CI that the keyframe entrances pass, then remove any WebKit workarounds that are no longer needed.
- **Prism evidence:** confirm Tree (and anything else Prism needs) in the Prism repo; update `## Used by`.
- **React 18 smoke:** add Slider and Combobox to `tests/react18`.

### Task 9: Product migration issues (needs Arshad's go-ahead to open)

- **Draft first, in this repo:** one Markdown issue body per product in `docs/migration/issues/<repo>.md`. Each body gives the scope from spec §14 (full, adopt at start, partial, archive), the components that product uses, the order of work from `docs/migration.md`, and how to check it (hostile host, shadow root for extensions).
- **Open only with approval:** Arshad reviews the drafts; then the issues are opened in each repo. Each repo has to be added to the session before it can be written to. `ui-library` gets an archive note, not a migration.

### Task 10: Docs, progress, review, push

- **Docs:** README, Introduction and `docs/migration.md` list Milestone 3; PROGRESS shows Plan 4 done.
- **Review:** an independent whole-branch review of the Plan 4 code; fix its findings, and record any open questions in PROGRESS.
- **Gates:** `pnpm verify`; CI green on all engines; baselines refreshed with `[baselines]` if pixels moved; published Storybook loaded end to end.
- **Not in this plan:** npm publish, deprecating the old `cynosure-*` packages and merging to `main`. Each needs Arshad's explicit authorisation.
