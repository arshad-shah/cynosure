# Input Multi-Well Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote `Input` to the DatePicker-family multi-well "punched-card" language with Textarea-style affordance treatment, replacing `leftAddon`/`rightAddon`/`leftElement`/`rightElement` with a unified `leadingSlot` / `trailingSlot` API, while preserving today's single-well look as `variant="flat"`.

**Architecture:** The punched-well CSS base currently lives inside `DatePicker.css.ts`. Lift it into `forms/shared/control.css.ts` as `fieldWellBase` so both components share one source of truth. Give `Input` its own `Input.css.ts` with a multi-well row wrapper (`[leading wells] gap [field well] gap [trailing wells]`), plus slot-kind classes (`inertWell`, `fieldWell`, `actionWell`) that pick state from `data-*` on the root — the same pattern DatePicker already uses. `Input.tsx` is rewritten around `leadingSlot` / `trailingSlot` with auto-classification (button/`role="button"`/`onClick` → action; otherwise inert) and a `variant="flat"` branch that falls back to today's single-well layout with slots rendered inline.

**Tech Stack:** React 18, TypeScript, vanilla-extract CSS, Vitest + Testing Library, Storybook.

**Spec:** `docs/superpowers/specs/2026-04-21-input-multi-well-redesign-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/react/src/forms/shared/control.css.ts` | Modify | Add `fieldWellBase`, `multiWellRow`, slot-kind wrappers (`inertWell`, `actionWell`), and per-size/variant tokens. |
| `packages/react/src/forms/DatePicker/DatePicker.css.ts` | Modify | Replace local `wellBase` with the shared `fieldWellBase`. DatePicker visuals stay identical. |
| `packages/react/src/forms/Input/Input.css.ts` | **Create** | Input-specific root (`multiWellRoot`, `flatRoot`), field-well class that wraps the `<input>`, slot container geometry. |
| `packages/react/src/forms/Input/Input.tsx` | Modify | New slot-based API with auto-classification + `variant="flat"` branch. |
| `packages/react/src/forms/Input/Input.stories.tsx` | Modify | Migrate addons/elements to slot API, add stories for slot mixes + `flat` + invalid clear tint. |
| `packages/react/src/forms/__tests__/Input.test.tsx` | Modify | Replace addon/element assertions with slot-based ones, add auto-classification tests, add `flat` fallback test. |

The existing `shared/affordance.css.ts` (`inputAffordance`) stays — the internal clear/password IconButtons still use it to strip the default button chrome before they're rendered inside an `actionWell`. The `actionWell` provides the pocket; `inputAffordance` keeps the button transparent inside it.

---

## Task 1 — Lift `wellBase` into shared control CSS

**Files:**
- Modify: `packages/react/src/forms/shared/control.css.ts`
- Modify: `packages/react/src/forms/DatePicker/DatePicker.css.ts:32-64`

This is a pure refactor — DatePicker looks identical after. Every subsequent task depends on `fieldWellBase` existing in shared.

- [ ] **Step 1: Add `fieldWellBase` to shared control CSS**

Append to `packages/react/src/forms/shared/control.css.ts`:

```ts
/**
 * The "punched well" tile used as the tactile unit across multi-well form
 * controls (DatePicker, Input, and any future ones). Subtly recessed against
 * the host surface with a hairline inner highlight and the token border.
 *
 * This is a bare tile — consumers are expected to pair it with a data-driven
 * parent (`[data-variant]`, `[data-invalid]`, `[data-readonly]`,
 * `[data-disabled]`) so all wells in a row react in lockstep. Those selectors
 * live in the parent component's CSS, not here, because each component's
 * parent node is different.
 */
export const fieldWellBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '2.5rem',
  background: vars.color.background.subtle,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: 'inset 0 1px 0 rgba(24, 24, 27, 0.04)',
  transitionProperty: 'background-color, border-color, box-shadow, color',
  transitionDuration: vars.duration.fast,
  color: vars.color.foreground.default,
});
```

- [ ] **Step 2: Update `DatePicker.css.ts` to use the shared base**

In `packages/react/src/forms/DatePicker/DatePicker.css.ts`, replace the local `wellBase` definition (lines 32-64) with a composed version that pulls from shared and keeps only the DatePicker-scoped state selectors:

