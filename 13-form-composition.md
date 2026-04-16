# Phase 13 — Form composition

> **Goal:** Tie every form control together with `Form`, `FormField`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` — and a documented integration recipe for `react-hook-form` and raw uncontrolled HTML forms.

**Depends on:** Phases 01–12.
**Blocks:** Phase 14 (some a11y audit stories use `Form`).

---

## What this phase is not

- **Not a form state library.** We don't re-implement react-hook-form or Formik. We provide the structural + accessibility scaffolding and show consumers how to plug their preferred state library in.
- **Not a validation library.** We don't ship zod/yup integration. We expose the seams for them.

---

## What this phase ships

1. **`Form`** — root element; provides form context.
2. **`FormField`** — a row/section representing one logical field (label + control + description + error).
3. **`FormLabel`** — wraps `Label`; auto-wires `htmlFor`.
4. **`FormControl`** — wraps a form input; auto-wires `id`, `aria-describedby`, `aria-invalid`.
5. **`FormDescription`** — wraps `HelperText`; auto-wires `id` into `aria-describedby`.
6. **`FormMessage`** — wraps `ErrorText`; auto-wires `id` into `aria-describedby`; renders nothing when no error.
7. **Three integration recipes in Storybook MDX**:
   - Plain uncontrolled HTML form + FormData.
   - `react-hook-form` + Controller-free pattern.
   - `react-hook-form` with Zod resolver.

---

## The central problem this solves

Manual form wiring is error-prone:

```tsx
// ❌ without FormField
<Stack gap="1">
  <Label htmlFor="email" required>Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={`${errors.email ? 'email-error' : ''} email-help`.trim() || undefined}
  />
  <HelperText id="email-help">We'll never share your email.</HelperText>
  {errors.email && <ErrorText id="email-error">{errors.email.message}</ErrorText>}
</Stack>
```

Every field requires juggling three IDs, conditional `aria-describedby`, and `aria-invalid`. Consumers get it wrong.

With `FormField`:

```tsx
// ✅ with FormField
<FormField name="email" invalid={!!errors.email}>
  <FormLabel required>Email</FormLabel>
  <FormControl>
    <Input type="email" />
  </FormControl>
  <FormDescription>We'll never share your email.</FormDescription>
  <FormMessage>{errors.email?.message}</FormMessage>
</FormField>
```

`FormField` generates IDs, threads them through context, and auto-wires `aria-describedby` / `aria-invalid` / `htmlFor`. Every consumer field is accessible by construction.

---

## The `FormField` context

```ts
interface FormFieldContextValue {
  /** Stable unique ID for this field; derived from name or useId. */
  id: string;
  /** The `name` attribute used for form submission. */
  name?: string;
  /** IDs of description elements, joined into aria-describedby. */
  describedBy: string[];
  /** Whether the field is invalid. */
  invalid: boolean;
  /** Whether the field is disabled. */
  disabled: boolean;
  /** Whether the field is required. */
  required: boolean;
  /** Register a described-by ID (FormDescription and FormMessage call this on mount). */
  registerDescribedBy: (id: string) => () => void;
}
```

Created via our `createContext` helper. Each sub-component uses it.

### `FormField`

```tsx
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ name, invalid, disabled, required, children, ...rest }: FormFieldProps) {
  const id = useId();
  const fieldId = name ? `${name}-${id}` : id;
  const [describedBy, setDescribedBy] = useState<string[]>([]);
  const registerDescribedBy = useCallback((newId: string) => {
    setDescribedBy(prev => (prev.includes(newId) ? prev : [...prev, newId]));
    return () => setDescribedBy(prev => prev.filter(x => x !== newId));
  }, []);
  const value = useMemo(
    () => ({ id: fieldId, name, describedBy, invalid: !!invalid, disabled: !!disabled, required: !!required, registerDescribedBy }),
    [fieldId, name, describedBy, invalid, disabled, required, registerDescribedBy]
  );
  return (
    <FormFieldProvider value={value}>
      <Stack gap="1.5" {...rest}>{children}</Stack>
    </FormFieldProvider>
  );
}
```

### `FormLabel`

```tsx
export function FormLabel({ children, ...rest }: LabelProps) {
  const { id, required } = useFormField();
  return <Label htmlFor={id} required={required} {...rest}>{children}</Label>;
}
```

### `FormControl`

The critical piece: clones its single child (which is an input/select/etc.) and injects `id`, `aria-describedby`, `aria-invalid`, `disabled`, `required`, `name`.

```tsx
export function FormControl({ children }: { children: React.ReactElement }) {
  const { id, name, describedBy, invalid, disabled, required } = useFormField();
  return cloneElement(children, {
    id,
    name: children.props.name ?? name,
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
    disabled: children.props.disabled ?? disabled,
    required: children.props.required ?? required,
    invalid: children.props.invalid ?? invalid,
  });
}
```

**Design choice:** `FormControl` clones rather than wraps. The underlying input stays the direct descendant of `FormField` visually, which matters for CSS targeting (`:has()` selectors, sibling combinators for floating labels, etc.).

### `FormDescription`

```tsx
export function FormDescription({ children, ...rest }: TextProps) {
  const { id, registerDescribedBy } = useFormField();
  const descId = `${id}-description`;
  useIsomorphicLayoutEffect(() => registerDescribedBy(descId), [descId, registerDescribedBy]);
  return <HelperText id={descId} {...rest}>{children}</HelperText>;
}
```

### `FormMessage`

Renders only when children exist. Auto-wires `id` for `aria-describedby` and uses `role="alert"` for new errors.

```tsx
export function FormMessage({ children, ...rest }: TextProps) {
  const { id, registerDescribedBy, invalid } = useFormField();
  const msgId = `${id}-message`;
  useIsomorphicLayoutEffect(() => {
    if (children) return registerDescribedBy(msgId);
  }, [children, msgId, registerDescribedBy]);
  if (!children) return null;
  return <ErrorText id={msgId} role={invalid ? 'alert' : undefined} {...rest}>{children}</ErrorText>;
}
```

---

## `Form` root

```tsx
<Form onSubmit={handleSubmit} noValidate>
  <Stack gap="4">
    <FormField name="email" invalid={…}>…</FormField>
    <FormField name="password" invalid={…}>…</FormField>
    <Button type="submit">Sign in</Button>
  </Stack>
