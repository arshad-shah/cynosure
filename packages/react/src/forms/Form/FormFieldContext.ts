import { createContext } from '../../utils/createContext.js';

export interface FormFieldContextValue {
  /** Stable unique ID for this field; derived from `name` or `useId`. */
  id: string;
  /** Optional `name` attribute threaded onto the control for form submission. */
  name?: string;
  /** IDs of description + message elements, joined into `aria-describedby`. */
  describedBy: string[];
  /** Whether the field is invalid. */
  invalid: boolean;
  /** Whether the field is disabled. */
  disabled: boolean;
  /** Whether the field is required. */
  required: boolean;
  /** Register a described-by ID (FormDescription / FormMessage call this on mount). */
  registerDescribedBy: (id: string) => () => void;
}

export const [FormFieldProvider, useFormField, FormFieldContext] =
  createContext<FormFieldContextValue>('FormFieldProvider');
