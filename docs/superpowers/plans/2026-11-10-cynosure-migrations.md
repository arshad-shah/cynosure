# Plan 9: what the product migrations need

Tracked in issue #149. Each product's migration issue (one per product repo, opened 2026-11-10) listed the gaps it hit; this plan gathers the ones Cynosure should fill. The rule from Plan 7 holds: a prop on an existing component where one fits, a new component only when nothing covers the need.

Status: **complete** (2026-11-10). Every task below shipped with stories, docs, a changeset and the gates (`cy check`, lint, types, unit, stories, coverage ≥ 95% branches, build, publint, attw, size).

## Decisions (Arshad, 2026-11-10)

| Question            | Answer                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| Publishing          | GitHub Actions publishes from `main` (`.github/workflows/release.yml`, Changesets) |
| Icons without React | Yes: `iconToSvg` and a React-free tokens entry                                     |
| Brand marks         | Yes, every brand we could use, in the way brands allow                             |
| Stepframe           | Moves onto Cynosure; algosnap is archived in favour of Stepframe's block view      |
| Detent              | Issues only, no code; when its release is out, open a Cynosure issue to update     |
| ui-library          | Archived                                                                           |
| CodeMirror theme    | Not answered; nothing added                                                        |

## Tasks

1. **Icons and brands.** 56 Facet icons (a `maths` category among them), 97 brand marks from Simple Icons drawn exactly as published (`@arshad-shah/cynosure/brands`, `color="brand"`), the brands that decline icon sets linked to their own kits, and `iconToSvg` returning `Icon`'s markup as a string. Docs: `docs/icons.md`.
2. **Tokens without React.** `@arshad-shah/cynosure/tokens` (tokens and `themeInitScript`, no React). Docs: `docs/without-react.md`.
3. **Release.** Changesets workflow on `main`, publishing with provenance. Docs: `docs/release.md`.
4. **Props, first batch.** Badge `color` and `dot` (`"live"` pulses); ProgressBar `segments` and `marker`; Button `href`, `confirm`, `keepFocus`; TextField `revealable`; ThemeToggle `variant="cycle"`; Card `actions`; CodeBlock `activeLines`; Select option `group`; Tree `onAction` and revealing an outside selection; `useDrag` and `useControllableState` exported.
5. **Props, second batch.** SplitPane `unit="px"`; Popover `anchor` (a point or element, no trigger needed); NumberField `scrub` (drag the label).
6. **FileDrop** `target="window"`: the whole page takes dropped files, with a top-layer overlay while they are dragged in.
7. **KeyValueEditor** `allowFiles`: a row's value can be a file (multipart forms).
8. **PanZoomCanvas** `renderScreen`: a screen-pixel layer for engines that paint into a `<canvas>`.
9. **AppShell** `tabs`: a bottom tab bar on phones, drawn by **SideNav** `layout="bar"`.
10. **SelectionFrame** `draw`: drag on the layer to draw a new box (region select); `box` may be `null`.
11. **Tabs**: Tab `onClose` (a close button, and Delete) and TabList `onReorder` (drag, or Ctrl/Cmd+Shift and the arrows).
12. **VirtualList**: `wrap` (measured rows), `follow` (stays at the end), `isHeader` (pinned section headings), `handle` (`scrollToIndex`, `scrollToEnd`).
13. **Slider**: any number of thumbs, and `trackContent` for a custom-drawn track.
14. **Calendar, DateField, TimeField** (new): the APG date grid with `renderDay`; a date typed, stepped or picked; a 24-hour time read loosely.

## Left for later

- A movable, resizable non-modal window (aperture-css): not built; it overlaps Dialog, Sheet and FloatingToolbar, and needs a design decision first.
- A menubar for Tabs (Verql): not built; Menu covers the immediate need.
- Detent's upcoming options (detent #89 and #90): update the dependency and drop `useDrag`'s `touch-action` workaround once released.
