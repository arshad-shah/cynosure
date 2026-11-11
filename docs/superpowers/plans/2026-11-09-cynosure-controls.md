# Cynosure Milestone 1 Controls Implementation Plan (Plan 2 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the everyday controls every product needs: form foundations, Field, TextField, SearchField, TextArea, Link, Checkbox, Switch, RadioGroup, SegmentedControl, Tooltip, Select, Badge, Kbd and ThemeToggle. Add the Vite adapter and optional font, then fold in the deferred review minors.

**Architecture:** As in Plan 1. New native elements only in `src/foundations` (`LinkBase`, `InputBase`, `TextAreaBase`, `ChoiceBase`, `HiddenValue`). Composites reuse existing components: clear buttons are `IconButton`, the toggle is `SegmentedControl`, tooltips are `Tooltip`. Overlays use the Popover API (top layer) with a tiny shared JS positioner, `src/overlay/position.ts`, so behaviour is identical in every engine. Every component follows the prop vocabulary (`size`, `tone`, `variant`, `color`, behaviour props, `labels`) and has full Storybook controls.

**Tech Stack:** Unchanged from Plan 1.

**Spec:** `docs/superpowers/specs/2026-11-09-cynosure-next-design.md` (§6.5 overlays, §6.6 foundations and forms, §6.9 touch and a11y, §8 Milestone 1). Conventions: `docs/conventions.md` (prop vocabulary).

## Global Constraints

- Plan 1's constraints hold: zero runtime deps, `.js` import extensions, doubled root selectors, tokens only, behavioural tests, no AI attribution, push with the `arshad-shah` account.
- Every form control works inside a native `<form>`: it submits via `FormData` (`name`/`value`), responds to `form.reset()`, and supports `required` with constraint validation (`form.checkValidity()`).
- Every control supports controlled (`value`/`checked` + `onChange`) and uncontrolled (`defaultValue`/`defaultChecked`) use.
- Built-in strings are English, overridable through a typed `labels` prop.
- Keyboard follows the WAI-ARIA APG pattern named in each task. Touch: hit area ≥ 24px, ≥ 44px on coarse pointers (stories tagged `touch` assert it).
- Overlays (Tooltip, Select list) render in the top layer via `popover`. They never portal to `document.body` and never write to `<html>`/`<body>`, so they work in shadow roots.
- Each component: stories with play tests (pointer, keyboard, touch, form, controlled/uncontrolled, disabled, RTL, hostile host), README with props, tokens and `## Used by`, size budget ≤ 3 kB JS + CSS gzip (Select ≤ 5 kB).

## Review Focus

1. **IME composition.** Typing Japanese/Chinese into TextField or the Select typeahead must not trigger Enter-to-submit or a jump in the selection mid-composition. (Tasks 3, 10)
2. **Overlay near viewport edges and inside scroll containers.** Tooltip and Select lists flip and shift to stay fully visible and follow their trigger on scroll. (Tasks 9, 10)
3. **`form.reset()` on every control.** It restores the default value or checked state and its visible UI. (Tasks 3, 4, 6, 7, 8, 10)
4. **Rapid toggling and double activation.** Double-clicking a Switch or a segment yields exactly two changes, and holding Space never auto-repeats a toggle. (Tasks 6, 8)
5. **Long option labels and many options.** Select with 200 options scrolls the active option into view, keeps typeahead working, and truncates long labels. (Task 10)

---

### Task 1: Form foundations and field wiring

**Files:** `src/foundations/{LinkBase,InputBase,TextAreaBase,ChoiceBase,HiddenValue}/` (tsx, stories, README) and `src/foundations/field.ts`.

