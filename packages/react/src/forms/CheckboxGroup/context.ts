import { createContext } from 'react';

export interface CheckboxGroupContextValue {
  value: string[];
  onItemChange: (value: string, checked: boolean) => void;
  name?: string;
  disabled?: boolean;
}

/**
 * Context for sharing value/onChange between `<CheckboxGroup>` and the
 * `<Checkbox value="...">` children inside it. Absent context = standalone
 * checkbox (individual `checked`/`onCheckedChange` props apply).
 */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(undefined);
