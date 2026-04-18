# Phase 07 — Forms (basic)

> **Goal:** Ship the foundational form controls. Every one supports controlled + uncontrolled mode via `useControllableState`, full keyboard access, screen-reader labelling, and the `Form`/`FormField` integration pattern that Phase 13 finalises.

**Depends on:** Phases 01–06.
**Blocks:** Phase 08 (advanced forms), Phase 13 (composition).

---

## Components

1. **`Button`**, **`IconButton`**, **`ButtonGroup`**
2. **`Input`** (text, email, password, number, tel, url, search)
3. **`Textarea`**
4. **`NumberInput`** (spin buttons, step, min/max) — uses React Aria's NumberField for correctness
5. **`Checkbox`**, **`CheckboxGroup`**
6. **`Radio`**, **`RadioGroup`**
7. **`Switch`**
8. **`Label`**, **`HelperText`**, **`ErrorText`**, **`Fieldset`**

The `Form` wrapper and `FormField` compound are **Phase 13**; here, each control works standalone with the manual labelling pattern.

---

## Common form-control contract

Every control implements this interface:

```ts
interface FormControlBase<T> {
  // Controlled/uncontrolled
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;

  // States
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;                   // paints the error state (red ring, etc.)
  name?: string;                       // for native form integration
  id?: string;
  autoFocus?: boolean;

  // Size/variant
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'ghost';
}
```

Boolean inputs (Checkbox, Switch) use `checked` / `defaultChecked` / `onCheckedChange` instead of `value`/`onChange` — this matches Radix and React Aria, and makes the boolean semantics explicit.

---

## `Button`

The flagship component. Get this right and the rest follow.

### Variants

- **`variant`**: `solid` | `soft` | `outline` | `ghost` | `link`
- **`colorScheme`**: `accent` | `neutral` | `success` | `danger` | `warning`
- **`size`**: `xs` | `sm` | `md` | `lg` | `xl`
- **`shape`**: `default` | `square` | `pill`
- **`loading`**: `boolean` — disables, shows spinner, preserves width
- **`leftIcon`** / **`rightIcon`**: `ReactNode`
- **`fullWidth`**: `boolean`
- **`asChild`**: `boolean` — classic composition for rendering as an anchor

### Composition

```tsx
// Button.tsx (abbreviated)
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'cva';
import { Inline } from '../../primitives/layout/Inline';
import { Spinner } from '../../feedback/Spinner';           // from Phase 12 — for now inline a tiny SVG
import { VisuallyHidden } from '../../primitives/VisuallyHidden';

const button = cva({
  base: 'cynosure-button',
  variants: {
    variant:     { solid: 'cynosure-button--solid',   soft: 'cynosure-button--soft',   outline: 'cynosure-button--outline', ghost: 'cynosure-button--ghost', link: 'cynosure-button--link' },
    colorScheme: { accent: 'cynosure-button--accent', neutral: 'cynosure-button--neutral', success: 'cynosure-button--success', danger: 'cynosure-button--danger', warning: 'cynosure-button--warning' },
    size:        { xs: 'cynosure-button--xs', sm: 'cynosure-button--sm', md: 'cynosure-button--md', lg: 'cynosure-button--lg', xl: 'cynosure-button--xl' },
    shape:       { default: 'cynosure-button--shape-default', square: 'cynosure-button--shape-square', pill: 'cynosure-button--shape-pill' },
    fullWidth:   { true: 'cynosure-button--full-width' },
  },
  defaultVariants: { variant: 'solid', colorScheme: 'accent', size: 'md', shape: 'default' },
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { asChild, loading, leftIcon, rightIcon, children, disabled, className, ...rest } = props;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (rest.type ?? 'button')}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      className={cn(button(variantProps), className)}
      {...rest}
    >
      <Inline as="span" gap="2" align="center" justify="center">
        {loading && <Spinner size="sm" />}
        {!loading && leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </Inline>
    </Comp>
  );
});
```