```ts
import { fieldWellBase } from '../shared/control.css.js';

// (keep other imports)

/**
 * DatePicker-local composition: the shared well tile + DatePicker's
 * parent-scoped state selectors. The tile itself is shared with Input.
 */
const wellBase = style([
  fieldWellBase,
  {
    selectors: {
      // variant: filled — deeper recess, border recedes
      [`${pickerRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      // variant: ghost — minimal, no inset shadow, subtle borderless rest state
      [`${pickerRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      // invalid — danger border on every well
      [`${pickerRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
      // readonly — slightly deeper well surface
      [`${pickerRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);
```

Note: `pickerRoot` is defined earlier in the same file. `style([fieldWellBase, { ... }])` composes them — vanilla-extract's array form.

- [ ] **Step 3: Run the DatePicker test suite to verify no regression**

Run: `pnpm --filter @cynosure/react test -- DatePicker`
Expected: All DatePicker tests pass; no visual regression (selectors still target `pickerRoot[data-*]`).

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/forms/shared/control.css.ts \
        packages/react/src/forms/DatePicker/DatePicker.css.ts
git commit -m "refactor(forms): lift wellBase into shared fieldWellBase"
```

---

## Task 2 — Add Input-local CSS module

**Files:**
- Create: `packages/react/src/forms/Input/Input.css.ts`

The file owns only Input's structural layout (root row, per-variant parent-scoped state) and slot geometry. The tile styling comes from `fieldWellBase`.

- [ ] **Step 1: Create `Input.css.ts`**

Write the full file:

```ts
import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';
import { fieldWellBase } from '../shared/control.css.js';

/**
 * Multi-well root — a flex row of wells with a gap between each tile.
 * State is expressed on this root via `data-*` so every descendant well
 * reacts in lockstep (matches DatePicker's pattern).
 */
export const multiWellRoot = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  gap: vars.space[2],
  color: vars.color.foreground.default,
  selectors: {
    '&[data-disabled="true"]': { opacity: 0.6, cursor: 'not-allowed' },
  },
});

/** Container for a group of leading or trailing slots — zero-sized if empty. */
export const slotGroup = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  gap: vars.space[2],
  flex: '0 0 auto',
});

/**
 * Non-interactive slot well — icons, prefix text like "https://". Inherits
 * tile chrome from fieldWellBase; adds Input-scoped variant / state selectors.
 */
