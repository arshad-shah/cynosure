/**
 * Common contract that every form control implements.
 *
 * Each form component either implements `FormControlBase<T>` directly
 * (`Input`, `Textarea`, `NumberInput`) or picks the boolean-oriented subset
 * via `BooleanFormControlBase` (`Checkbox`, `Switch`, `Radio`) which uses
 * `checked` / `onCheckedChange` to match the Radix + React Aria conventions.
 *
 * `T` is the value type — typically `string` for text inputs and `number` for
 * numeric inputs. `size`/`variant` live here so the visual vocabulary is
 * shared across every control.
 */
export interface FormControlBase<T> {
  /** Controlled value. Pair with `onChange`. */
  value?: T;
  /** Uncontrolled initial value. */
  defaultValue?: T;
  /** Called with the next value whenever the user changes the field. */
  onChange?: (value: T) => void;

  /** Disables interaction and dims the field. */
  disabled?: boolean;
  /** Renders the field as read-only — value is visible and selectable but not editable. */
  readOnly?: boolean;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /** Renders the invalid state (red border, error styling) and sets `aria-invalid`. */
  invalid?: boolean;
  /** Submitted form field name. */
  name?: string;
  /** Element id — auto-generated via `useId` when omitted. */
  id?: string;
  /** Focuses the control on mount. */
  autoFocus?: boolean;

  /**
   * Control size — affects height, padding, and font size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Visual treatment. `outline` is the default bordered surface; `filled`
   * uses a tinted background; `ghost` removes the surface entirely.
   * @default "outline"
   */
  variant?: FormControlVariant;
}

export type FormControlSize = 'sm' | 'md' | 'lg';
export type FormControlVariant = 'outline' | 'filled' | 'ghost';

/** Subset for boolean inputs — Checkbox, Switch, and (through group) Radio. */
export interface BooleanFormControlBase {
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Marks the control as required for form submission. */
  required?: boolean;
  /** Renders the invalid state and sets `aria-invalid`. */
  invalid?: boolean;
  /** Submitted form field name. */
  name?: string;
  /** Element id — auto-generated when omitted. */
  id?: string;
  /** Focuses the control on mount. */
  autoFocus?: boolean;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
}
