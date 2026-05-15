import {
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useDirectionContext } from '../../theme/DirectionProvider.js';
import { cn } from '../../utils/cn.js';
import { radioGroupHorizontal, radioGroupRoot } from '../Radio/Radio.css.js';

/** Props for `<RadioGroup>` — single-select radio container. */
export interface RadioGroupProps {
  /** Controlled selected radio value. */
  value?: string;
  /** Uncontrolled initial selected value. */
  defaultValue?: string;
  /** Fires with the next value on selection change. */
  onValueChange?: (value: string) => void;
  /** Submitted form field name shared across every radio in the group. */
  name?: string;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Marks the field as required for form submission. */
  required?: boolean;
  /**
   * Layout direction. Affects arrow-key navigation.
   * @default "vertical"
   */
  orientation?: 'horizontal' | 'vertical';
  /** `aria-label` for the group when no visible label is provided. */
  'aria-label'?: string;
  /** `aria-labelledby` — typically the id of a companion `<Label>`. */
  'aria-labelledby'?: string;
  id?: string;
  children?: ReactNode;
  className?: string;
}

export interface RadioGroupContextValue {
  value: string;
  setValue: (v: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  orientation: 'horizontal' | 'vertical';
  registerItem: (node: HTMLButtonElement | null, value: string) => () => void;
  focusItem: (target: 'first' | 'last' | 'next' | 'prev', from: HTMLButtonElement) => void;
  /** First registered item's value — used as the keyboard entry point
   *  when nothing is selected yet. `''` until the first child mounts. */
  firstValue: string;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/**
 * Single-select radio group. Owns selection state and arrow-key roving
 * tabindex over its descendant `<Radio>` items. Owned in-tree (no Radix
 * dep) — the contract mirrors Radix's `RadioGroup`/`RadioGroupItem`.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    name,
    disabled,
    required,
    orientation = 'vertical',
    className,
    children,
    ...rest
  },
  ref,
) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const itemsRef = useRef<Array<{ node: HTMLButtonElement; value: string }>>([]);
  const [firstValue, setFirstValue] = useState<string>('');
  const recomputeFirst = useCallback(() => {
    const first = itemsRef.current.find(({ node }) => !node.disabled);
    setFirstValue(first?.value ?? '');
  }, []);
  const registerItem = useCallback(
    (node: HTMLButtonElement | null, v: string) => {
      if (!node) return () => {};
      itemsRef.current.push({ node, value: v });
      recomputeFirst();
      return () => {
        const i = itemsRef.current.findIndex((it) => it.node === node);
        if (i >= 0) itemsRef.current.splice(i, 1);
        recomputeFirst();
      };
    },
    [recomputeFirst],
  );

  const direction = useDirectionContext();
  const isRtl = direction.dir === 'rtl';

  const focusItem = useCallback<RadioGroupContextValue['focusItem']>(
    (target, from) => {
      const enabled = itemsRef.current.filter(({ node }) => !node.disabled).map((entry) => entry);
      if (enabled.length === 0) return;
      const idx = enabled.findIndex(({ node }) => node === from);
      let next = idx;
      if (target === 'first') next = 0;
      else if (target === 'last') next = enabled.length - 1;
      else if (target === 'next') next = (idx + 1) % enabled.length;
      else next = (idx - 1 + enabled.length) % enabled.length;
      if (isRtl && orientation === 'horizontal' && (target === 'next' || target === 'prev')) {
        next =
          target === 'next'
            ? (idx - 1 + enabled.length) % enabled.length
            : (idx + 1) % enabled.length;
      }
      const targetEntry = enabled[next];
      if (!targetEntry) return;
      targetEntry.node.focus();
      // Arrow keys activate immediately in a radio group (per ARIA).
      setValue(targetEntry.value);
    },
    [isRtl, orientation, setValue],
  );

  const ctxValue = useMemo<RadioGroupContextValue>(
    () => ({
      value,
      setValue,
      name,
      disabled,
      required,
      orientation,
      registerItem,
      focusItem,
      firstValue,
    }),
    [value, setValue, name, disabled, required, orientation, registerItem, focusItem, firstValue],
  );

  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <div
        ref={ref}
        role="radiogroup"
        data-orientation={orientation}
        className={cn(
          radioGroupRoot,
          orientation === 'horizontal' ? radioGroupHorizontal : undefined,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
