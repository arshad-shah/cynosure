# Accessibility

This page lists what Cynosure's components do for keyboard, touch, low-vision and screen reader users, and how each point is checked. Everything here is taken from the source, the component READMEs and the tests that run on every change. It describes what is built and tested; it is not a WCAG conformance statement, and the last section lists what remains your job.

## Keyboard

Interactive components follow the WAI-ARIA Authoring Practices Guide (APG) pattern named in their README: tabs, menu button, select-only and editable combobox, slider, tree view, accordion, toolbar, window splitter, spinbutton and date grid. Native controls are used where they exist: Checkbox, Switch, RadioGroup and SegmentedControl sit on native checkboxes and radios, and Dialog on a native `<dialog>` opened with `showModal`.

| Component                                                                                      | Keys                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Button](../src/components/Button/README.md)                                                   | Enter and Space activate                                                                                                                                                                                                                                                                   |
| [Checkbox](../src/components/Checkbox/README.md), [Switch](../src/components/Switch/README.md) | Space toggles (a native checkbox)                                                                                                                                                                                                                                                          |
| [RadioGroup](../src/components/RadioGroup/README.md)                                           | Arrow keys move and select, wrapping and skipping disabled options; Tab lands on the checked option                                                                                                                                                                                        |
| [Tabs](../src/components/Tabs/README.md)                                                       | One Tab stop; arrows, Home and End; disabled tabs skipped; Tab moves to the panel. With `activation="manual"`, arrows move focus and Enter or Space select. Delete or Backspace closes a closable tab                                                                                      |
| [Toolbar](../src/components/Toolbar/README.md)                                                 | One Tab stop; Left and Right (Up and Down when vertical), Home and End; Tab leaves; returning lands on the last focused control                                                                                                                                                            |
| [Accordion](../src/components/Accordion/README.md)                                             | Every header is a Tab stop; Up and Down move between headers (wrapping); Home and End jump                                                                                                                                                                                                 |
| [Menu](../src/components/Menu/README.md)                                                       | Enter, Space or Down open on the first item, Up on the last; Up, Down, Home and End move; typing jumps to a match; Enter or Space selects; Escape closes and returns focus; Tab closes and moves on                                                                                        |
| [ContextMenu](../src/components/ContextMenu/README.md)                                         | Shift+F10 or the context menu key opens it on the focused target; then as Menu                                                                                                                                                                                                             |
| [Menubar](../src/components/Menubar/README.md)                                                 | One Tab stop; Left and Right move between titles (wrapping), Home and End jump; Down, Enter or Space open a menu on its first item, Up on its last; in an open menu Left and Right open the neighbouring menu; Escape closes and returns focus to the title; Tab closes and leaves the bar |
| [Select](../src/components/Select/README.md)                                                   | Down, Up, Enter or Space open; arrows, Home, End, Page Up and Page Down move; Enter, Space or Tab select; Escape closes without change; typing jumps                                                                                                                                       |
| [Combobox](../src/components/Combobox/README.md)                                               | Arrows and Enter choose while focus stays in the input; Escape closes the list, then clears the text                                                                                                                                                                                       |
| [Slider](../src/components/Slider/README.md)                                                   | Arrows by `step`, Page Up and Page Down by `largeStep`, Home, End                                                                                                                                                                                                                          |
| [NumberField](../src/components/NumberField/README.md)                                         | Arrows step, Page Up and Page Down step by `largeStep`, Home and End jump to `min` and `max`, Enter commits                                                                                                                                                                                |
| [SplitPane](../src/components/SplitPane/README.md)                                             | Arrows move the divider, Home and End go to the limits, Enter collapses and restores (with `collapsible`)                                                                                                                                                                                  |
| [Tree](../src/components/Tree/README.md)                                                       | One Tab stop; Up, Down, Home, End; Right opens or enters, Left closes or goes to the parent; `*` opens all siblings; type-ahead; Space selects, Enter runs `onAction`                                                                                                                      |
| [Calendar](../src/components/Calendar/README.md)                                               | One Tab stop on the focused day; arrows by day and week; Home and End to the ends of the week; Page Up and Page Down by month, with Shift by year; Enter or Space chooses                                                                                                                  |
| [SortableList](../src/components/SortableList/README.md)                                       | Space or Enter picks a row up and drops it; arrows move it; Home and End move it to the ends; Escape cancels; Tab drops it in place                                                                                                                                                        |
| [Dialog](../src/components/Dialog/README.md), [Sheet](../src/components/Sheet/README.md)       | Focus moves inside on open and returns on close; Escape closes                                                                                                                                                                                                                             |
| [Tooltip](../src/components/Tooltip/README.md)                                                 | Opens at once on keyboard focus; Escape dismisses                                                                                                                                                                                                                                          |

