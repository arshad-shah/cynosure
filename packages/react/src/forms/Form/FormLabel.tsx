import { forwardRef } from 'react';
import { Label, type LabelProps } from '../Label/Label.js';
import { useFormField } from './FormFieldContext.js';

export interface FormLabelProps extends Omit<LabelProps, 'htmlFor'> {
  /**
   * Override the associated control id. Rarely needed — by default the label
   * is wired to the enclosing `FormField`'s generated id.
   */
  htmlFor?: string;
}

/**
 * Label for a field inside a `FormField`. Automatically wires `htmlFor` and
 * inherits `required` from the surrounding `FormField`.
 */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel(
  { htmlFor, required, ...rest },
  ref,
) {
  const field = useFormField();
  const resolvedRequired = required ?? field.required;
  return <Label ref={ref} htmlFor={htmlFor ?? field.id} required={resolvedRequired} {...rest} />;
});
