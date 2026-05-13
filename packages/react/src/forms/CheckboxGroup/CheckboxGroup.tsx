import { type HTMLAttributes, type ReactNode, forwardRef, useCallback, useMemo } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { CheckboxGroupContext } from './context.js';

/** Props for `<CheckboxGroup>` — owns the array of selected values. */
export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled array of selected checkbox values. */
  value?: string[];
  /** Uncontrolled initial array of selected values. */
  defaultValue?: string[];
  /** Fires with the next array on every toggle. */
  onChange?: (value: string[]) => void;
  /** Shared submit name for every checkbox in the group. Individual `name` overrides take precedence. */
  name?: string;
  /** Disables every checkbox in the group. */
  disabled?: boolean;
  /** A11y label for the group — resolves to `aria-label` on the wrapper. */
  'aria-label'?: string;
  children?: ReactNode;
}

/**
 * Groups `<Checkbox value="...">` children into a single multi-select value
 * array. Each child reads the group context to compute its `checked` state
 * and report toggles back into the shared array — individual `checked` /
 * `onCheckedChange` props on those children are ignored inside a group.
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onChange,
      name,
      disabled,
      children,
      role = 'group',
      ...rest
    } = props;

    const [value, setValue] = useControllableState<string[]>({
      value: valueProp,
      defaultValue: defaultValue ?? [],
      onChange,
    });

    const onItemChange = useCallback(
      (itemValue: string, checked: boolean) => {
        setValue((prev) => {
          const has = prev.includes(itemValue);
          if (checked && !has) return [...prev, itemValue];
          if (!checked && has) return prev.filter((v) => v !== itemValue);
          return prev;
        });
      },
      [setValue],
    );

    const ctx = useMemo(
      () => ({ value, onItemChange, name, disabled }),
      [value, onItemChange, name, disabled],
    );

    return (
      <CheckboxGroupContext.Provider value={ctx}>
        <div ref={ref} role={role} {...rest}>
          {children}
        </div>
      </CheckboxGroupContext.Provider>
    );
  },
);
