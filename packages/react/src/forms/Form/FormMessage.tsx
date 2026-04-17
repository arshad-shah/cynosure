import { type ReactNode, forwardRef } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect.js';
import { ErrorText, type ErrorTextProps } from '../ErrorText/ErrorText.js';
import { useFormField } from './FormFieldContext.js';

export interface FormMessageProps extends Omit<ErrorTextProps, 'children'> {
  children?: ReactNode;
}

/**
 * Validation message for a field. Renders nothing when `children` is empty so
 * consumers can bind `{errors.foo?.message}` unconditionally. When content
 * exists it registers onto the `FormField`'s `aria-describedby` list and
 * announces via `role="alert"` (driven by the field's `invalid` state).
 */
export const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(function FormMessage(
  { id, children, role, ...rest },
  ref,
) {
  const field = useFormField();
  const msgId = id ?? `${field.id}-message`;
  const hasMessage =
    children !== null && children !== undefined && children !== false && children !== '';

  const { registerDescribedBy } = field;
  useIsomorphicLayoutEffect(() => {
    if (!hasMessage) return;
    return registerDescribedBy(msgId);
  }, [hasMessage, msgId, registerDescribedBy]);

  if (!hasMessage) return null;

  const resolvedRole = role ?? (field.invalid ? 'alert' : undefined);
  return (
    <ErrorText ref={ref} id={msgId} role={resolvedRole} {...rest}>
      {children}
    </ErrorText>
  );
});
