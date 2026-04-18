import { type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useController,
} from 'react-hook-form';
import { FormControl } from '../FormControl.js';
import { FormDescription } from '../FormDescription.js';
import { FormField } from '../FormField.js';
import { FormLabel } from '../FormLabel.js';
import { FormMessage } from '../FormMessage.js';

export interface RHFFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
> {
  /** RHF control from `useForm()`. */
  control: Control<TValues>;
  /** Field path in the RHF schema. */
  name: TName;
  /** Label content. */
  label: ReactNode;
  /** Optional helper copy. */
  description?: ReactNode;
  /** The input-like element that renders this field's control. */
  children: ReactElement;
  /** RHF validation rules. */
  rules?: RegisterOptions<TValues, TName>;
  /** Mark the field as required on the Label + `aria-required`. */
  required?: boolean;
  /** Mark the field as disabled. */
  disabled?: boolean;
}

/**
 * `react-hook-form` adapter that wires `useController` through the Cynosure
 * `FormField` scaffolding. Handles error state, `aria-invalid`, message
 * announcement, and `field.onChange`/`value` binding in one component.
 *
 * ```tsx
 * <RHFField control={control} name="email" label="Email">
 *   <Input type="email" />
 * </RHFField>
 * ```
 *
 * `react-hook-form` is declared as an **optional peer dependency** in
 * `@arshad-shah/cynosure-react`'s `package.json`. Consumers that never import this adapter
 * don't need it installed and don't pay any runtime cost.
 */
export function RHFField<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>(props: RHFFieldProps<TValues, TName>): ReactElement {
  const { control, name, label, description, children, rules, required, disabled } = props;
  const { field, fieldState } = useController<TValues, TName>({ control, name, rules });

  if (!isValidElement(children)) {
    throw new Error('`RHFField` requires a single React element child.');
  }

  type InjectedControlProps = {
    value?: unknown;
    onChange?: (...args: unknown[]) => void;
    onBlur?: (...args: unknown[]) => void;
    ref?: unknown;
    name?: string;
    disabled?: boolean;
  };
  const injected: InjectedControlProps = {
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    name: field.name,
    disabled,
  };
  const inner = cloneElement(children as ReactElement<InjectedControlProps>, injected);

  return (
    <FormField name={name} invalid={!!fieldState.error} required={required} disabled={disabled}>
      <FormLabel>{label}</FormLabel>
      <FormControl>{inner}</FormControl>
      {description ? <FormDescription>{description}</FormDescription> : null}
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormField>
  );
}