export const inertWell = style([
  fieldWellBase,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    paddingInline: vars.space[2],
    minWidth: '2.5rem',
    color: vars.color.foreground.subtle,
    cursor: 'default',
    pointerEvents: 'none',
    selectors: {
      [`${multiWellRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
      [`${multiWellRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);

/**
 * Interactive slot well — clear button, password toggle, custom action
 * buttons. Accent-tinted hover/pressed, picks up danger tint on invalid.
 */
export const actionWell = style([
  fieldWellBase,
  {
    flex: '0 0 auto',
    justifyContent: 'center',
    minWidth: '2.5rem',
    padding: 0,
    cursor: 'pointer',
    color: vars.color.foreground.muted,
    selectors: {
      '&:hover': {
        background: vars.color.accent.soft,
        borderColor: vars.color.accent.solid,
        color: vars.color.accent.solid,
      },
      '&:focus-within': {
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
      [`${multiWellRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
        background: vars.color.feedback.danger.soft,
        color: vars.color.feedback.danger.foreground,
      },
      [`${multiWellRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);

/**
 * The field well — the one that wraps the `<input>`. Flexes to fill, and is
 * the only well that lifts to `background.surface` on focus-within.
 */
export const fieldWell = style([
  fieldWellBase,
  {
    flex: 1,
    minWidth: 0,
    paddingInline: vars.space[3],
    cursor: 'text',
    selectors: {
      [`${multiWellRoot}[data-hover="true"]:not([data-disabled="true"]):not([data-readonly="true"]) &`]: {
        borderColor: vars.color.border.strong,
      },
      '&:focus-within': {
        background: vars.color.background.surface,
        borderColor: vars.color.border.focus,
        boxShadow: `0 0 0 2px ${vars.color.accent.ring}`,
      },
      [`${multiWellRoot}[data-variant="filled"] &`]: {
        background: vars.color.background.muted,
        borderColor: 'transparent',
      },
      [`${multiWellRoot}[data-variant="ghost"] &`]: {
        background: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
      },
      [`${multiWellRoot}[data-invalid="true"] &`]: {
        borderColor: vars.color.feedback.danger.border,
      },
      [`${multiWellRoot}[data-invalid="true"] &:focus-within`]: {
        boxShadow: `0 0 0 2px ${vars.color.feedback.danger.border}`,
      },
      [`${multiWellRoot}[data-readonly="true"] &`]: {
        background: vars.color.background.muted,
      },
    },
  },
]);

/** Per-size minHeight/font/radius applied to every well in the row. */
export const wellSize = styleVariants({
  sm: {
    minHeight: '2rem',
    borderRadius: vars.radius.sm,
    fontSize: 'var(--cynosure-font-body-sm-size)',
    lineHeight: 'var(--cynosure-font-body-sm-line-height)',
  },
  md: {
    minHeight: '2.5rem',
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-md-size)',
    lineHeight: 'var(--cynosure-font-body-md-line-height)',
  },
  lg: {
    minHeight: '3rem',
    borderRadius: vars.radius.md,
    fontSize: 'var(--cynosure-font-body-lg-size)',
    lineHeight: 'var(--cynosure-font-body-lg-line-height)',
  },
});

/** The raw `<input>` inside the fieldWell — no chrome, just text layout. */
export const inputElement = style({
  flex: 1,
  minWidth: 0,
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  paddingBlock: vars.space[1],
  selectors: {
    '&::placeholder': { color: vars.color.foreground.subtle },
    '&:disabled': { cursor: 'not-allowed' },
  },
});
```

- [ ] **Step 2: Type-check to verify the module compiles**

Run: `pnpm --filter @cynosure/react typecheck`
Expected: 0 errors (file is not yet imported anywhere, so this just validates the CSS module syntax).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/forms/Input/Input.css.ts
git commit -m "feat(input): add multi-well css module"
```

---

## Task 3 — Rewrite `Input.tsx` (tests first)

**Files:**
- Modify: `packages/react/src/forms/__tests__/Input.test.tsx`
- Modify: `packages/react/src/forms/Input/Input.tsx`

TDD: write the new tests for the slot API and auto-classification, watch them fail, implement.

### 3a. Add the new tests

- [ ] **Step 1: Replace `Input.test.tsx` with the new test set**

Replace the file with:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../Input/index.js';

describe('Input', () => {
  it('renders an input with the provided type', () => {
    render(<Input type="email" placeholder="you@example.com" />);
    const input = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('email');
  });

  it('typing updates the (uncontrolled) value', async () => {
    const user = userEvent.setup();
    render(<Input defaultValue="" placeholder="x" />);
    const input = screen.getByPlaceholderText('x') as HTMLInputElement;
    await user.type(input, 'abc');
    expect(input.value).toBe('abc');
  });

  it('calls onChange (controlled)', () => {
    const Controlled = (): React.ReactElement => {
      const [v, setV] = useState('');
      return <Input value={v} onChange={setV} placeholder="c" />;
    };
    render(<Controlled />);
    const input = screen.getByPlaceholderText('c') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hi' } });
    expect(input.value).toBe('hi');
  });

  it('clearable shows clear button only when value is non-empty', () => {
    const { rerender } = render(<Input value="" onChange={() => {}} clearable />);
    expect(screen.queryByLabelText('Clear input')).toBeNull();
    rerender(<Input value="hi" onChange={() => {}} clearable />);
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });

  it('clearable clears value and focuses input', () => {
    const handle = vi.fn();
    render(<Input value="abc" onChange={handle} clearable placeholder="c" />);
    const btn = screen.getByLabelText('Clear input');
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledWith('');
  });

  it('password type shows show/hide toggle that flips the input type', async () => {
    const user = userEvent.setup();
    render(<Input type="password" defaultValue="hunter2" placeholder="p" />);
    const input = screen.getByPlaceholderText('p') as HTMLInputElement;
    expect(input.type).toBe('password');
    const toggle = screen.getByLabelText('Show password');
    await user.click(toggle);
    expect(input.type).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('paints invalid state via data attribute on the wrapper', () => {
    const { container } = render(<Input invalid defaultValue="x" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-invalid')).toBe('true');
    const input = wrapper.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  // --- New slot API ---

  it('renders leadingSlot content inside a well with data-slot-kind', () => {
    render(<Input leadingSlot={<span data-testid="lead">https://</span>} placeholder="x" />);
    const lead = screen.getByTestId('lead');
    const well = lead.parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('inert');
  });

  it('renders trailingSlot content inside a well with data-slot-kind', () => {
    render(<Input trailingSlot={<span data-testid="trail">.com</span>} placeholder="x" />);
    const trail = screen.getByTestId('trail');
    const well = trail.parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('inert');
  });

  it('accepts an array of slot nodes and renders one well per node', () => {
    render(
      <Input
        leadingSlot={[<span key="a" data-testid="a">A</span>, <span key="b" data-testid="b">B</span>]}
        placeholder="x"
      />,
    );
    const wellA = screen.getByTestId('a').parentElement as HTMLElement;
    const wellB = screen.getByTestId('b').parentElement as HTMLElement;
    expect(wellA).not.toBe(wellB);
    expect(wellA.getAttribute('data-slot-kind')).toBe('inert');
    expect(wellB.getAttribute('data-slot-kind')).toBe('inert');
  });

  it('auto-classifies a <button> child as an action well', () => {
    render(
      <Input trailingSlot={<button type="button" data-testid="b">Go</button>} placeholder="x" />,
    );
    const well = screen.getByTestId('b').parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });

  it('auto-classifies a child with role="button" as an action well', () => {
    render(
      <Input
        trailingSlot={<span role="button" data-testid="b" onClick={() => {}}>x</span>}
        placeholder="x"
      />,
    );
    const well = screen.getByTestId('b').parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });

  it('auto-classifies a child with onClick as an action well', () => {
    render(
      <Input trailingSlot={<span data-testid="b" onClick={() => {}}>x</span>} placeholder="x" />,
    );
    const well = screen.getByTestId('b').parentElement as HTMLElement;
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });

  it('variant="flat" collapses the wells and renders slots inline', () => {
    const { container } = render(
      <Input
        variant="flat"
        leadingSlot={<span data-testid="lead">@</span>}
        placeholder="x"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('data-variant')).toBe('flat');
    // In flat mode, slot content is NOT wrapped in a data-slot-kind well.
    const lead = screen.getByTestId('lead');
    expect(lead.parentElement?.getAttribute('data-slot-kind')).toBeNull();
  });

  it('clearable in multi-well renders clear as an action well', () => {
    render(<Input value="abc" onChange={() => {}} clearable />);
    const btn = screen.getByLabelText('Clear input');
    // Button is inside an actionWell (data-slot-kind="action").
    const well = btn.closest('[data-slot-kind]') as HTMLElement;
    expect(well).not.toBeNull();
    expect(well.getAttribute('data-slot-kind')).toBe('action');
  });
});
```

- [ ] **Step 2: Run the tests and verify the new ones fail**

Run: `pnpm --filter @cynosure/react test -- Input`
Expected: The existing tests still pass; the 8 new tests (those referencing `leadingSlot`, `trailingSlot`, `data-slot-kind`, `variant="flat"`) fail because those props don't exist yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add packages/react/src/forms/__tests__/Input.test.tsx
git commit -m "test(input): add slot api + auto-classification tests"
```

### 3b. Rewrite the component

- [ ] **Step 4: Replace `Input.tsx` with the new implementation**

Full file contents for `packages/react/src/forms/Input/Input.tsx`:

```tsx
import {
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  isValidElement,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import { LucideEye, LucideEyeOff, X } from 'lucide-react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { IconButton } from '../IconButton/IconButton.js';
import { inputAffordance } from '../shared/affordance.css.js';
import {
  controlField,
  controlSize,
  controlWrapperBase,
  controlWrapperVariant,
  controlElement,
} from '../shared/control.css.js';
import type { FormControlBase, FormControlSize } from '../shared/types.js';
import {
  actionWell,
  fieldWell,
  inertWell,
  inputElement,
  multiWellRoot,
  slotGroup,
  wellSize,
} from './Input.css.js';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

/** Local variant union — adds `'flat'` to the shared FormControlVariant. */
export type InputVariant = 'outline' | 'filled' | 'ghost' | 'flat';

export interface InputOwnProps extends Omit<FormControlBase<string>, 'variant'> {
  type?: InputType;
  variant?: InputVariant;
  /** Single node or array. Strings/icons render as inert wells; buttons/onClick render as action wells. */
  leadingSlot?: ReactNode | ReactNode[];
  trailingSlot?: ReactNode | ReactNode[];
  /** When true and value is non-empty, appends a clear × as a trailing action well. */
  clearable?: boolean;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

export type InputProps = InputOwnProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type'
  >;

/** Normalize a slot prop into an array, dropping nullish entries. */
function toArray(slot: ReactNode | ReactNode[] | undefined): ReactNode[] {
  if (slot == null) return [];
  return (Array.isArray(slot) ? slot : [slot]).filter((n) => n != null && n !== false);
}

/**
 * Classify a slot child. Action wells get accent-tinted hover and keyboard
 * focus-within ring; inert wells are pointer-events: none decoration.
 *
 *  - <button>                → action
 *  - role="button"           → action
 *  - has onClick prop        → action
 *  - anything else           → inert
 */
function isActionNode(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const el = node as ReactElement<Record<string, unknown>>;
  if (typeof el.type === 'string' && el.type === 'button') return true;
  const props = el.props ?? {};
  if (props['role'] === 'button') return true;
  if (typeof props['onClick'] === 'function') return true;
  return false;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    type: typeProp = 'text',
    disabled,
    readOnly,
    required,
    invalid,
    size = 'md',
    variant = 'outline',
    leadingSlot,
    trailingSlot,
    clearable,
    className,
    style,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const fallbackId = useId();
  const id = idProp ?? fallbackId;

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const type = typeProp === 'password' && passwordVisible ? 'text' : (typeProp as InputType);

  const inputNodeRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRef(ref, inputNodeRef);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    [setValue],
  );

  const handleClear = useCallback(() => {
    setValue('');
    inputNodeRef.current?.focus();
  }, [setValue]);

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  // Auto-appended trailing affordances.
  const showPasswordToggle = typeProp === 'password';
  const showClearButton = clearable && value !== '' && !disabled && !readOnly;

  const autoTrailing: ReactNode[] = [];
  if (showClearButton) {
    autoTrailing.push(
      <IconButton
        key="__clear"
        variant="bare"
        label="Clear input"
        icon={<X />}
        className={inputAffordance}
        onClick={handleClear}
      />,
    );
  }
  if (showPasswordToggle) {
    autoTrailing.push(
      <IconButton
        key="__password"
        variant="bare"
        label={passwordVisible ? 'Hide password' : 'Show password'}
        icon={passwordVisible ? <LucideEyeOff /> : <LucideEye />}
        className={inputAffordance}
        aria-pressed={passwordVisible}
        onClick={() => setPasswordVisible((v) => !v)}
      />,
    );
  }

  const leading = toArray(leadingSlot);
  const trailing = [...toArray(trailingSlot), ...autoTrailing];

  // ---- `variant="flat"` fallback: today's single-well layout, slots inline. ----

  if (variant === 'flat') {
    return (
      <div
        className={cn(controlWrapperBase, controlWrapperVariant.outline, controlSize[size], className)}
        data-variant="flat"
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={invalid || undefined}
        data-focus-within={focused || undefined}
        data-hover={hover || undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={style}
      >
        {leading.map((node, i) => (
          <span key={`lead-${i}`} className={controlElement}>
            {node}
          </span>
        ))}
        <input
          id={id}
          ref={mergedRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          className={controlField}
          {...rest}
        />
        {trailing.map((node, i) => (
          <span key={`trail-${i}`} className={controlElement}>
            {node}
          </span>
        ))}
      </div>
    );
  }

  // ---- Multi-well (outline / filled / ghost): row of wells with a gap. ----

  const sizeClass = wellSize[size as FormControlSize];

  return (
    <div
      className={cn(multiWellRoot, className)}
      data-variant={variant}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={invalid || undefined}
      data-focus-within={focused || undefined}
      data-hover={hover || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {leading.length > 0 ? (
        <span className={slotGroup}>
          {leading.map((node, i) => {
            const action = isActionNode(node);
            return (
              <span
                key={`lead-${i}`}
                className={cn(action ? actionWell : inertWell, sizeClass)}
                data-slot-kind={action ? 'action' : 'inert'}
              >
                {node}
              </span>
            );
          })}
        </span>
      ) : null}

      <span className={cn(fieldWell, sizeClass)}>
        <input
          id={id}
          ref={mergedRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          className={inputElement}
          {...rest}
        />
      </span>

      {trailing.length > 0 ? (
        <span className={slotGroup}>
          {trailing.map((node, i) => {
            const action = isActionNode(node);
            return (
              <span
                key={`trail-${i}`}
                className={cn(action ? actionWell : inertWell, sizeClass)}
                data-slot-kind={action ? 'action' : 'inert'}
              >
                {node}
              </span>
            );
          })}
        </span>
      ) : null}
    </div>
  );
});
```

Notes for the implementer:

- `controlAddonLeft` / `controlAddonRight` are no longer referenced by Input — they stay exported for other components but are not imported here.
- `controlField`, `controlSize`, `controlWrapperBase`, `controlWrapperVariant`, and `controlElement` are only used inside the `variant === 'flat'` branch; keep all of them.

- [ ] **Step 5: Run all the Input tests and verify they pass**

Run: `pnpm --filter @cynosure/react test -- Input`
Expected: All 15 tests pass (7 original + 8 new).

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm --filter @cynosure/react typecheck && pnpm --filter @cynosure/react lint`
Expected: 0 errors. If unused-import warnings on `cloneElement`, `controlAddonLeft`, `controlAddonRight` — remove those imports.

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/forms/Input/Input.tsx
git commit -m "feat(input): rewrite around leadingSlot/trailingSlot multi-well api"
```

---

## Task 4 — Migrate stories

**Files:**
- Modify: `packages/react/src/forms/Input/Input.stories.tsx`

- [ ] **Step 1: Replace the stories file**

Full replacement of `packages/react/src/forms/Input/Input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { Input } from './Input.js';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'filled', 'ghost', 'flat'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'tel', 'url', 'search', 'number'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

const SearchIcon = (): React.ReactElement => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Dollar = (): React.ReactElement => <span aria-hidden>$</span>;

export const Playground: Story = {
  args: { placeholder: 'Type something…', variant: 'outline', size: 'md', type: 'text' },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input variant="outline" placeholder="Outline" />
      <Input variant="filled" placeholder="Filled" />
      <Input variant="ghost" placeholder="Ghost" />
      <Input variant="flat" placeholder="Flat (legacy single-well)" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </Stack>
  ),
};

export const Types: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input type="text" placeholder="Text" />
      <Input type="email" placeholder="you@example.com" />
      <Input type="password" defaultValue="hunter2" />
      <Input type="tel" placeholder="+353…" />
      <Input type="url" placeholder="https://…" />
      <Input type="search" placeholder="Search…" />
      <Input type="number" placeholder="42" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="3" width="320px">
      <Input placeholder="Default" />
      <Input placeholder="Read only" defaultValue="Read only content" readOnly />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Invalid" defaultValue="bad-email" invalid />
      <Input placeholder="Required" required />
    </Stack>
  ),
};

export const Slots: Story = {
  name: 'Slots — inert (icon / prefix) and action (button)',
  render: () => (
    <Stack gap="3" width="360px">
      <Input leadingSlot="https://" placeholder="example.com" />
      <Input trailingSlot=".com" placeholder="example" />
      <Input leadingSlot="https://" trailingSlot=".com" placeholder="example" />
      <Input leadingSlot={<SearchIcon />} placeholder="Search…" />
      <Input leadingSlot={<Dollar />} trailingSlot={<span>USD</span>} placeholder="0.00" />
    </Stack>
  ),
};

export const MultipleSlots: Story = {
  name: 'Slots — multiple on a side',
  render: () => (
    <Stack gap="3" width="360px">
      <Input
        leadingSlot={[<SearchIcon key="i" />, <span key="t">Search</span>]}
        placeholder="Filtered search…"
      />
    </Stack>
  ),
};

export const Clearable: Story = {
  render: () => {
    function Clear(): React.ReactElement {
      const [value, setValue] = useState('Clear me');
      return (
        <Stack gap="3" width="320px">
          <Input clearable value={value} onChange={setValue} placeholder="Clearable" />
          <Input clearable invalid value={value} onChange={setValue} placeholder="Clearable, invalid" />
          <Text size="sm" color="fg.muted">
            Value: <code>{JSON.stringify(value)}</code>
          </Text>
        </Stack>
      );
    }
    return <Clear />;
  },
};

export const Password: Story = {
  name: 'Password — show/hide toggle',
  render: () => <Input type="password" defaultValue="hunter2" placeholder="Password" />,
};

export const Flat: Story = {
  name: 'Flat variant (dense layouts)',
  render: () => (
    <Stack gap="3" width="320px">
      <Input variant="flat" placeholder="Flat, plain" />
      <Input variant="flat" leadingSlot="https://" placeholder="example.com" />
      <Input variant="flat" clearable defaultValue="Clear me" placeholder="Flat, clearable" />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: () => {
    function Controlled(): React.ReactElement {
      const [value, setValue] = useState('');
      return (
        <Stack gap="3" width="320px">
          <Input value={value} onChange={setValue} placeholder="Type here" />
          <Text size="sm">
            Live value: <strong>{value || '(empty)'}</strong>
          </Text>
        </Stack>
      );
    }
    return <Controlled />;
  },
};

export const InsideFormField: Story = {
  name: 'Composed with FormField',
  render: () => {
    function Demo(): React.ReactElement {
      const [email, setEmail] = useState('');
      const invalid = email.length > 0 && !email.includes('@');
      return (
        <Form>
          <Stack gap="4" width="360px">
            <FormField name="email" invalid={invalid} required>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" value={email} onChange={setEmail} />
              </FormControl>
              <FormDescription>We will never share your email.</FormDescription>
              <FormMessage>{invalid ? 'Needs an @' : undefined}</FormMessage>
            </FormField>
          </Stack>
        </Form>
      );
    }
    return <Demo />;
  },
};
```

- [ ] **Step 2: Build Storybook to verify the stories compile**

Run: `pnpm --filter @cynosure/react build`
Expected: 0 errors. (Storybook tsc happens as part of the package build.)

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/forms/Input/Input.stories.tsx
git commit -m "docs(input): migrate stories to slot api + add flat/multi-slot stories"
```

---

## Task 5 — Search for other consumers, migrate or confirm none exist

**Files:**
- Modify: any file discovered (none expected other than generated props.json)

- [ ] **Step 1: Grep the repo for removed props**

Run:
```bash
grep -rn --include='*.tsx' --include='*.ts' --include='*.mdx' \
  -e 'leftAddon' -e 'rightAddon' -e 'leftElement' -e 'rightElement' \
  packages/ apps/ 2>/dev/null
```

Expected: Hits only in `packages/docs/src/generated/props.json` (auto-generated — will be regenerated), and the spec/plan docs. Any source-code hits outside generated files must be migrated:

- `leftAddon="X"` → `leadingSlot="X"`
- `rightAddon="X"` → `trailingSlot="X"`
- `leftElement={<X />}` → `leadingSlot={<X />}`
- `rightElement={<X />}` → `trailingSlot={<X />}`

- [ ] **Step 2: If any consumers found, migrate them**

Apply the mappings above. If `leftAddon` and `leftElement` both appeared on the same Input, combine into an array: `leadingSlot={["https://", <Icon />]}`.

- [ ] **Step 3: Regenerate docs props**

Run: `pnpm --filter @cynosure/docs generate:props` (or equivalent — check `packages/docs/package.json` scripts for the exact name; fall back to running the full docs build if no dedicated script exists).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(input): migrate consumers + regenerate docs props"
```

---

## Task 6 — Full verification

- [ ] **Step 1: Full test run**

Run: `pnpm --filter @cynosure/react test`
Expected: all tests pass.

- [ ] **Step 2: Full typecheck + lint**

Run: `pnpm --filter @cynosure/react typecheck && pnpm --filter @cynosure/react lint`
Expected: 0 errors.

- [ ] **Step 3: Build the package**

Run: `pnpm --filter @cynosure/react build`
Expected: clean build.

- [ ] **Step 4: Visual sanity in Storybook**

Run: `pnpm --filter @cynosure/react storybook` (or the monorepo's storybook command)
Verify:
- `Forms/Input/Variants` — outline/filled/ghost now show as multi-well (gap between slots); flat shows as single well.
- `Forms/Input/Slots` — `https://` is rendered in its own well with a gap before the field; icon leading slot is centered in a square well.
- `Forms/Input/Clearable` — second row (invalid + clearable) shows the × in a red-tinted well.
- `Forms/Input/Password` — eye toggle sits in an action well with accent hover.
- `Forms/Input/Flat` — all three rows match today's single-well look.
- Focus ring appears on the field well only; hovering the password/clear well tints it accent.

If any of the above is off, fix and commit before merging.

- [ ] **Step 5: No commit needed (verification only). Push the branch.**

---
