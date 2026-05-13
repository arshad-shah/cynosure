import { type FieldsetHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { fieldset, legend } from './Fieldset.css.js';

/** Props for `<Fieldset>`. Extends native `<fieldset>` attributes (notably `disabled` and `name`). */
export interface FieldsetProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'children'> {
  /** Optional legend. Rendered as the first child inside the fieldset. */
  legend?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Groups related form controls under a shared visual + semantic boundary.
 * Renders `<fieldset>` with an optional `<legend>`. Disabling the fieldset
 * natively disables every nested form control.
 */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset(
  { legend: legendContent, children, className, disabled, ...rest },
  ref,
) {
  return (
    <fieldset
      ref={ref}
      className={cn(fieldset, className)}
      disabled={disabled}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {legendContent ? <legend className={legend}>{legendContent}</legend> : null}
      {children}
    </fieldset>
  );
});