**Roving focus.** `useRovingFocus` (`src/foundations/roving-focus.ts`) gives a group one Tab stop: arrows move between items and skip disabled ones, Home and End jump, horizontal arrows follow the reading direction, and while focus is elsewhere the Tab stop follows the selected item. Text inputs inside a group keep their own arrow, Home and End keys. Tabs, Toolbar, Menu and ColorSwatches use it. The slider-style keys (Slider, SplitPane, CompareSlider, ColorField's area) come from one shared helper, `stepKey` in `src/foundations/keys.ts`.

**Type-ahead.** Select, Menu (and so ContextMenu) and Tree share `useTypeahead` (`src/foundations/listbox.ts`): typed letters build a word for 500 ms, and repeating one letter cycles through the matches. Select ignores keys typed during IME composition.

**Focus rings.** Focus is shown on `:focus-visible` with an outline whose width is the `--cy-border-focus` token (3px by default). Two forms are used: an outline in `--cy-color-ring`, or, as on Button, a ring drawn with `box-shadow` over a transparent solid outline, which is the part forced-colours mode paints.

**Overlays, Escape and focus return.** Everything that floats registers with one layer stack for the whole page (`useDismiss` in `src/overlay/dismiss.ts`): Tooltip, Popover, Menu, Dialog (and Sheet, which is a Dialog), CommandPalette, and the drop-down lists of Select, Combobox, TagInput and TextArea's mentions.

- Escape closes only the topmost layer: the most recently opened one with no other open layer nested in it. A Menu, Select or Tooltip inside a Dialog closes first.
- When a layer closes, focus returns to its trigger, but only if focus was inside the layer or had been lost to the body. Focus the user moved elsewhere is left alone.
- A modal Dialog makes the page behind it inert (native modal behaviour).
- The stack works across shadow roots.

**Skip link.** [AppShell](../src/components/AppShell/README.md) renders a skip link ("Skip to content", `labels.skip`). It appears on the first Tab and moves focus to `<main>` without changing the URL.

## Touch targets

Every pressable control has a hit area of at least 24px, and at least 44px on coarse pointers (touch screens). The hit area is separate from the visible control, which keeps its size.

How it works: the control carries an invisible `::before` sized `max(100%, var(--_hit))`. `--_hit` is `--cy-hit-min` (24px), and switches to `--cy-hit-coarse` (44px) under `@media (pointer: coarse)`. Both are global tokens (`hit.min`, `hit.coarse`), so a theme can raise them. Components built from Button and IconButton get the hit area from them; list-like components make the row itself 44px on coarse pointers instead (Menu and Select rows, Disclosure triggers, Calendar days).

How it is tested: stories tagged `touch` run in their own test project, a Chromium context with `hasTouch` and `isMobile` set. They first assert that `(pointer: coarse)` matches, then measure the `::before` and expect at least 44px, then tap with a touch pointer and expect the action to fire. 43 story files have at least one such story. The 24px floor is measured the same way in the ordinary browser projects (for example Button's `HitTargetCompact`: a `sm` button in a compact theme is under 24px tall and its hit area is not).

Tooltip never opens on touch, so nothing depends on hover there.

## Colour contrast

Contrast is checked at three levels.

**1. When a theme is built.** `createTheme` computes colours so that text pairs reach a ratio, and the unit tests (`tests/unit/tokens.test.ts`, `tests/unit/editor-themes.test.ts`) assert the result:

| Pair                                                                                                       | Ratio | Palettes tested                                                     |
| ---------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------- |
| On-accent text on the accent fill                                                                          | 4.5:1 | light, for seven accents including white, black and an OKLCH colour |
| On-accent text on the hover and active fills                                                               | 4.5:1 | light and dark, six accents                                         |
| Tone text (`accent`, `danger`, `success`, `warning`, `info`) on the surface and on its strongest soft tint | 4.5:1 | light and dark, five accents                                        |
| Code colours on every surface code sits on                                                                 | 4.5:1 | light and dark                                                      |
| Code colours in the contrast palettes                                                                      | 7:1   | light-contrast and dark-contrast                                    |
| Muted text on the background in the contrast palettes                                                      | 7:1   | light-contrast and dark-contrast                                    |

**2. As rendered.** Play tests read computed colours from the page and measure the ratio against what is actually behind the element (`src/test/color.ts`). These assert 4.5:1 for text in Button (every variant and tone), Badge (every tone and variant), Link (every tone), Notice (title and body in every tone, in light and dark), EmptyState, DescriptionList, Steps, SideNav, Prose and CodeBlock. A few non-text parts are held to 3:1: the ProgressBar fill against its track, a Steps border against the page and the ColorField swatch border.

**3. axe.** Every story is checked by axe-core through `@storybook/addon-a11y` with `a11y.test: "error"`, so a violation fails the story. No story overrides or disables rules. Stories render in light mode with normal contrast unless the story sets a theme itself, so that is the mode axe sees by default.

**More contrast.** `contrast="more"` on `CynosureTheme` (or `system`, which follows `prefers-contrast: more`) swaps in the contrast palettes: ink becomes pure black or white, muted text is raised to at least 7:1 on the background, lines take the muted colour, and code colours are raised to 7:1. Visual-regression stories are screenshotted in light, dark, and dark with more contrast.

## Forced colours (Windows High Contrast)

Coverage is partial and specific. 35 of the 71 stylesheets have a `@media (forced-colors: active)` block; each fixes one thing that would otherwise vanish when the system replaces colours. The rest rely on the browser's defaults for native elements, borders and text.

| What is restored                                                 | Components                                                                                                                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Selected or current item, drawn as a `Highlight` outline         | Tabs, Tree, VirtualList, Table rows, Calendar days, SideNav's current link, ColorSwatches                                                                                                  |
| Active option in a list, as a `Highlight` outline                | Combobox, CommandPalette, Menu (the focused item)                                                                                                                                          |
| A `CanvasText` border or outline on floating and tinted surfaces | Dialog, Popover, HoverCard, Toast, Notice, Card, CommandPalette, FloatingToolbar, TagInput tags, code in Prose                                                                             |
| Fills that carry meaning, in `Highlight` and `CanvasText`        | Slider (track, fill, thumb), ProgressBar (track, fill, segments, markers), Steps (markers, lines, completed steps), SplitPane and CompareSlider dividers, Badge dot, Skeleton (`GrayText`) |
| Focus outline colour set to `Highlight`                          | Disclosure, SideNav, Steps, CodeBlock; SplitPane's divider turns `Highlight` when focused                                                                                                  |
| Drag and drop states                                             | FileDrop (drop target border), SortableList (the row being moved), SelectionFrame, PanZoomCanvas minimap                                                                                   |
| Real colours kept with `forced-color-adjust: none`               | ColorField and ColorSwatches swatches (the colour is the content); SignaturePad ink uses the system text colour                                                                            |
| Marked lines and selections                                      | CodeBlock marked lines, the editor selection in `syntax.css`                                                                                                                               |

Button's focus ring uses a transparent solid outline so that forced colours has an outline to paint; a play test asserts the outline is solid and has a width. No test runs with forced colours emulated, so the blocks above are verified by reading the CSS, not by a browser test.

## Reduced motion

Under `prefers-reduced-motion: reduce`, `src/styles/base.css` sets `animation-duration: 0s`, `animation-iteration-count: 1` and `transition-duration: 0s` (all `!important`) on every element with a `cy-` class and its pseudo-elements. Nothing is hidden or removed; changes simply happen at once.

On top of that, 22 component stylesheets turn their own animations off explicitly (for example Skeleton's animation, ProgressBar's indeterminate fill, Dialog's and Toast's entrances, Slider's thumb transition). The animations driven from JavaScript check the same media query: Tabs' and SortableList's reorder animations run with a duration of 0, and Toast skips its exit transition. Icon micro-animations are turned off too.

A product can also switch motion off for everyone with `createTheme({ motion: "reduced" })`, which sets the three duration tokens (`fast`, `base`, `slow`) to 0. See [Theming](./theming.md).

## Screen readers

**Names.** Controls take their accessible name from a prop, not from luck: `label` on fields, sliders, toolbars, segmented controls and navigation; `title` on Dialog and Sheet (rendered as the `h2` and used as the dialog's name, with `description` as its description). [IconButton](../src/components/IconButton/README.md) requires `label` in its types; it is both the name and the tooltip text. [Field](../src/components/Field/README.md) links descriptions through `aria-describedby`, and an error is announced (`role="alert"`), linked, and marks the control invalid.

**Built-in strings.** Any text a component supplies itself ("Close", "Dismiss", "Copy", "Skip to content", "(opens in new tab)") is English by default and can be replaced through a typed `labels` prop. 36 components have one, and stories test the override (AppShell's, for example, runs with German strings).

**Announcements.**

- [Announcer](../src/components/Announcer/README.md) renders two visually hidden live regions, polite (`role="status"`) and assertive (`role="alert"`), and `useAnnounce()` speaks through the nearest one. Each message is a new node, so the same message twice is read twice. Without an `<Announcer>` above it, `announce` does nothing and warns once in the console.
- [Toast](../src/components/Toast/README.md) is announced once: `role="status"`, or `role="alert"` for `danger`. The text is inserted into a live element that already exists. Timers pause while the pointer is over the toasts, while focus is inside them and while the page is hidden.
- [CopyButton](../src/components/CopyButton/README.md) announces the result through a `role="status"` that exists before the click, and the button's name changes with it.
- [Notice](../src/components/Notice/README.md) is `role="alert"` for `danger` and `role="status"` otherwise.
- SortableList announces picks, moves, drops and cancels; TagInput announces additions and removals; Calendar announces the month as it changes.

**Hidden text.** Text meant only for assistive technology is clipped, not `display: none`, so it is still read: the "(opens in new tab)" suffix on an external Link, the spoken form of Kbd keys, the full date on each Calendar day, and the labels of a collapsed SideNav.

**Icons.** `<Icon>` is decorative by default: `aria-hidden` and `focusable="false"`. Giving it a `label` makes it `role="img"` with that name. See [Icons](./icons.md).

**No `title` attributes.** Native `title` tooltips are not used anywhere; `cy check` fails on any `title=`. Tooltips are the [Tooltip](../src/components/Tooltip/README.md) component, which is hoverable, stays while hovered or focused and closes on Escape.

## Text direction and zoom

**Right to left.** Set `dir="rtl"` on any ancestor; components read the computed direction (`isRtl` in `src/foundations/dir.ts`), so nothing needs a prop. The stylesheets use logical properties for spacing, sizing and placement (`margin-inline`, `padding-block`, `inline-size`, `inset-inline`); there is no `margin-left`, `margin-right`, `padding-left` or `padding-right` in any component stylesheet. Keys follow the reading direction: horizontal arrows in roving groups, Tabs, Toolbar, Tree (Left and Right swap), Calendar and SplitPane, and in a Slider Right lowers the value. Sheet's `start` and `end` sides and Toast's `start` and `end` positions follow it as well. 23 story files include a `dir="rtl"` play test.

**Scale.** Sizes are tokens in px, multiplied by the theme's `scale`: `compact` 0.875, `comfortable` 1, `spacious` 1.2, or any number. Scale changes control heights, spacing and font sizes together (a `md` control is 28, 32 or 38.4px tall). The hit-area tokens are not scaled, so a compact theme keeps its 24px and 44px minimums. Token values are emitted in px, not rem, so they follow browser zoom but not a change to the browser's default font size alone; use `scale` to offer larger controls.

## How it is tested

- **Stories are the tests.** Every story has a play function, and `pnpm test:stories` runs them all in real browsers: Chromium, Firefox and WebKit, plus the touch project (Chromium with touch and mobile emulation) for stories tagged `touch`. See [Testing](./testing.md).
- **Behaviour only.** A test names a behaviour and fails when it breaks: pointer, keyboard, touch, focus, values, disabled, labels override, RTL, hostile host, and shadow root where relevant. There are no "it renders" or snapshot-only tests.
- **axe on every story**, in every one of those browsers, with violations as errors.
- **Hostile host.** `computeUnderHostileHost` compares computed styles with and without aggressive host CSS (Tailwind's preflight plus globals that force colours, sizes, letter spacing and `box-sizing` on everything). 60 story files use it.
- **Unit tests** cover the contrast maths, the layer stack (`tests/unit/dismiss.test.tsx`), roving focus, type-ahead and the slider keys.
- **`cy check`** (`pnpm check`, see [Conventions](./conventions.md)) fails the build on the rules that protect accessibility:

| Rule              | What it prevents                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `native-elements` | A hand-rolled `<button>`, `<a>`, `<input>`, `<select>` or `<dialog>` outside the foundations, so every control shares one tested implementation |
| `title-attr`      | Native `title` tooltips                                                                                                                         |
| `glyphs`          | Emoji or text characters standing in for icons                                                                                                  |
| `structure`       | A component without play tests                                                                                                                  |
| `touch-hidden`    | A touch story that would run, and fail, under a desktop pointer                                                                                 |

## What is left to you

The components cannot know your content. These follow directly from how they work:

- **Name everything.** `label` is required on IconButton by the types, but most other labels are plain strings you supply: give every field, Slider, Toolbar, TabList and SideNav a `label` that says what it is. `labelHidden` hides a label visually; it does not make one optional.
- **Label meaningful icons.** `<Icon>` is hidden from screen readers unless you pass `label`. An icon that carries information on its own needs one.
- **Translate the built-in strings.** The defaults are English. If your product is not, pass `labels` everywhere a component has it.
- **Mount an `<Announcer>`.** `useAnnounce()` is silent without one. Use it for changes that have no visible message; Toast and Notice already announce themselves.
- **Keep headings in order.** Dialog and Sheet render their title as an `h2`. The rest of the heading outline is yours.
- **Write link and button text that makes sense alone.** Link renders the text you give it.
- **Check the colours you add.** `createTheme` keeps its derived pairs readable for any accent, but colours you set yourself through `palettes`, `tokens`, component tokens or a `color` prop are used as given.
- **Do not show a mounted status Notice and expect it to be read.** A non-danger Notice that appears already filled is usually only read in place; use Toast for a passing message that must be announced.
- **Set `dir` and `lang`.** Cynosure never writes to `<html>`; the document language and direction are the page's.
- **Test in forced colours** if your users rely on it. Coverage there is the list above, and it is not exercised by an automated test.
