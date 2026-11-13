# Plan 10: what Verql's clean-break rework needs

Verql v1 (Electron, React) is reworked onto Cynosure alone: no primitives, Tailwind, CVA, lucide or Storybook in its renderer, the look tuned only through `createTheme`, inline `style` only for dynamic values. Its third-party stack is CodeMirror 6 (replacing Monaco), swift-chart and its own ER canvas engine. Verql v2 (`verql-next`) is Rust and GPUI and cannot use Cynosure; this plan is for v1 (verql#290).

The list was assessed on 2026-11-12 against `@arshad-shah/cynosure@0.4.0` and Verql `main` at `c95ca58`. Every gap below was checked against the props in the source; the bugs in Phase 0 were traced through the code (none run in a browser yet). The rule from Plans 7 and 9 holds: a prop on an existing component where one fits, a new component only when nothing covers the need.

Status: **all phases done** (2026-11-12) on `ccr-8805e2b4-tv4poj`; Phase 0 item 24 was not a bug and item 33 is still open. Arshad approved every decision as proposed (2026-11-13; listed in docs/PROGRESS.md). Next: CI on Firefox and WebKit and visual baselines in pull request #167. Release in one go when Arshad says so.

## Decisions (Arshad, 2026-11-12)

| Question                                | Answer                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CodeEditor (CodeMirror 6)               | **Out.** Cynosure stays a UI library: no CodeMirror dependency, not even optional peers. Verql themes its own editor from `editorColors()`. A dependency-free `codeMirrorTheme()` returning plain style objects (like `monacoTheme()`) may be added if asked.                                                                                                                                                                                     |
| DataGrid                                | **In.** Cynosure builds one; AG Grid leaves Verql.                                                                                                                                                                                                                                                                                                                                                                                                |
| TitleBar, WindowControls, ChatMessage   | **In**, as "essential to one product" (spec §8): a code search across `arshad-shah` finds only Verql using them. Each is generic: TitleBar is the title bar of any installed app (Window Controls Overlay: `app-region: drag`, `env(titlebar-area-*)`), not an Electron bar; WindowControls is a part of TitleBar, not a separate component; ChatMessage carries no markdown parser (content is `children`, Verql renders markdown into `Prose`). |
| `position`/`inset` on layout components | **No.** All 20 positioned elements in Verql's components belong to a component (table below). Three slots cover what is left: PanZoomCanvas `overlays`, ScrollArea and VirtualList `overlay`, SearchField `trailing`. No `truncate` container either (Text has `truncate`).                                                                                                                                                                       |
| Spacer                                  | No component: Stack/Inline children take `grow` (B1).                                                                                                                                                                                                                                                                                                                                                                                             |
| StatusDot                               | No component: Badge `dot` without children (then `label` is required).                                                                                                                                                                                                                                                                                                                                                                            |
| Spinner                                 | No third loading component: a `loader` icon and a spinning variant of LoadingDots.                                                                                                                                                                                                                                                                                                                                                                |
| Size `xs`                               | Yes, with the hit area padded to 24px (44px on coarse pointers) as SegmentedControl's small size does.                                                                                                                                                                                                                                                                                                                                            |

Where Verql positions things today, and who owns each:

| Use                                                                                    | Count | Owner                                                  |
| -------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------ |
| Coloured rail on a row's edge (activity, notifications, activity bar, tab drop marker) | 6     | ListRow `tone`/`active`, SideNav, Tabs' reorder marker |
| A list opening above its trigger (ConnectionSwitcher, SchemaAutocomplete)              | 2     | Popover/Menu `placement`; TextArea `trigger`           |
| Fixed toasts, plugin restart banner                                                    | 2     | Toaster                                                |
| ER canvas corner controls                                                              | 3     | PanZoomCanvas `overlays`                               |
| "N new" pill over the activity stream                                                  | 1     | ScrollArea/VirtualList `overlay`                       |
| Match count in the explorer search                                                     | 1     | SearchField `trailing`                                 |
| About dialog close button                                                              | 1     | Dialog                                                 |
| Tick on the chosen theme tile                                                          | 1     | ColorSwatches or ThemePreview                          |
| Comments only                                                                          | 3     | none                                                   |

## Phase 0: bugs Verql will hit (fix first, a failing story each)

1. **Combobox:** with `allowCustom`, leaving the field commits the shown label instead of the option's value (`Combobox.tsx:180`); options arriving after mount leave the text blank and a blur clears the value (`Combobox.tsx:138`).
2. **Tree:** ArrowRight onto a disabled first child (and ArrowLeft to a disabled parent) makes the disabled row the tab stop, so the tree drops out of the Tab order (`Tree.tsx:273`). `open.includes`/`picked.includes` per row; use Sets (`Tree.tsx:341`).
3. **VirtualList:** `placeOf` and `blockFrom` are O(n²) (`VirtualList.tsx:258,272`); every scroll event rebuilds `keys` and `sizes`, busting `virtual-window`'s memo, and `wrap` reads `offsetHeight` of every row per scroll (`VirtualList.tsx:162,169`).
4. **Roving focus:** `onFocusIn` and `onKeyDown` skip the `own()` filter, so a Popover or Menu inside a Toolbar sends arrows to the toolbar and can leave it with no tab stop (`roving-focus.ts:64,73`).
5. **Hotkeys:** `matchesHotkey` compares `event.key`, so `alt+k` on macOS (`˚`) and `shift+1` (`!`) never match, and `mod++` cannot be written (`hotkey.ts:8`). Fall back to `event.code`; split as `shortcutKeys` does.
6. **Reduced motion:** `:where([class*="cy-"])` with `!important` stops animations on host elements such as `.privacy-banner` (`styles/base.css:44`). Isolation rule.
7. **Tabs:** `safe()` gives "a b" and "a_b" the same id (`Tabs.tsx:163`); the close label falls back to `value` when the label is not a string (add `closeLabel`, B4).
8. **Table:** `setSelected` drops ids outside the current `rows`, so paging or filtering loses selections (`Table.tsx:164`).
9. **FloatingToolbar:** the bar's Escape handler runs before a nested Menu's, leaving the menu open (`FloatingToolbar.tsx:56`).
10. **Anchored position:** `follow` re-checks only the anchor, so a list that grows after opening does not flip (`use-anchored-position.ts:52`). `useFloatingOffset` parses an unresolved `--_offset` (rem gives px, calc gives NaN) and reads computed style every render (`floating.ts:51`).
11. **Shadow roots:** `document.activeElement` in `dismiss.ts:97`, `Popover.tsx:127`, `Toast.tsx:190` (focus not returned, Tab trap not held, Toast stays paused); DateField's `document.getElementById` (`DateField.tsx:171`). One shared `deepActiveElement()`.
12. **`"use client"`:** the banner regex marks `theme/theme-init-script`, `foundations/qr` and `zoom`, so `themeInitScript()` and `qrToSvg()` throw in Server Components (`tools/banner.ts`).
13. **Contrast:** `contrast="normal"` without a `theme` does not undo the high-contrast tokens on an OS set to more contrast (`tokens/to-css.ts:71`).
14. **Pinch zoom:** each wheel step rounds to a whole percent, so slow trackpad pinches never zoom (`zoom-gestures.ts:65`). Keep the unrounded scale.

### Other bugs (outside Verql's path, same pass)

15. **Accordion:** a controlled single collapsible Accordion cannot close; `undefined` means both "none open" and "uncontrolled" (`Accordion.tsx:78`).
16. **SortableList:** a keyboard move sticks when focus leaves, and dropping commits a stale copy, deleting items the parent added meanwhile (`SortableList.tsx:129`).
17. **ColorSwatches:** Tab onto a swatch chooses it (replacing a custom colour in ColorField), and a click fires `onChange` twice (`ColorSwatches.tsx:103`).
18. **DateField, TimeField:** an invalid draft is submitted (no `setCustomValidity`, `name` on the visible input), and form reset restores nothing (`DateField.tsx:190`, `TimeField.tsx:453`).
19. **Slider, NumberField rounding:** Slider rounds with `step`'s decimals only, so `min=0.5, step=1` never reaches `min` (`Slider.tsx:143`); exponent steps (`1e-7`) count as 0 decimals in both.
20. **NumberField:** cannot parse its own output in other numbering systems (`ar-EG`) or with currency text (`1.234,50 kr.`), so edits are undone (`NumberField.tsx:98`).
21. **ColorField:** controlled, it loses saturation at black (HSV rebuilt from RGB; `ColorField.tsx:168`).
22. **Calendar:** possible hydration mismatch: `new Date()`, the `navigator.language` fallback and the default `Intl` locale differ between server and client (`Calendar.tsx:279,361`). Settle them on the client.
23. **ChoiceBase:** `indeterminate` is lost after a click while the parent keeps it true (`ChoiceBase.tsx:30`).
24. ~~**FileDrop:** the drag depth goes negative after a non-file drag.~~ **Not a bug:** `reset()` sets the depth back to 0 whenever it reaches 0 or below; a story passed on the old code.
25. **CompareSlider:** `onChange` fires when the value did not change (`CompareSlider.tsx:80`).
26. **SearchField:** Escape during IME composition clears the query (`SearchField.tsx:35`).
27. **Listbox type-ahead:** with nothing active, one letter starts at item 1, skipping item 0 (`listbox.ts:39`).
28. **Select:** PageDown/PageUp lose the active option when the last/first option is disabled (`Select.tsx:195`).
29. **TagInput:** arrows between the input and tags ignore RTL (`TagInput.tsx:226,257`).
30. **Toast:** the swipe is hand-written pointer code instead of `useDrag` (rule 7; `Toast.tsx:363`); the exit wait reads only the first duration and no delay (`Toast.tsx:336`).
31. **AppShell:** the drawer reopens after the shell widens and narrows again (`AppShell.tsx:119`).
32. **React 18 SSR:** raw `useLayoutEffect` in CynosureTheme, Tree, Tabs, Tooltip, Combobox, TagInput and `use-anchored-position`; use `useClientLayoutEffect`.
33. **DocumentViewport:** fit-width may flip as the scrollbar comes and goes; add `scrollbar-gutter: stable` (plausible, `DocumentViewport.tsx:148`). **Open:** headless Chromium hides scrollbars, so it could not be shown here; check in a headed browser. Also `sizesAt(scale)` builds a new array every render, which busts `useVirtualWindow`'s memo.
34. **Slider:** a controlled `value` outside `min`/`max` is not clamped, so the thumb and `aria-valuenow` go out of range.
35. **TimeField:** arrow-key minute steps do not snap to the `step` grid.
36. **TextArea:** auto-height is not recomputed when the width changes (no ResizeObserver).
37. **`package.json`:** `homepage` still names github.io; the site is cynosure.arshadshah.com.

### Performance

- **VirtualList:** O(n²) moves and per-scroll work over the whole list (item 3 above).
- **Tree:** `includes` per row; Sets once per render (item 2 above).
- **Calendar:** about 40 `Intl` objects built per render (`weekday()` twice per header cell, `fullDate`, `dayNumber`, title, MonthPicker's names, two `Intl.Locale`), and DateField re-renders it on every keystroke (`Calendar.tsx:173,361,372`). Cache per locale.
- **SignaturePad:** each pointermove sets state, reallocates the canvas and rebuilds every stroke's path, and copies the live stroke (`SignaturePad.tsx:103,114,127`). Cache a `Path2D` per stroke, resize only on size or DPR change, draw the live stroke in `requestAnimationFrame`.
- **`useFloatingOffset`:** `getComputedStyle` on every render; FloatingToolbar re-renders on every `selectionchange` (`floating.ts:51`). Read on open only (item 10 above).

## Phase 1: layout and shell

- **B1 Stack, Inline, Grid:** `grow`, `shrink`, `fill`, `minSize="0"`, `overflow`.
- **B13 Size `xs`:** Button, IconButton, Select, TextField, ProgressBar, SegmentedControl.
- **A1 ScrollArea (new):** fills its parent; `direction`, `follow`, `onScroll`, `onAtBottomChange`, `overlay`, handle `scrollToEnd`/`scrollIntoView`. Share the follow logic with VirtualList.
- **B5 SplitPane:** controlled `collapsed`/`onCollapsedChange`, `onResizeEnd`, px size anchored to the end pane.
- **B6 SideNav rail:** `placement: start | end`, `footer`, badge over the icon in the rail, usable without AppShell.
- **A3 Menubar (new):** APG menubar of Menus: one open at a time, hover switches while open, Left/Right between menus, focus returns on close.
- **A4 TitleBar (new) with WindowControls as its part:** `leading`, `trailing`, `leadingInset`, overlay mode from `env(titlebar-area-*)`, `onHeightChange`; controls `{ minimize, toggleMaximize, close, maximized }`, full-height buttons, close filled danger on hover. Children opt out of dragging.
- **A5 StatusBar and StatusBarSegment (new):** start and end clusters; a segment has `tone`, `icon` or `dot`, `mono`, and as a button opens a Popover upward.
- **B4 Tabs:** `dirty` (dot that becomes the close button on hover), middle-click close, `scrollable` (chevrons, wheel to horizontal, active tab into view), trailing slot, `closeLabel`, truncation, per-tab `contextMenu`.

## Phase 2: lists, menus, tree, feedback

- **B2 Menu, ContextMenu:** submenus (`items` on an item, plugins can contribute), separators without a label, controlled `open` on Menu.
- **A8 ListRow (new, or an interactive mode of List):** `leading`, title, two-line meta, `trailing`, actions shown on hover or focus, `active`, `unread`, dimmed, `tone` rail.
- **B3 Tree:** TreeItem `iconTone`/`iconColor`, `trailing`, `data`, `actions`, `contextMenu`; handle `reload(id)`; controlled `loadingIds`/`errorIds`; `renderError(item, retry)`, `renderEmpty`; `filter` with match positions, opening ancestors; group rows that are not selectable, with a count.
- **A12 HighlightedText (new):** `text` and `positions` (or `query`); a `highlight` token. Then Tree, CommandPalette and Combobox use it.
- **A6/A7:** Badge `dot` without children; `loader` icon and LoadingDots spinning variant.
- **B9 VirtualList:** `onAtBottomChange`, `overlay` (after Phase 0 item 3).
- **B8 Popover:** `initialFocus="none"` (it always focuses the first item, `Popover.tsx:108`), `width`. TextArea `trigger` and `suggestions` for mentions, on the listbox layer.
- **B7 Toast:** `toast({ id })` updates in place, `loading`, `onDismiss`.
- **A9 ErrorBoundary (new):** `fallback(error, retry)`, `resetKey`, `onError`, `label`.
- **A10 HotkeyField (new):** records a chord (`value: string[]`, `onChange`, controlled `recording`), capture phase, Escape cancels, ignores bare keys, shows `Kbd` while idle. After Phase 0 item 5.
- **A11 ChatMessage (new):** `role` user or assistant, avatar slot, hover `actions`, `streaming` caret, `tone="danger"`, `wide`; a documented thread pattern (ScrollArea `follow`, `useAnnounce`).
- **SearchField:** `trailing` (match count).

## Phase 3: theming and canvas

- **B10 Themes:** named themes beyond the four `PaletteName`s (dark, light, midnight, plugin themes), each a serialisable `ThemeInput` with a fixed mode; register and validate at runtime; `useCynosureTheme()` returning `{ theme, palette, colors }` and change events; the type ramp resolved to numbers.
- **B11 Data-viz:** `seriesColors` (eight, contrast-checked) on ColorTokens; `swiftChartTheme(theme, palette)` beside `monacoTheme`.
- **B12 PanZoomCanvas:** `minScale`/`maxScale` (fixed 25–800% today; Verql uses 20–300%), `dpr` and the context in `renderScreen`, pointer capture per node (drag a card vs pan), `overlays` corner slots.

## Phase 4: DataGrid (new)

Replaces AG Grid in `results/ResultsGrid.tsx` and `table/TableDataView.tsx`. Today's use is read-only.

- `columns: { key, header, width, minWidth, maxWidth, align, sortable, resizable, cell, tooltip, cellTone }`.
- Rows and columns virtualised in two dimensions (extend `virtual-window`), sticky header.
- Controlled sort; column resize through `useDrag` with `onColumnResize`.
- `onRowClick`; `selectionMode` none, row, cell or range; copy as TSV; text selection inside cells.
- ARIA grid keyboard (APG data grid).
- Value formatting by the product through `cell`; null and number styling through `cellTone` and tokens.
- Paging through `Pagination`, plus `onEndReached` for "load more".
- Fixed row and header heights from tokens (28/32 in Verql's dense mode); `--cy-data-grid-*`.
- Later: inline editing, column reorder, filter row.

## Phase 5: polish

- Field `layout="split"` and control `width`.
- CodeBlock `actions` slot.
- Disclosure `tone`/`edge` and a summary end slot.
- Notice `variant="filled"`, `compact`.
- Card `title`/`description`.
- Text `wrap`.
- ProgressBar compact without a label.
- OptionList option `trailing`, `footer`, dimmed.
- CommandPalette `filter` and a category tag.
- TagInput: Backspace re-edits the last tag, `renderTag`, `leading`.
- FileDrop `onBrowse`, controlled `value`/`onRemove`; PathField (TextField and Button, `onPick(): Promise<string | null>`).
- `iconByName` / an `icons` record on its own entry, so the main bundle stays tree-shaken.
- Tabs `chrome` variant and a ThemePreview tile only if Verql keeps its current look; ColorSwatches covers the theme picker otherwise.

## Icons

New Facet glyphs (24): `file-question`, `file-search`, `file-plus`, `window-maximize`, `window-restore`, `panel-right`, `scissors`, `text-select`, `clipboard-paste`, `function`, `rows`, `square-plus`, `cable`, `boxes`, `shield-question`, `gauge`, `check-check`, `power-off`, `loader`, `party-popper`, `rocket`, `hourglass`, `languages`, `monitor-down`.

Existing names Verql maps to: X `close`, Trash2 `trash`, AlertTriangle `warning`, Table2 `table`, Package `packageIcon`, ExternalLink `external`, Pencil/PenSquare `edit`, RefreshCcw `refreshCw`, RotateCcw `retry`, CheckCircle2 `checkCircle`, BarChart3 `chartBar`, ArrowLeftRight `swap`, Maximize2/Minimize2 `maximize`/`minimize`, MessageSquarePlus `messagePlus`, PanelLeft and PanelsTopLeft `sidebar`, GitFork `gitBranch`, KeySquare `key`, ListFilter `filter`, Code2 `code`, Undo2/Redo2 `undo`/`redo`, SquareMenu `menu`, Store `shoppingBag`, BellRing `bell`, Square (stop) `stop`, PencilRuler `edit`, ToggleRight `settings`. Keyboard glyphs (Option, ArrowBigUp, Space, Delete, ArrowRightToLine) are drawn by `Kbd` as text.

## Not gaps (checked)

Kbd, Menu and CommandPalette already read accelerator strings ("Ctrl+Shift+P", "mod+k"). Prose styles tables and blockquotes. Choice has `description`. GridItem has `span`. Tabs close and reorder. Tree loads lazily and virtualises. TextField `revealable`. Combobox `loading`. Dialog `actions`/`size`. ColorField `swatches`. TextArea `maxRows`. Disclosure `variant="card"`. Avatar `shape` and `tone="auto"`. Text `variant="code"`. Card `actions`. SideNav `badge` and `kind: "action"`. SplitPane `collapsible`. VirtualList `follow`, `wrap`, `handle.scrollToEnd`. `toast()` returns an id and `dismiss(id)` exists. AppShell is not needed: the IDE shell is SplitPane, SideNav, Tabs and StatusBar.