**Interfaces:**
- **`LinkBase`:** `forwardRef<HTMLAnchorElement, AnchorHTMLAttributes>`. Adds `rel="noopener noreferrer"` when `target="_blank"`. Rejects `javascript:` hrefs (renders without `href`).
- **`InputBase`:** `forwardRef<HTMLInputElement, InputHTMLAttributes & { invalid?: boolean }>`. Maps `invalid` to `aria-invalid`.
- **`TextAreaBase`:** the same shape for `<textarea>`.
- **`ChoiceBase`:** `forwardRef<HTMLInputElement, { type: "checkbox" | "radio"; checked?; defaultChecked?; indeterminate?: boolean; …input attrs }>`. A visually hidden native input that stays focusable and clickable through its skin. `indeterminate` is set through a ref effect.
- **`HiddenValue`:** `{ name?: string; value: string; form?: string; required?: boolean; onReset?: () => void }`. A hidden input for custom widgets. `required` is enforced with `setCustomValidity`, and `onReset` listens to the form's `reset` event.
- **`useField({ id?, description?, error?, required? })`** returns `{ id, labelId, descriptionId, errorId, describedBy, invalid }`.

**Tests (stories):**
- `LinkBase opens external links safely and drops javascript: hrefs`
- `InputBase maps invalid to aria-invalid`
- `ChoiceBase keeps the native input focusable and submits through FormData`
- `ChoiceBase supports indeterminate`
- `HiddenValue submits value, fails validity when required and empty, and calls onReset on form reset`
- unit test on `useField` id wiring

### Task 2: Field

**Files:** `src/components/Field/`

**Interfaces:**
- **Props:** `<Field label: ReactNode; description?: ReactNode; error?: ReactNode; required?: boolean; size?: Size; children: (field: FieldRender) => ReactNode | ReactElement>`.
- **Rendering:** label (with a required marker drawn by CSS, not a glyph), the control, the description, and the error with `role="alert"` (`aria-live` polite).
- **Shared shape:** `FieldRender` is what `useField` returns. TextField, TextArea, Select and RadioGroup render through `Field`.
- **Tokens:** `field-gap`, `field-label-weight`, `field-error-color`.

**Tests:** `label is associated with the control`, `description and error are in aria-describedby`, `error announces and marks the control invalid`, `required marker is CSS (no text glyph) and sets required on the control`.

### Task 3: TextField and SearchField

**Files:** `src/components/TextField/`, `src/components/SearchField/`

**Interfaces:**
- **`TextField`:**
  - Field props plus `value?`, `defaultValue?`, `onChange?(value: string, event)`.
  - Input attributes: `type` (`text | email | url | tel | password | number`), `name`, `placeholder`, `disabled`, `readOnly`, `required`, `maxLength`, `autoComplete`, `inputMode`.
  - `size`, `variant` (`outline | soft`), `iconStart?`, `iconEnd?`, `clearable?`.
  - `labels?: { clear: string }` (default "Clear").
  - The clear control is an `IconButton` with variant `ghost`, size `sm` and the `close` icon.
- **`SearchField`:** a TextField preset with type `search` semantics (role `searchbox`), the `search` icon at the start, clearable by default, and `onSubmit?(value)` on Enter. It ignores Enter while composing (`isComposing`). Escape clears the field, and a second Escape blurs it.

**Tests:**
- typing calls onChange; controlled and uncontrolled
- clear button empties, refocuses the input, and is hidden when the field is empty
- Escape clears in SearchField
- Enter submits, but not during IME composition (dispatch a `compositionstart` event, then Enter)
- `form.reset()` restores the default
- required fails `checkValidity()`
- hostile host
- touch tap focuses
- RTL places the start icon on the right

### Task 4: TextArea

**Files:** `src/components/TextArea/`

**Interfaces:** Field props plus `value?`, `defaultValue?`, `onChange?`, `rows?` (minimum rows, default 3), `maxRows?` (auto-grow cap, default 12), `maxLength?`, `showCount?`, and `labels?: { count: (n: number, max?: number) => string }`. Auto-grow measures `scrollHeight` on input; there is no hidden mirror element. The counter is `aria-live="polite"` and is linked through `aria-describedby`.

**Tests:** `grows with content up to maxRows then scrolls`, `counter updates and announces`, `maxLength enforced`, `reset restores default and height`, `labels.count override`, `hostile host`.

### Task 5: Link

**Files:** `src/components/Link/`

