# @arshad-shah/cynosure

## 0.1.0

### Minor Changes

- 77703a0: AppShell: `tabs` shows a bottom tab bar on narrow screens. SideNav: `layout="bar"` draws its top-level items as that bar.
- 77703a0: New: Calendar (the APG date grid, with `renderDay` for a month of plans), DateField (typed, stepped or picked) and TimeField (24-hour, read loosely). Dates are `YYYY-MM-DD` strings; the date and time helpers are exported.
- 77703a0: Tabs: document tabs. `Tab` takes `onClose` (a close button, and Delete on the focused tab); `TabList` takes `onReorder` (drag, or Ctrl/Cmd+Shift with the arrows). `Tabs` takes `labels`.
- 77703a0: Code colours as tokens (`--cy-color-syntax-*`, keywords from the accent, ≥ 4.5:1 everywhere and 7:1 in high contrast), an opt-in `styles/syntax.css` for CodeMirror 6, Prism, highlight.js and Shiki's css-variables theme, and `monacoTheme`, `textMateTheme` and `editorColors` for editors that take a theme object. No editor dependency.
- 77703a0: FileDrop: `target="window"` takes files dropped anywhere in the window, with a full-page overlay while they are dragged in.
- 77703a0: First release of `@arshad-shah/cynosure`: one small, themeable, accessible React UI package (tokens, foundations, controls, structure, overlays and feedback components, Facet icons and brand marks), replacing the old `@arshad-shah/cynosure-*` packages.
- 77703a0: Icons and tokens for every product: 56 new Facet icons (with a new maths category), 97 official brand marks in `@arshad-shah/cynosure/brands` (drawn exactly as their owners publish them, `color="brand"` for their own colour), `iconToSvg` for pages without React, and a React-free `@arshad-shah/cynosure/tokens` entry (`createTheme`, `themeToCss`, `themeInitScript`).
- 77703a0: KeyValueEditor: `allowFiles` lets a row's value be a file, for multipart form fields.
- 77703a0: PanZoomCanvas: `renderScreen` draws a layer in screen pixels under the content, for engines that paint into a `<canvas>`. `CanvasScreen` is exported.
- 77703a0: What the product migrations asked for, as props on existing components: Badge `color` and `dot` (steady or "live"), ProgressBar `segments`, `offset` and `marker`, Button `href`, `confirm` and `keepFocus`, TextField `revealable`, ThemeToggle `variant="cycle"`, Card `actions`, CodeBlock `activeLines`, Select option groups, Tree `onAction` and revealing an outside selection, and the `useDrag` and `useControllableState` hooks.
- 77703a0: SelectionFrame: `draw` draws a new box by dragging on the layer (region select), and `box` may be `null` before one exists. Enter places a box for keyboard users.
- 77703a0: Slider: any number of thumbs (`value` may hold more than two numbers), and `trackContent` for a custom-drawn track. `SliderValue` widens to `number | number[]`.
- 77703a0: SplitPane `unit="px"` for fixed-size panes, Popover `anchor` (a point or any element, with `trigger` optional), and NumberField `scrub` (drag the label to change the value).
- 77703a0: VirtualList: `wrap` (measured rows of any height), `follow` (stays at the end as rows arrive), `isHeader` (pinned section headings) and `handle` (`scrollToIndex`, `scrollToEnd`). `VirtualListHandle` is exported, and `moveItems` now lives in a shared foundation.
