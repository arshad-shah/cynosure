# Input — multi-well redesign

**Date:** 2026-04-21
**Status:** Design approved, ready for implementation plan
**Component:** `packages/react/src/forms/Input`

## Motivation

The current `Input` is a single "punched well" with inline left/right affordances. `DatePicker` already uses a richer "multi-well" punched-card language (icon pocket · segment pocket · trigger pocket with gaps between them), and `Textarea` uses distinctive affordance treatments (accent-tinted hover on interactive buttons, invalid state tinting the clear button red). `Input` feels flatter than its siblings and doesn't visually belong to the same family.

Goal: promote `Input` to the same multi-well visual language as `DatePicker`, with the interactive affordance treatment from `Textarea`, while keeping an escape hatch for dense layouts.

## Scope

**In scope:**

- Replace the default look with a multi-well shape: `[leading well(s)] gap [field well] gap [trailing well(s)]`.
- Unify `leftAddon`/`rightAddon`/`leftElement`/`rightElement` into a single `leadingSlot` / `trailingSlot` API (accepts `ReactNode` or `ReactNode[]`).
- Auto-classify slot children as `inertWell` (text/icon) vs. `actionWell` (button/`role="button"`/has `onClick`).
- Auto-populate `trailingSlot` with the clear × (when `clearable` and value non-empty) and password toggle (when `type="password"`) — consumers can still pass their own nodes alongside.
- Add `variant="flat"` as the escape hatch that preserves today's single-well layout for dense layouts (tables, inline editors); `flat` renders slots inline inside the one well.
- Share the well base styling between `Input` and `DatePicker` by lifting `DatePicker.css.ts`'s `wellBase` into `shared/control.css.ts` as `fieldWellBase`.

**Out of scope:**

- Footer row / counter / character `limit` / hint slot — these stay Textarea's job. (Revisit as a follow-up if single-line counters become a real need.)
- Changes to `DatePicker`, `Textarea`, `NumberInput` beyond the shared CSS module being relocated.
- New form-field wrapper abstractions.

## API

```ts
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

export interface InputOwnProps extends FormControlBase<string> {
  type?: InputType;

  /**
   * Leading slot(s). A single node renders as one leading well; an array
   * renders as multiple adjacent wells with the standard gap.
   * Strings like "https://" are allowed and render as inert text wells.
   */
  leadingSlot?: ReactNode | ReactNode[];

  /** Trailing slot(s). Same rules as leadingSlot. */
  trailingSlot?: ReactNode | ReactNode[];

  /** When true and value is non-empty, the clear (×) button is appended as a trailing action well. */
  clearable?: boolean;

  /**
   * Visual shape:
   *  - 'outline' (default) — multi-well, subtle recess on each well
   *  - 'filled' — multi-well, deeper recess, transparent borders
   *  - 'ghost' — multi-well, wells appear on hover/focus only
   *  - 'flat' — legacy single-well fallback for dense layouts; slots render inline
   */
  variant?: 'outline' | 'filled' | 'ghost' | 'flat';

  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

export type InputProps = InputOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type'>;
```

**Breaking changes:** `leftAddon`, `rightAddon`, `leftElement`, `rightElement` are removed. The replacement is `leadingSlot` / `trailingSlot`. Stories and any internal consumers are migrated in the same change.

## Visual model

### Structure

```
[ leading well(s) ]  gap  [ field well (flex:1) ]  gap  [ trailing well(s) ]
```

- Gap between wells: `vars.space[2]` (matches DatePicker).
- All wells share `fieldWellBase`: `background.subtle`, `border.default`, 1px inset highlight, radius tracking the control size.

### Well kinds

| Kind         | Used for                                               | Interaction                                                                 |
| ------------ | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `inertWell`  | Non-interactive slot content (icons, `"https://"` text) | `pointer-events: none`, `color: foreground.subtle`, `cursor: default`.      |
| `fieldWell`  | The `<input>` itself                                   | Text cursor. Focus-within lifts to `background.surface` + 2px accent ring.  |
| `actionWell` | Interactive slot content (clear ×, password toggle, custom buttons) | Accent-tinted hover/pressed (DatePicker's chevron pattern); `:focus-visible` ring. |

**Auto-classification:** a slot child is rendered as `actionWell` if any of:

1. It is a native `<button>` element.
2. Its `role === 'button'`.
3. It has an `onClick` prop.

Otherwise it renders as `inertWell`. Consumers who need to override can wrap their content in a `<button>` (forces action) or a `<span>` (forces inert).

### State model (`data-*` on root, wells react in lockstep)

| State          | Effect                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `hover`        | Field well border → `border.strong`. Other wells unchanged.                                        |
| `focus-within` | Field well lifts to `background.surface` + 2px `accent.ring`. Other wells unchanged.               |
| `invalid`      | All wells get `feedback.danger.border`. When focused, ring becomes danger. Clear × action well picks up `feedback.danger.soft` tint (Textarea pattern). |
| `disabled`     | Root `opacity: 0.6`, `cursor: not-allowed`, all wells `border.disabled`.                            |
| `readonly`     | All wells shift to `background.muted`.                                                              |
| `variant="flat"` | Wells collapse into a single legacy well (today's `controlWrapperBase`); slots render inline.    |

### Sizing

Per-size tokens remain the same as today's `controlSize` (`sm` / `md` / `lg` → min-heights `2` / `2.5` / `3` rem, matching DatePicker). Slot wells are `width ≈ minHeight` (square-ish pockets); the field well flexes.

## File changes

- `packages/react/src/forms/shared/control.css.ts` — add `fieldWellBase` (lifted from DatePicker), plus `inertWell`, `fieldWell`, `actionWell` building blocks and the root wrapper for the multi-well layout.
- `packages/react/src/forms/DatePicker/DatePicker.css.ts` — `wellBase` becomes a re-export/composition over `fieldWellBase`; DatePicker visuals unchanged.
- `packages/react/src/forms/Input/Input.css.ts` — replaced with per-variant root (`multiWellRoot` + `flatRoot`), gap token, slot container, plus the slot-kind classes.
- `packages/react/src/forms/Input/Input.tsx` — rewritten around `leadingSlot` / `trailingSlot`, slot auto-classification, and `variant="flat"` fallback branch.
- `packages/react/src/forms/Input/Input.stories.tsx` — migrated to new API; new stories for slotted variants, invalid clear tint, flat fallback.
- `packages/docs/src/examples/**/input-*.tsx` (if any) — migrated to new API.

## Testing

- Unit: slot auto-classification (button vs. icon vs. string); clear × only renders when `clearable && value !== ''`; password toggle only when `type === 'password'`; `variant="flat"` renders a single well with slots inline.
- Visual: stories covering rest / hover / focus / invalid / disabled / readonly for each variant (`outline`, `filled`, `ghost`, `flat`) across all sizes (`sm`, `md`, `lg`).
- Accessibility: clear × and password toggle keep their current `aria-label`s; password toggle keeps `aria-pressed`; focus ring is visible on each action well.

## Migration

`leftAddon` / `rightAddon` / `leftElement` / `rightElement` are removed in the same PR. Internal call sites (stories, docs examples) are updated. This is a minor-version UI break documented in the changelog. There are no external consumers to warn yet.