**Interfaces:** `<Link href tone? ("accent" default) size? external? iconEnd? children>`. `external` adds `target="_blank"`, the `external` icon, and visually hidden text "(opens in new tab)", overridable through `labels.external`.

**Tests:** `navigates/fires click`, `external link announces new tab and has safe rel`, `focus ring visible`, `tone colours use text roles (contrast ≥ 4.5)`.

### Task 6: Checkbox and Switch

**Files:** `src/components/Checkbox/`, `src/components/Switch/`

**Interfaces:**
- **`Checkbox`:** `checked?`, `defaultChecked?`, `indeterminate?`, `onChange?(checked)`, `name`, `value`, `required`, `disabled`, `label`, `description?`, `size`, `tone` (default `accent`). Built on `ChoiceBase`. The check mark and dash are Facet `check` and `minus` icons.
- **`Switch`:** the same props without `indeterminate`. `role="switch"` on the checkbox input. The thumb animates and follows reduced motion.

**Tests:**
- click, Space and label click toggle
- double click gives exactly two changes
- holding Space toggles once (`keydown` repeat is ignored)
- indeterminate state is announced as `aria-checked="mixed"`
- FormData includes the value only when checked
- reset restores the default
- required is validated
- coarse-pointer hit target ≥ 44 (`touch` tag)
- hostile host

### Task 7: RadioGroup

**Files:** `src/components/RadioGroup/`

**Interfaces:** `<RadioGroup label name value? defaultValue? onChange?(value) options: { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }[] orientation? required? size? tone?>`. Uses native radios (`ChoiceBase`) for roving focus and arrow keys.

**Tests:** `arrow keys move and select (and wrap)`, `Tab enters on the checked option`, `disabled options are skipped`, `FormData`, `reset`, `required`, `RTL arrow direction`, `touch`.

### Task 8: SegmentedControl

**Files:** `src/components/SegmentedControl/`

**Interfaces:** `<SegmentedControl label options: { value; label?; icon?: IconData; disabled? }[] value? defaultValue? onChange? name? size? tone? fullWidth?>`. `role="radiogroup"` with native radios (`ChoiceBase`). Icon-only options need a `label` (it becomes the accessible name). There is an animated active indicator, and a `HiddenValue` is not needed because the radios submit themselves.

**Tests:** `arrow keys select`, `icon-only segments are named`, `double activation yields one change per distinct value`, `reset`, `indicator follows selection (reduced motion: no transition)`, `touch`.

### Task 9: Tooltip (and IconButton migration)

**Files:** `src/overlay/position.ts` (+ unit tests), `src/components/Tooltip/`. Modify `IconButton` to use `Tooltip` and delete its inline tip CSS.

**Interfaces:**
- **`computePosition(anchor: DOMRect, floating: { width; height }, viewport: { width; height }, placement: "top"|"bottom"|"start"|"end", offset: number, dir: "ltr"|"rtl") → { x, y, placement }`:** a pure function with flip and shift. It is unit-tested exhaustively.
- **`<Tooltip content: ReactNode placement? delay? (300ms) children: ReactElement>`:** clones the trigger with `aria-describedby`, uses `popover="manual"`, opens on hover (after the delay) and on focus-visible, and closes on Escape, blur and pointer leave. It never opens on touch long-press (WCAG 1.4.13: hoverable, dismissible, persistent).

**Tests:**
- unit: flip at each edge, shift inside the viewport, RTL start/end
- stories: hover shows after the delay; focus shows; Escape hides; the tooltip is hoverable (moving into it keeps it open); `aria-describedby` is wired; it repositions on scroll; it works inside a shadow root
- IconButton: the existing tooltip stories still pass

### Task 10: Select

**Files:** `src/components/Select/`

