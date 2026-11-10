# Cynosure progress

## Status

Plans 1, 2 and 3 complete on `next` (Milestones 1 and 2). Plan 4 (Milestone 3 and product migration) is written and next to build. Storybook live at https://arshad-shah.github.io/cynosure/ (deploys on every push to `next`). Not published to npm.

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

After Plan 3 (fixes from Arshad's checks of the published Storybook, 2026-11-10):

- **Published Storybook:** touch-only stories hidden from the site; the site reloads itself once when a deploy removed the chunks an open tab asks for ("Failed to fetch dynamically imported module").
- **Notice:** grid layout (icon, text and close always on one row; only the action moves under the text when narrow), tone edge, more padding, bold title, icon centred on the title line.
- **TextArea:** the grip stays a small square in the corner on touch screens (only its invisible hit area grows to 44px), and the text keeps a bottom margin so it never runs under the grip.
- **Dialog:** a focused field in the scrolling content is brought into view by the Dialog itself.
- **Overlay entrances (WebKit bug):** CI showed an open Dialog stuck at opacity 0 on WebKit, from `@starting-style` nested inside rules. Dialog, Popover, Menu, Tooltip, Select's list and Toast now enter with `@keyframes` animations, which always end in the normal visible style. Their stories assert the overlay is fully opaque once its entrance has finished (`src/test/settle.ts`).
- **CI flakes on WebKit:** the Card focus-border colour and the Dialog content-scroll story now wait for animations and transitions to settle.

## Current task

Plan 5 (`docs/superpowers/plans/2026-11-10-cynosure-coverage.md`): the generic components and icons the cross-product audit asked for. Tasks 1–7 (Facet icons, Skeleton, Grid, Steps, DescriptionList, Announcer/`useAnnounce`, `themeInitScript`, Prose, ContextMenu, SideNav, AppShell, NumberField, FileDrop, SplitPane, TagInput, CodeBlock, SortableList, Table) are done: Plan 5 is complete, and SortableList now drags with detent. Plan 6 (`docs/superpowers/plans/2026-11-10-cynosure-tools.md`) is in progress: Tasks 1–5 (FloatingToolbar/DockedToolbar/useSelectionAnchor, SignaturePad, SelectionFrame, ColorSwatches + ColorField `swatches`, CompareSlider) done; Task 6 (VirtualList) next. After Plan 6: Plan 4 Task 9 (migration issue drafts, kept outside this repo) and Task 10 (final review).

## Next step

Build Plan 4 (`docs/superpowers/plans/2026-11-10-cynosure-evidence.md`) task by task, stories first:

1. **Task 1:** done. Toasts raised inside an open Dialog show above it; they move back to the page with their remaining time and are not announced again.
2. **Task 2:** done. ProgressBar: determinate and indeterminate, labelled `role="progressbar"`, value text through `labels.value`.
3. **Task 3:** done. Slider: single or range (two thumbs that never cross), APG keys, pointer and touch dragging, vertical, marks, forms.
4. **Task 4:** done. Combobox: editable APG combobox on TextField, default or custom filter, async options (`filter={false}`, `loading`), `allowCustom`, forms.
5. **Task 5:** done. Tree: APG tree view, single and multiple selection, lazy children with retry, `virtual` for 100k rows, `renderLabel` (Prism's JSON tree needs both).
6. **Task 6:** done. CommandPalette: Ctrl/Command+K from anywhere (shadow roots too), word search over labels and keywords, groups, recent commands, wrapping arrows; `useHotkey` exported.
7. **Task 7:** done. ColorField: any CSS colour as text (names through the browser's parser), hex, rgb or oklch output, saturation area, hue and opacity Sliders, EyeDropper where supported, forms.
8. **Task 8:** carry-overs: Prism checked (it has a virtual JSON tree; Tree covers it). Slider and Combobox are already in the React 18 smoke tests. Remaining: anything the final review turns up. (The keyframe entrances are confirmed on WebKit: in CI run 387 Dialog, Popover, Menu, Tooltip and Select passed their `shownFully` checks; the only failure was a Toast test race, fixed.)
9. **Task 8b:** done. The cross-product audit ran against read-only clones of the product repos. Its results stay **outside this public repo** (Arshad has the files); only the generic build list below comes from it.
10. **Plan 5:** in progress (see Current task). The non-React path for Astro and vanilla sites, and a Starlight bridge, are deferred by Arshad.
11. **Task 9:** draft one migration issue per product repo, kept outside this repo. Open them only after Arshad reviews the drafts.
12. **Task 10:** docs, independent review, `pnpm verify`, CI green, push.

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

**Resolved in Plan 4 Task 1:** a toast raised while a modal Dialog was open sat under the dialog and was inert. An open Dialog now lends the Toaster a container (`src/overlay/toast-host.ts`) and the region renders there.

## Plans

- [x] Plan 1: Foundation (`docs/superpowers/plans/2026-11-09-cynosure-foundation.md`)
- [x] Plan 2: Milestone 1 controls (`docs/superpowers/plans/2026-11-09-cynosure-controls.md`)
- [x] Plan 3: Milestone 2 structure and overlays (`docs/superpowers/plans/2026-11-09-cynosure-structure.md`). Tasks 1–13 and the final review done.
- [ ] Plan 4: Milestone 3 and product migration issues (`docs/superpowers/plans/2026-11-10-cynosure-evidence.md`). Tasks 1–7 and 8b done; Tasks 9–10 after Plan 5.
- [x] Plan 5: coverage components and icons (`docs/superpowers/plans/2026-11-10-cynosure-coverage.md`). All 17 tasks done.

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
- **Toast:** the region (`<section aria-label>`, `popover="manual"`) is shown for the Toaster's whole life so live elements exist before text. Each toast is its own live element whose text arrives 50ms after it mounts. Collapsed toasts stay in the DOM (folded, inert) so they are never re-announced. While a Dialog inside the Toaster is open, the region is portalled into it (Plan 4 Task 1). Budget 3.75 kB (Dialog 3.25 kB).
- **Notice:** `role="alert"` only for danger. Uncontrolled dismiss hides itself; with `onDismiss` the parent decides.
- **EmptyState:** transparent; contrast is measured on the page background.
- **CopyButton:** the live `role="status"` is always rendered (empty until a result). The button's name follows the state.
- **React 18:** set `inert` as a DOM property, never as a prop (React 18 drops `inert={true}`).

## Plan 4 rulings so far

- **Toasts in dialogs (Task 1):** an open Dialog (or Sheet) inside a Toaster registers a container through `ToastHostContext` (`src/overlay/toast-host.ts`, separate so Dialog never imports Toast). The Toaster portals its region into the latest container and shows it again, which puts it above the dialog and outside the modal's inert area. Moving re-creates the toast elements, so each toast keeps a small memory in the Toaster: whether it was announced (then its text renders at once, and a danger toast comes back as `status`, not `alert`) and its remaining time (read when the timer starts, after the old element saved it).
- **ColorSwatches (Plan 6 Task 4):** radio group of colour buttons (ButtonBase `role="radio"`, roving focus in both directions; focusing chooses once a colour is chosen); swatches match by colour via `readColor` (moved to `ColorField/read-color.ts` to avoid a circular import). ColorField gains `swatches` (recents are the product's state). OKLCH output already existed. Follow-up: ColorField's area and Slider still hand-write their pointer drags; move them to detent's `bindPointer` (rule 7).
- **CompareSlider (Plan 6 Task 5):** before layer clipped with `clip-path` at `--_pos`; the divider is an APG slider (±1, Shift/Page ±10, Home/End). Detent `bindPointer` on the whole picture with `distance: 0`: the press itself jumps the divider (detent then swallows the click), a held finger drags, and a quick tap falls through to `onClick`. The split stays `direction: ltr` in RTL pages, like the pictures.
- **SelectionFrame (Plan 6 Task 3):** controlled move/resize/rotate frame; pointer gestures through detent's `bindPointer` (frame: move, with the default touch press delay; handles: `distance: 0, delay: 0`), so Escape-cancel and touch-vs-scroll come from detent. Pure geometry in `frame-math.ts` (unit-tested): drags are read in the box's own axes and the opposite side stays put. The last committed geometry is kept in a ref until new props arrive (two quick key presses used to lose one, as in SignaturePad). Test note: in user-event `[[` types one `[`.
- **SignaturePad (Plan 6 Task 2):** canvas pad (`role="img"`) with an own ink module (`ink.ts`): no perfect-freehand dependency; outline = offset of a 1-2-1 smoothed centre line (ends left in place) with round caps, radius from pressure and tilt; path data uses only M/C/Z; `inkToSvg` for PDFs. Pen pressure through a curve, steady 0.5 for mouse/touch, coalesced events, one pointer, 3 s palm rejection, `space` coordinates. The finished list lives in a ref because two quick strokes can both finish before a re-render (the second used to overwrite the first). Default height comes from a space token, not `rem` (hosts change the root font size). Budget 3.5 kB with the ink module (3.33 kB).
- **FloatingToolbar (Plan 6 Task 1):** popover-in-place (top layer, nothing added to `<body>`) holding a Toolbar; ref anchors are resolved in a layout effect because refs attach after render. Alt+F10 enters, Escape returns focus to where it came from. DockedToolbar sits at the visual viewport's bottom (`--_inset` from `visualViewport`) and renders an in-flow spacer of its height plus the keyboard, so `keepVisible` can always scroll the last content above it.
- **Detent (2026-11-10, Arshad's request):** `@arshad-shah/detent` ^0.3.1 is Cynosure's one runtime dependency (rule 7 updated). SortableList's pointer, touch and pen dragging now use detent's `sortable` (handle selector, `direction: "y"`, `delay: 0` on the grip, animation from `--cy-motion-slow`, 0 under reduced motion). Detent's own keyboard mode is off (it appends an English-only live region to `<body>` and grabs Space/Enter from nested buttons); Cynosure's keyboard mode and in-app announcements stay. On drop the node is put back and React re-renders the new order (the same pattern the tools repo uses). **Open question for Arshad:** during a pointer drag detent sets `user-select: none` and a data attribute on `<body>` (refcounted and restored), a narrow exception to rule 4. An upstream option to scope that lock to the container would remove it. SplitPane keeps its own drag: detent's `resizable` has `aria-hidden` handles and no keyboard, while a window splitter must be a focusable separator.
- **Tools repo audit (2026-11-10):** the public tools repo's shared UI was compared with Cynosure. Missing pieces worth building, by importance: anchored/selection toolbar plus a keyboard-aware docked mobile bar ("floating menus"); SignaturePad (pressure ink, palm rejection, fixed coordinate space) with a Draw/Type/Upload signing dialog; SelectionFrame (move/resize/rotate box with keyboard nudges); a pan/zoom document viewport; ColorField swatches/recents/OKLCH; VirtualList; CompareSlider; KeyValueEditor; ProgressOverlay; ShortcutHint; FloatingPalette/FloatingDock/HoverCard; SortableList grid mode and multi-select. Proposed as Plan 6.
- **Table (Plan 5 Task 17):** native table with caption, column headers and a row header per row; sortable headers hold a ButtonBase and carry `aria-sort` (ascending → descending → off; `Intl.Collator` numeric, numbers as numbers, empties last; `manualSort` for servers). Selection uses Checkbox with visually hidden labels named after the row header; ids are reported in row order. `stickyHeader` makes the scroller a focusable region named by the caption.
- **SortableList (Plan 5 Task 16):** handles are IconButtons ("Move …", `aria-pressed` while moving) with a keyboard pick-up/move/drop mode and polite announcements; pointer drags come from detent (see below). The keyboard moving state is mirrored in refs. A reordered row's DOM node is re-inserted, which blurs it: moves end only on Space/Enter/Tab/Escape, never on blur. `useAnchoredPosition` now also follows anchors that move without a scroll or resize (a rAF check of the anchor's box while open), so the handle's tooltip moves with its row.
- **CodeBlock (Plan 5 Task 15):** a figure named by its title (`aria-labelledby`, so the copy button's text is not part of the name). The body is a grid with `align-items: start` so the body scrolls vertically (gutter and code together) and the `<pre>` only sideways; a non-wrapping `<pre>` is a focusable named region. One trailing new line is dropped before highlighting and numbering.
- **TagInput (Plan 5 Task 14):** TextField plus a chip list under it (not inside, so wrapping and focus stay simple); suggestions reuse Combobox's listbox markup and styles (`combobox.css` counted in its budget). Tags are not tab stops: Arrow Left at the start of the field enters them. Each tag is its own HiddenValue under `name`; one disabled HiddenValue only listens for reset. `required` sits on the visible input while there are no tags.
- **SplitPane (Plan 5 Task 13):** a 3-track grid; the divider is a focusable `role="separator"` (APG window splitter) whose value is the start pane's percent. Drag state lives in a ref keyed by pointer id (not `hasPointerCapture`, which synthetic test events never get), as in Slider.
- **FileDrop (Plan 5 Task 12):** new foundation `FileInputBase` (the only `<input type="file">`) with `setInputFiles` (a DataTransfer) so dropped files reach forms. FileDrop: the Button opens the hidden input; drag depth is counted so child elements do not flicker the state; only `Files` drags light it up; `acceptsFile` mirrors the browser's `accept` rules. Note for tests: user-event's `upload` fakes `input.files`, which FormData ignores; use `setInputFiles`.
- **NumberField (Plan 5 Task 11):** a TextField (new `addonEnd` slot holds the steppers) with `role="spinbutton"`; text is a draft until Enter or blur, then parsed with `parseNumber` (locale group and decimal marks, typographic minus, percent as people say it) and clamped. Steps snap to the grid from `min` and round to the step's decimals. The form value is the plain number through HiddenValue; `required` stays on the visible input.
- **AppShell (Plan 5 Task 10b):** grid of header, nav and `<main>`; a ResizeObserver on the shell (not the window) switches below `collapseBelow` (768px) to a menu button plus a `start` Sheet (new Sheet side). Drawer clicks on links or buttons without `aria-expanded` close it. Skip link focuses `<main>` without touching the URL. Under the hostile host only row heights move, because the product's bar text grows.
- **SideNav (Plan 5 Task 10a):** `<nav>` with sections as lists named by their headings; links via `renderLink` (routers) or LinkBase, buttons for items without `href`; groups expand (and open on the way to `current`). The collapsed rail hides labels visually (still the names, shown in Tooltips), hides nested lists, and a group asks `onCollapsedChange(false)`. Budget 3 kB (2.77 kB with Tooltip's JS).
- **ContextMenu (Plan 5 Task 9):** Menu's panel became an internal `MenuPanel` shared by Menu and ContextMenu; `useAnchoredPosition` accepts a `VirtualAnchor` (a point rectangle). Right-click anchors at the pointer, Shift+F10 / ContextMenu key at the target, and a 500ms touch press (10px slop) at the finger because iOS sends no `contextmenu`. Budgets: ContextMenu 2.5 kB (2.07 kB with the panel and menu.css); Menu raised to 3.25 kB (3.01 kB after the panel split).
- **Prose (Plan 5 Task 8):** first use of `@scope (.cy-prose) to ([class^="cy-"]…)`: rules stop at Cynosure components. Selectors are `:where()`-flat, so scope proximity beats host tag resets while product classes win. Code blocks wrap (`pre-wrap`): axe flags an overflowing `<pre>` as an unreachable scroll region, and Prose cannot add `tabindex` to product markup.
- **themeInitScript (Plan 5 Task 7):** returns script text only (Cynosure injects nothing); validates the saved mode, swallows storage errors, escapes `<` so it can be inlined. Unit-tested in `tests/unit/theme-init-script.test.ts`.
- **Announcer (Plan 5 Task 6):** `<Announcer>` renders a polite `status` and an assertive `alert` region where it is placed (never in `<body>`); `useAnnounce()` uses the nearest one, and without one warns once and does nothing. Each message is a keyed node so repeats are read; messages clear after `clearAfter` (5 s).
- **DescriptionList (Plan 5 Task 5):** a `<dl>` in a container-query wrapper: `auto` is inline from 28rem of the list's own width. Rows are subgrids so terms share one `fit-content(40%)` column. Budget 1.25 kB.
- **Steps (Plan 5 Task 4):** an `<ol>` with `aria-current="step"` and each state read after the label (visually hidden, overridable). `onStepSelect` turns steps into ButtonBase buttons; the current and disabled steps do nothing. Lines are absolutely placed from the marker. A new `alert` icon (exclamation without a circle) marks error steps. Budget 2.5 kB (2.22 kB with its icons and ButtonBase).
- **Grid (Plan 5 Task 3):** `columns` and/or `minItemWidth` (auto-fill, capped at `columns` with a `max()` term); `GridItem` spans, clamped with `min()` on fixed grids. Unset custom properties are reset to `initial` so nested grids never inherit their parent's columns. No tokens: gaps are space tokens.
- **CI and visual stories:** a new story tagged `visual` has no baseline, so CI fails until a commit with `[baselines]` in its message runs the baseline workflow (which commits the screenshots to `next`; fetch and fast-forward before the next push). Put `[baselines]` on commits that add visual stories. A story read right after a visual story's screenshot can see stale style once in Chromium: wait (`waitFor`) for computed values.
- **Skeleton (Plan 5 Task 2):** `aria-hidden` bones; the owning region carries `aria-busy`. Text lines are 0.8em with gaps that make up the line height, so a text skeleton is exactly as tall as its text. The fill is a translucent ink tint so it shows on any surface. Budget 1.25 kB.
- **ProgressBar (Task 2):** the fill uses the tone's text colour (`--cy-color-<tone>-text`): the plain accent fell under 3:1 against the track in dark mode. No live region: completion is announced by the page (Notice or Toast). Budget 1.75 kB.
- **Slider (Task 3):** thumbs are `role="slider"` divs (no native range input, so no foundation needed); the track is the pointer target. Values snap to `step` and are rounded to the step's decimals (no float drift). A press moves the nearest thumb; on a tie between equal range thumbs, the one that can move that way. RTL flips Left/Right for horizontal sliders. Hit areas grow on `::before` only. Disabled fades the track, not the label (axe contrast). A single slider's fill starts at the bar's start (half a thumb before the first value). Budget 3.5 kB.
- **Combobox (Task 4):** built on TextField (role, ARIA and handlers pass through to its input) plus a top-layer listbox; focus never leaves the input (`aria-activedescendant`), so late results cannot swallow keys. The text filters only after the person types (opening shows everything). Leaving with unmatched text restores the last choice unless `allowCustom`. Escape order: close list, clear text, then let it reach a Dialog. Option text sets `color: inherit` explicitly (hostile `* { color }` beats inheritance). Budget 3.5 kB.
- **Tree (Task 5):** rows are a flat list of visible rows (`aria-level`, `aria-posinset`, `aria-setsize`), not nested groups, so a row's name is only its own text and only expanded branches cost anything. Rows are `memo`ised with a stable click handler (latest state through a ref); a story counts row renders (through `renderLabel`) rather than timing them, which was flaky under coverage. Disabled and loading rows have no `tabindex`. `virtual` places rows absolutely by index over a spacer and always renders the focused row; keyboard moves scroll it into view first. Prism's tree (found by cloning; code search does not index it) is virtual with custom rows, hence `virtual` and `renderLabel`. Budget 4.5 kB.
- **CommandPalette (Task 6):** built on DialogBase directly (no title row), panel near the top. `useHotkey` (`src/foundations/hotkey.ts`) listens on `document` and reads `composedPath()`, so shortcuts work from shadow roots; plain-key shortcuts skip editable targets; `data-cy-hotkeys="off"` opts out. The empty message is a disabled `option` (a listbox may only hold options). Recent commands are kept in component state for the session. Story note: user-event types into `document.activeElement`, which is the shadow host inside a shadow root, so that story dispatches input events on the input itself. Budget 4.5 kB with `useHotkey`.
- **ColorField (Task 7):** a TextField-styled control (reuses `.cy-text-field`) with a Popover picker built from Slider. `readColor` uses the token parser (hex, rgb, hsl, oklch) and falls back to a canvas for names, comparing `fillStyle` against two sentinels so an invalid colour is detected. Internal model is HSV (the area is saturation by brightness). The picker has an explicit width: inside a content-sized popover the area collapsed to 16px (caught by a story). Hex literals are not allowed in TSX, so sentinels are `rgb()` and the default is `black`. Budget 4 kB (Slider and Popover counted on their own).

## Feedback round (2026-11-09, after Plan 1)

- **LoadingDots:** its own component of three pulsing dots, with size, tone, colour and speed, visible under reduced motion. Button reuses it.
- **Button API:** `variant` (solid, soft, outline, ghost) × `tone` (accent, neutral, danger, success, warning, info). Every pair is tested distinct and ≥ 4.5:1.
- **Colours:** ember brand accent `#c2410c` with white text, crimson danger (`#b4235a` / `#ff6b8f`), and per-tone text roles.
- **Brand:** logo and lockup recoloured to ember; wordmark readable on light backgrounds; PNG and ICO regenerated.
- **Icons:** Facet icons are stroke only (accent dot removed). 184 icons in 15 categories with a categorised gallery.
- **Props:** shared prop vocabulary (`size`, `tone`, `variant`, `color`) in `docs/conventions.md` and the `cy new component` template, with Storybook controls for every prop.

## Feedback round (2026-11-09, during Plan 3)

- **Visual checks:** check everything visually, and make the variants of inputs good. This led to `labelHidden`, alignment beside errors, the read-only fill, the input-variants contract and vertical Toolbar alignment.
- **Docs pages:** they must explain the component, not repeat stories. This led to hand-written MDX for all components and foundations, plus the `cy check` docs rule.
- **TextArea:** must be resizable. It now has a hand-made grip.
- **Tables:** markdown tables in docs rendered as raw text. Fixed with remark-gfm, and a test guards it.

## Feedback round (2026-11-10, after Plan 3)

- **Storybook errors on Pages:** loading every story of a production build found touch-only stories failing on a desktop pointer (now hidden, `cy check` rule `touch-hidden`) and two real timing bugs (ChoiceBase `indeterminate`, HiddenValue validity: now layout effects). "Failed to fetch dynamically imported module" was a tab from the previous deploy; the site now reloads once on its own.
- **Notice:** looked thin and stacked vertically when narrow. Fixed with a grid and a stronger look; a story checks the alignment at two widths.
- **TextArea on mobile:** the grip moved up into the text on touch screens. Fixed; the touch story checks the grip stays in the corner and the text stays clear of it.

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
- **2026-11-10 (after Plan 3):**
  - hit areas grow invisibly (`::before`), never the visible control: the TextArea grip kept moving into the text when its own box grew on touch.
  - Storybook reloads once on `vite:preloadError` (`.storybook/stale-deploy.ts`), at most every 30 seconds.
  - transition-dependent story assertions wait up to 3 seconds and compare colours as painted RGBA including alpha (WebKit on busy CI runners).
  - no `@starting-style` for entrances: overlays use `@keyframes` (an engine that mishandles the animation still ends visible). Every overlay story checks `shownFully()` after opening.

## Verification

- **Latest local run (cloud container, 2026-11-10):** `cy check`, lint, typecheck, unit and Preact tests (287), the React 18 smoke tests (4), every story on Chromium plus the touch project (about 600 runs in the coverage pass), coverage (≥ 95% branches), build, publint, attw and size budgets pass. The changed components (Notice, TextArea, Dialog, Card) were also checked by screenshot, TextArea in phone emulation.
- **Firefox and WebKit:** cannot be downloaded in the cloud container (`cdn.playwright.dev` is blocked); CI on `next` runs them. The last complete CI runs: all green on `0e81324`; later runs failed only on WebKit (Card colour timing, the Dialog stuck at opacity 0 that led to the keyframe entrances, then a Toast test race). Each is fixed: CI run 389 on `1d670d5` passed every step on all three engines, visual regression included. Check the run after the latest push (Next step 1).
- **Published Storybook:** every story and docs page of a production build was loaded under `/cynosure/` in Chromium with no load or render errors; the stale-deploy reload was tested by swapping builds under an open tab.
- **CI on `next`:** conventions, lint, types, unit, React 18, stories on all three engines plus touch, coverage, visual regression, build, publint, attw and size.
- **Not verified:**
  - real extension contexts (Prism and Aperture shadow roots under MV3 CSP)
  - Safari and Edge outside the Playwright engines

## How to resume

```bash
git clone https://github.com/arshad-shah/cynosure.git && cd cynosure && git checkout next
nvm use && corepack enable && pnpm install
pnpm exec playwright install chromium firefox webkit   # blocked in Claude cloud containers: Chromium only there
pnpm --dir tests/react18 install && pnpm cy progress && pnpm verify
pnpm storybook
```

Then continue at "Current task" above, following `AGENTS.md`.
