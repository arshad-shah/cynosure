---
'@lumen/react': minor
---

Phase 07 — basic form controls.

`@lumen/react` gains the foundational form control inventory. Every control implements the shared `FormControlBase<T>` / `BooleanFormControlBase` contract (`disabled`, `readOnly`, `required`, `invalid`, `size`, controlled + uncontrolled via `useControllableState`) and composes Lumen's existing design tokens rather than reinventing colour/spacing.

- **Buttons:** `Button` (variant × colourScheme × size × shape cross-product, `loading` with spinner overlay, `leftIcon`/`rightIcon`, `fullWidth`, `asChild` via Radix Slot + `Slottable`), `IconButton` (enforces `aria-label` + square shape), and `ButtonGroup` (context-provided defaults + optional `attached` segmented-control mode).
- **Text inputs:** `Input` supports left/right addons + inline elements, auto-`clearable` ×, and a built-in password show/hide toggle. `Textarea` adds `rows`, `autoResize` (native `field-sizing: content`), and `maxRows`. Both render the raw element directly — the documented single-exception to the "no raw HTML" rule because value binding / form submission / a11y semantics cannot be faithfully composed.
- **Numeric input:** `NumberInput` delegates to `react-aria-components`' `NumberField` for locale-correct parsing, keyboard (↑/↓, PageUp/Down, Home/End), and clamping; Lumen styles the group + input + stepper buttons against the shared control recipe.
- **Boolean controls:** `Checkbox` (with `indeterminate` state + `colorScheme`), `CheckboxGroup` (shared value-array context), `Radio` + `RadioGroup` (Radix radio-group under the hood for roving-tabindex), and `Switch`. All three use Radix primitives (`react-checkbox`, `react-radio-group`, `react-switch`) and wrap them with Lumen's colour tokens + label composition.
- **Form scaffolding:** `Label` (with `required` indicator), `HelperText`, `ErrorText` (`role="alert"`), and `Fieldset` (with optional `legend` prop) fill in the non-control half of a form field.
- **Shared visual recipe:** `forms/shared/control.css.ts` centralises size/variant/state styling (border, background, focus ring, invalid, disabled, readOnly, filled/ghost variants) so `<Input>`, `<Textarea>`, and `<NumberInput>` all paint the same default/hover/focus/invalid states.
- **Build:** per-component tsup entries + `exports` entries + Node10 sidecar `package.json` shims for every new subpath (`@lumen/react/button`, `/icon-button`, `/button-group`, `/input`, `/textarea`, `/number-input`, `/checkbox`, `/checkbox-group`, `/radio`, `/radio-group`, `/switch`, `/label`, `/helper-text`, `/error-text`, `/fieldset`, and a combined `/forms`). New externals added to tsup: `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, `@radix-ui/react-switch`, `react-aria-components`.
- **Tests:** 40 new unit tests cover every control — click/space toggles, controlled + uncontrolled, `indeterminate`, clearable/password toggle, group value arrays, required + role semantics, and the `asChild` anchor projection.
