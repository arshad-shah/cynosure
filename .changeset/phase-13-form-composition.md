---
'@lumen/react': minor
---

Phase 13 — form composition.

`@lumen/react` gains the scaffolding layer that ties every Phase 07 + 08 control together with a small compound component and an opt-in `react-hook-form` adapter.

- **`Form`** — thin wrapper over `<form>` with `noValidate` defaulted to `true` so native browser validation bubbles don't fight `FormMessage`.
- **`FormField`** — generates a stable `id` from `name` + `useId`, owns the context that wires its children, and lays out `FormLabel` / `FormControl` / `FormDescription` / `FormMessage` as a vertical flex column with a `space.1.5` gap. Carries `invalid` / `disabled` / `required` flags that cascade through the field.
- **`FormLabel`** — wraps `Label`, auto-threads `htmlFor` to the field id, and paints the required indicator from `FormField.required`.
- **`FormControl`** — clones its single child (an `<input>` / `<Select>` / `<Checkbox>` / etc.) and injects `id`, `name`, `aria-invalid`, `aria-describedby`, `disabled`, `required`, and the Lumen-specific `invalid` prop. Any value the child already sets wins; existing `aria-describedby` is preserved by concatenation so external references survive.
- **`FormDescription`** — wraps `HelperText` and registers a `${field.id}-description` id onto the field's `aria-describedby` list.
- **`FormMessage`** — wraps `ErrorText`, registers a `${field.id}-message` id **only when it has content**, and emits `role="alert"` only when the surrounding field is `invalid`. Returns `null` for empty children so consumers can bind `<FormMessage>{errors.field?.message}</FormMessage>` unconditionally.

New `@lumen/react/rhf` subpath exports `RHFField`, an adapter that wires `useController({ control, name, rules })` through the `FormField` scaffold — binds `field.value` / `field.onChange` / `field.onBlur` / `field.ref` onto the child control, marks the field invalid on `fieldState.error`, and surfaces `fieldState.error?.message` through `FormMessage`.

`react-hook-form` is declared as an **optional peer dependency** (`peerDependenciesMeta.react-hook-form.optional = true`). Consumers who never import `@lumen/react/rhf` don't need it installed and don't pay any runtime cost; the subpath imports `react-hook-form` statically so typed generics (`RHFField<TValues, TName>`) flow through and tree-shaking stays effective.

Three Storybook MDX recipes in `src/forms/Form/`:
- `Form.mdx` — plain uncontrolled form + `FormData` + `Object.fromEntries`.
- `RHF.mdx` — `react-hook-form` with inline `rules`.
- `RHF-Zod.mdx` — `react-hook-form` + `@hookform/resolvers/zod` with a shared Zod schema.

Per-component tsup entries (`@lumen/react/form`, `@lumen/react/rhf`) + Node10 sidecar shims. 17 new unit + integration tests covering `aria-describedby` composition and mount order, child-prop override, FormData submission, and RHF error surfacing (409/409 total pass).
