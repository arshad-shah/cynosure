import { forwardRef } from 'react';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect.js';
import { HelperText, type HelperTextProps } from '../HelperText/HelperText.js';
import { useFormField } from './FormFieldContext.js';

export interface FormDescriptionProps extends HelperTextProps {}

/**
 * Descriptive helper copy for a field (e.g. "We'll never share your email").
 * Registers its id onto the `FormField`'s `aria-describedby` list so the
 * control announces it.
 */
export const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  function FormDescription({ id, ...rest }, ref) {
    const field = useFormField();
    const descId = id ?? `${field.id}-description`;
    const { registerDescribedBy } = field;
    useIsomorphicLayoutEffect(() => registerDescribedBy(descId), [descId, registerDescribedBy]);
    return <HelperText ref={ref} id={descId} {...rest} />;
  },
);