</Form>
```

### Props
- Extends all `<form>` HTML attributes.
- `onSubmit`: standard handler.
- `noValidate`: default `true` — we handle validation messaging ourselves; native browser validation UI conflicts with ours.

### Composition
`<Box as="form">`. Provides no context by default (form libraries handle that). But may expose a future `FormProvider` slot for framework-agnostic field-array utilities — keep this door open.

---

## `react-hook-form` integration recipe

Ship a small helper package path `@lumen/react/rhf` that exports adapters without hard-depending on RHF (RHF is a peer, optional).

### `packages/react/src/form/rhf/index.ts`

```ts
// Type-only import so consumers without RHF don't pay any cost.
import type { Control, FieldValues, FieldPath, RegisterOptions } from 'react-hook-form';

// Example adapter — wraps useController + FormControl + FormMessage
export function RHFField<TValues extends FieldValues, TName extends FieldPath<TValues>>(
  props: {
    control: Control<TValues>;
    name: TName;
    label: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactElement;
    rules?: RegisterOptions;
  }
) {
  // Lazily require RHF so this file doesn't throw when RHF isn't installed.
  // The lazy access is guarded by consumers actually calling RHFField.
  const { useController } = require('react-hook-form');
  const { field, fieldState } = useController({ control: props.control, name: props.name, rules: props.rules });
  return (
    <FormField name={props.name} invalid={!!fieldState.error}>
      <FormLabel>{props.label}</FormLabel>
      <FormControl>
        {cloneElement(props.children, { ...field, onChange: field.onChange })}
      </FormControl>
      {props.description && <FormDescription>{props.description}</FormDescription>}
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormField>
  );
}
```

Package the path as a separate entry:

```json
"exports": {
  "./rhf": { "types": "./dist/form/rhf/index.d.ts", "import": "./dist/form/rhf/index.js" }
}
```

`react-hook-form` is listed in `peerDependenciesMeta` as optional:

```json
"peerDependenciesMeta": {
  "react-hook-form": { "optional": true }
}
```

### Integration example (goes in docs)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, RHFField, Input, Button } from '@lumen/react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, '8+ characters'),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { control, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(values => …);
  return (
    <Form onSubmit={onSubmit}>
      <Stack gap="4">
        <RHFField control={control} name="email" label="Email">
          <Input type="email" />
        </RHFField>
        <RHFField control={control} name="password" label="Password">
          <Input type="password" />
        </RHFField>
        <Button type="submit">Sign in</Button>
      </Stack>
    </Form>
  );
}
```

---

## Uncontrolled / FormData recipe

For simple forms that don't need a library:

```tsx
<Form onSubmit={(e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  submit(data);
}}>
  <FormField name="email" required>
    <FormLabel>Email</FormLabel>
    <FormControl><Input type="email" /></FormControl>
  </FormField>
  <Button type="submit">Send</Button>
</Form>
```

Every Lumen form control accepts `name` and forwards it to the underlying element, so FormData works out of the box.

---

## Testing requirements

- Unit tests for `FormField` context:
  - Labels get correct `htmlFor`.
  - Descriptions/messages register their IDs.
  - `aria-describedby` concatenates IDs in mount order.
  - `aria-invalid` only appears when `invalid` is true.
  - Controls inherit `disabled` / `required` / `name` from FormField unless explicitly overridden on the child.
- Integration test: drive a full `<Form>` with `FormField` + `Input` + `FormMessage` via userEvent, submit, assert onSubmit payload.
- RHF adapter test: mount `<RHFField>` with a stub control, simulate value change, assert `field.onChange` was called.

---

## Exit criteria

- [ ] `Form`, `FormField`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` exist and are exported.
- [ ] `FormField` context auto-wires IDs; `aria-describedby` composition correct by construction.
- [ ] `@lumen/react/rhf` entry point exists; `react-hook-form` listed as optional peer.
- [ ] Three docs pages in Storybook MDX showing recipes (plain / RHF / RHF + Zod).
- [ ] Unit + integration tests pass with ≥ 95% coverage on the form directory.
- [ ] Changesets: `@lumen/react` minor "Form composition primitives".

## Decisions to log

- Clone-element strategy in `FormControl`. More flexible than a wrapper div; preserves DOM structure for CSS pseudo-class targeting.
- Optional peer dependency on `react-hook-form`. Consumers not using RHF pay zero bytes.
- No built-in validation resolver. Validation belongs with the form library.
