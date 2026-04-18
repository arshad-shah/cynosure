import { Children, type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react';
import { useFormField } from './FormFieldContext.js';

export interface FormControlProps {
  /**
   * Exactly one input-like element. `FormControl` clones it and injects
   * `id`, `name`, `aria-invalid`, `aria-describedby`, `disabled`, `required`,
   * and `invalid` (the Cynosure-specific prop), preferring any value the child
   * already sets.
   */
  children: ReactNode;
}

type ControlInjected = {
  id?: string;
  name?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
};

type CloneableProps = ControlInjected & Record<string, unknown>;

/**
 * Connects the single child control to the enclosing `FormField`. Clones the
 * child (rather than wrapping in a div) so CSS selectors targeting the
 * control remain direct siblings of labels/messages inside the field stack.
 *
 * Any prop the child already sets wins — `FormControl` only fills in gaps.
 */
export function FormControl({ children }: FormControlProps): ReactElement {
  const field = useFormField();
  const only = Children.only(children);

  if (!isValidElement(only)) {
    throw new Error(
      '`FormControl` requires a single React element child (an input, select, etc.).',
    );
  }

  const child = only as ReactElement<CloneableProps>;
  const existing = child.props;

  const mergedDescribedBy = [existing['aria-describedby'], ...field.describedBy]
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ')
    .trim();

  const next: ControlInjected = {
    id: existing.id ?? field.id,
    name: existing.name ?? field.name,
    'aria-invalid': existing['aria-invalid'] ?? (field.invalid || undefined),
    'aria-describedby': mergedDescribedBy.length > 0 ? mergedDescribedBy : undefined,
    disabled: existing.disabled ?? (field.disabled || undefined),
    required: existing.required ?? (field.required || undefined),
    invalid: existing.invalid ?? (field.invalid || undefined),
  };

  return cloneElement(child, next);
}
