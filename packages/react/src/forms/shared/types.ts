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
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;

  size?: FormControlSize;
  variant?: FormControlVariant;
}

export type FormControlSize = 'sm' | 'md' | 'lg';
export type FormControlVariant = 'outline' | 'filled' | 'ghost';

/** Subset for boolean inputs — Checkbox, Switch, and (through group) Radio. */
export interface BooleanFormControlBase {
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  size?: FormControlSize;
}