Important details:
- **Default `type="button"`** unless `asChild` (so consumers don't accidentally submit forms).
- **`disabled || loading`** — loading state must disable.
- **`data-loading`** attribute for CSS styling of the non-spinner content (dim it or preserve width).
- **Focus visible** — custom `:focus-visible` ring using `var(--cynosure-color-border-focus)` and `var(--cynosure-shadow-component-focus)`.

### Accessibility
- Native `<button>` gives keyboard + enter/space + focus for free. Don't fight it.
- `loading` button announces via `aria-busy="true"`.
- Icon-only buttons (`IconButton`) **must** have `aria-label` — enforce with a dev warning if missing.

---

## `IconButton`

Exactly `Button` but with a constrained API: `icon` prop, required `label` prop (becomes `aria-label`).

```tsx
<IconButton icon={<MenuIcon />} label="Open menu" />
```

Implements as a thin wrapper around `Button asChild` — or simpler, re-uses the same CVA recipe with forced `shape: 'square'`.

---

## `ButtonGroup`

```tsx
<ButtonGroup variant="outline" size="sm" attached>
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ButtonGroup>
```

Provides context for `variant`, `size`, `colorScheme` to children via a context (`createContext('ButtonGroup')`). `attached` strips outer border-radii on middle items.

---

## `Input`

Single-line text input. Supports left/right slots (icons, inline buttons).

### Props

```ts
interface InputProps extends FormControlBase<string>, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  leftAddon?: React.ReactNode;     // e.g. "https://"
  rightAddon?: React.ReactNode;    // e.g. ".com"
  leftElement?: React.ReactNode;   // inside input; e.g. search icon
  rightElement?: React.ReactNode;  // e.g. clear button
  clearable?: boolean;             // auto-adds an X to clear
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';
}
```

### Composition

```tsx
<Inline as="div" className={wrapper({ size, variant, invalid, disabled })}>
  {leftAddon && <Box className={addon({ side: 'left' })}>{leftAddon}</Box>}
  {leftElement && <Box className={element({ side: 'left' })}>{leftElement}</Box>}
  <input ref={ref} className={field} … />   {/* the ONE raw element allowed in this phase */}
  {rightElement && <Box className={element({ side: 'right' })}>{rightElement}</Box>}
  {rightAddon && <Box className={addon({ side: 'right' })}>{rightAddon}</Box>}
</Inline>
```

> **Note — exception to the "no raw HTML" rule:** form controls (`<input>`, `<textarea>`, `<select>`) are the ONLY non-primitive components permitted to render their own raw element. This is because form elements have unique browser behaviours (value binding, form submission, a11y semantics) that cannot be faithfully composed. Document this as an explicit exception in the architecture doc.

### Password variant
When `type="password"`, automatically provide a show/hide toggle as the right element (unless consumer sets `rightElement` explicitly). Toggle swaps `type` between `password` and `text`.

### Clearable
When `clearable` and value is non-empty, inject a small `IconButton icon={<XIcon />}` in `rightElement` that sets value to `''` and focuses the input.

---

## `Textarea`

Same shape as `Input` but:
- `rows?: number`
- `autoResize?: boolean` — grows with content (uses a hidden mirror div, or CSS `field-sizing: content` where supported).
- `maxRows?: number`

---

## `NumberInput`

**Use React Aria's `useNumberField`** for correctness around locale, decimal separators, increment/decrement, keyboard handling. React Aria is a dependency here and it's worth it — rolling your own is a tar pit.

```tsx
<NumberInput min={0} max={100} step={5} defaultValue={10} />
```

Renders: Input + two stacked IconButtons (up/down arrows). Keyboard: arrow up/down, page up/down, home/end.

Install:
```bash
pnpm --filter @arshad-shah/cynosure-react add react-aria-components
```

---

## `Checkbox`

```tsx
<Checkbox defaultChecked>I agree to terms</Checkbox>
<Checkbox checked={state} onCheckedChange={setState} indeterminate />
```

### Implementation

Use `@radix-ui/react-checkbox` as the accessibility base. Style with vanilla-extract. Compose Radix's primitives inside Cynosure's layout primitives so focus rings and spacing are consistent.

```bash
pnpm --filter @arshad-shah/cynosure-react add @radix-ui/react-checkbox
```

### Props

```ts
interface CheckboxProps extends FormControlBase<never> {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  indeterminate?: boolean;
  colorScheme?: 'accent' | 'success' | 'danger' | 'neutral';
  children?: React.ReactNode;           // label content
}
```

If `children` is provided, render a label wrapping the checkbox and text (via `Inline`).

---

## `CheckboxGroup`

Context-provided group with shared name and callbacks.

```tsx
<CheckboxGroup value={selected} onChange={setSelected} name="fruits">
  <Checkbox value="apple">Apple</Checkbox>
  <Checkbox value="banana">Banana</Checkbox>
</CheckboxGroup>
```

Children Checkboxes read the group context — if inside a group, they ignore their own `checked`/`onCheckedChange` in favour of the group's value array semantics.

---

## `Radio` / `RadioGroup`

Use `@radix-ui/react-radio-group`. The `RadioGroup` owns selection; individual `Radio` receives value, checked comes from group.

```tsx
<RadioGroup value={plan} onValueChange={setPlan}>
  <Radio value="hobby">Hobby</Radio>
  <Radio value="pro">Pro</Radio>
</RadioGroup>
```

Keyboard: arrow keys move selection within group; tab enters/exits group.

---

## `Switch`

Visually distinct from Checkbox. Use `@radix-ui/react-switch`.

```tsx
<Switch checked={on} onCheckedChange={setOn}>Enable notifications</Switch>
```

Props match Checkbox but semantically implies "on/off setting that takes immediate effect" — use over Checkbox for immediate-effect toggles.

---

## `Label`, `HelperText`, `ErrorText`, `Fieldset`

Tiny presentational components for form structure.

```tsx
<Stack gap="1">
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" type="email" invalid={!!error} aria-describedby="email-help email-error" />
  <HelperText id="email-help">We'll never share your email.</HelperText>
  {error && <ErrorText id="email-error">{error}</ErrorText>}
</Stack>
```

- `Label` — renders `<Box as="label">` with styling; `required` appends `*` with `aria-hidden`.
- `HelperText` — subtle gray small text.
- `ErrorText` — danger-coloured small text with `role="alert"` when first appearing.
- `Fieldset` — renders `<Box as="fieldset">` with optional `<Box as="legend">` via a `legend` prop.

---

## Visual states every form control must implement

Define once as a shared recipe and apply everywhere:

| State | Visual |
|-------|--------|
| default | border `border.default`, bg `surface` |
| hover | border `border.strong` |
| focus-visible | 2px ring `accent.ring` + optional shadow |
| disabled | reduced opacity, border `border.disabled`, `cursor: not-allowed` |
| readOnly | bg `subtle`, cursor `text`/`default` |
| invalid | border `feedback.danger.border`, focus ring danger |
| filled variant | bg `muted`, border `transparent` until hover/focus |

---

## Testing requirements

Per component, at minimum:

- Stories: every size × every variant × every colourScheme × all states (default/hover/focus/disabled/readOnly/invalid).
- Interaction tests:
  - **Button**: click fires; `disabled` prevents click; `loading` prevents click and shows spinner.
  - **Input**: typing updates value; `clearable` clears and refocuses.
  - **Checkbox**: click toggles; keyboard space toggles; indeterminate state renders correctly.
  - **RadioGroup**: arrow keys move selection; tab skips non-selected.
  - **Switch**: click toggles; keyboard space toggles.
- A11y stories pass.
- Controlled + uncontrolled both work — one story each.

---

## Exit criteria

- [ ] All components from the inventory exist and are exported.
- [ ] `FormControlBase` is a shared type used by every control.
- [ ] Visual states (hover/focus/disabled/invalid) are consistent across all controls.
- [ ] Keyboard interaction is exhaustively covered by play functions.
- [ ] Per-component tsup entries and `exports` map entries added.
- [ ] `@radix-ui/react-*` and `react-aria-components` added only where used, pinned to ^ caret with a pnpm override to a specific minor for reproducibility.
- [ ] Bundle: `import { Button } from '@arshad-shah/cynosure-react/button'` ≤ 5 KB gzipped (component + Slot + CVA + CSS).
- [ ] Changesets: `@arshad-shah/cynosure-react` minor "Basic form controls".

## Decisions to log

- Using `@radix-ui/*` for Checkbox/Radio/Switch vs React Aria. **Decision: Radix for simple single-role primitives (Checkbox/Switch/Radio), React Aria for complex behaviour (NumberField, later Combobox/DatePicker).** Radix is a friendlier API; React Aria is more correct on esoteric interactions.
- Raw `<input>`/`<textarea>` inside components. **Decision: permitted as the single form-element exception** — document it explicitly in architecture doc.
