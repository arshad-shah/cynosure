import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { formField } from './FormField.css.js';
import { type FormFieldContextValue, FormFieldProvider } from './FormFieldContext.js';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** `name` attribute forwarded to the inner control for form submission. */
  name?: string;
  /** Marks the field as invalid; drives `aria-invalid` + alert semantics. */
  invalid?: boolean;
  /** Marks the field as disabled; inherited by the inner control. */
  disabled?: boolean;
  /** Marks the field as required; inherited by the inner control + Label. */
  required?: boolean;
  children?: ReactNode;
}

/**
 * One logical form field. Generates a stable ID, provides a context that
 * `FormLabel` / `FormControl` / `FormDescription` / `FormMessage` consume, and
 * auto-wires `aria-describedby` / `aria-invalid` / `htmlFor` across the
 * children so every field is accessible by construction.
 *
 * Layout is a vertical flex column with a small gap.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { name, invalid, disabled, required, className, children, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = name ? `${name}-${reactId}` : reactId;
  const [describedBy, setDescribedBy] = useState<string[]>([]);

  const registerDescribedBy = useCallback((id: string) => {
    setDescribedBy((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => {
      setDescribedBy((prev) => prev.filter((x) => x !== id));
    };
  }, []);

  const value = useMemo<FormFieldContextValue>(
    () => ({
      id: fieldId,
      name,
      describedBy,
      invalid: !!invalid,
      disabled: !!disabled,
      required: !!required,
      registerDescribedBy,
    }),
    [fieldId, name, describedBy, invalid, disabled, required, registerDescribedBy],
  );

  return (
    <FormFieldProvider value={value}>
      <div
        ref={ref}
        className={cn(formField, className)}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        data-required={required || undefined}
        {...rest}
      >
        {children}
      </div>
    </FormFieldProvider>
  );
});