**Interfaces:**
- **Props:** `<Select label options: { value: string; label: string; description?: string; icon?: IconData; disabled?: boolean }[] value? defaultValue? onChange?(value) placeholder? name? required? disabled? size? variant? labels?: { placeholder; empty }>`.
- **Structure:** the trigger is `ButtonBase` with `role="combobox"`. The list is a `popover` with `role="listbox"` (`aria-activedescendant`). It submits through `HiddenValue`.
- **Keyboard (APG select-only combobox):**
  - Arrow keys, Home, End, PageUp and PageDown move through options.
  - Enter and Space select.
  - Escape closes.
  - Typeahead (500 ms buffer) is ignored while composing.
  - Tab selects and moves on.
- **Behaviour:** the active option scrolls into view. On coarse pointers the list grows to 44px rows.

**Tests:**
- open with click, Enter, Space and ArrowDown; select with click and Enter
- Escape restores focus to the trigger
- typeahead jumps; disabled options are skipped
- 200 options: End scrolls the last option into view
- long labels truncate
- FormData, reset and required
- controlled
- touch rows ≥ 44 (`touch` tag)
- flips above when there's no room below
- works inside a shadow root
- hostile host

### Task 11: Badge and Kbd

**Files:** `src/components/Badge/`, `src/components/Kbd/`

**Interfaces:**
- **`Badge`:** `<Badge tone variant? ("soft" | "solid" | "outline") size? icon? children>`. Uppercase mono eyebrow style.
- **`Kbd`:** `<Kbd keys: string[]>`. Renders key caps joined by thin separators (CSS, not "+" glyphs). The accessible name is "Control plus K".

**Tests:** `tone/variant contrast ≥ 4.5 for every pair`, `Kbd reads as a key combination to screen readers`, `hostile host`.

### Task 12: ThemeToggle

**Files:** `src/components/ThemeToggle/`

**Interfaces:** `<ThemeToggle value? defaultValue? onChange? storage? labels?: { light; dark; system; label }>`. A `SegmentedControl` with the `sun`, `moon` and `monitor` icons. Uncontrolled mode uses `useColorMode({ storage })`.

**Tests:** `selecting dark sets mode and persists`, `system resolves from the OS`, `labels override`, `keyboard`.

### Task 13: Vite adapter and optional font

**Files:** `src/adapters/vite/index.ts` (+ unit test), `src/fonts/hanken.css`, the Hanken Grotesk variable woff2 (OFL, latin subset) and its `LICENSE`, and the `./fonts/*` export.

**Interfaces:** `cynosure({ theme?: ThemeInput; selector?: string })` returns a Vite plugin that:
- resolves `virtual:cynosure/theme.css` to `themeToCss(createTheme(theme), selector)`
- resolves `virtual:cynosure/inline` to the CSS string (for shadow roots)

**Tests:**
- unit: the plugin's `resolveId` and `load` return the expected CSS for a given theme
- an invalid theme fails the build with `CynosureThemeError`
- the package export map includes `./fonts/*`

### Task 14: Deferred review minors

Fix with tests:
- **M1:** garbage `rgb()` input names the input.
- **M3:** scale must be finite and between 0.5 and 3.
- **M4:** radius re-derives after height overrides.
- **M5:** selector lists are wrapped in `:is()`.
- **M6:** async storage never overwrites a later `setMode`.
- **M10:** `"use client"` banner on interactive modules (Vite `banner` for component entry files) and a React 18 smoke test.
- **M11:** budgets for Icon, `createTheme` and every new component.
- **M13:** reduced motion reaches component roots (tokens collapse durations; roots use `--cy-motion-*`).
- **M14:** `target="document"` restores the host's prior attributes.
- **M7 (part):** `cy check` checks foundations CSS literals, `createElement` of native tags, and glyphs in string literals inside JSX expressions; the `title` rule allows a typed `title` prop on components.

Each fix gets a test that fails before the change.

### Task 15: Visual baselines for dark and contrast; docs; progress; push

- The visual hook screenshots `visual` stories in light, dark and dark-contrast: it re-renders with `CynosureTheme` mode/contrast globals through `context.globals`. Regenerate baselines with a `[baselines]` commit.
- Update the README component list, Introduction, PROGRESS (Plan 2 done, Plan 3 next) and the migration doc's component coverage.
- Run `pnpm verify`; CI must be green; push.
