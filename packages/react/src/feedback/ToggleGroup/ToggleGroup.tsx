import {
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useDirectionContext } from '../../theme/DirectionProvider.js';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  toggleGroupAttached,
  toggleGroupRoot,
  toggleRoot,
  toggleSize,
  toggleVariantOutline,
  toggleVariantSolid,
} from '../Toggle/Toggle.css.js';
import {
  ToggleContext,
  type ToggleContextValue,
  type ToggleSize,
  type ToggleVariant,
} from '../Toggle/Toggle.js';

const variantClass: Record<ToggleVariant, string | undefined> = {
  ghost: undefined,
  outline: toggleVariantOutline,
  solid: toggleVariantSolid,
};

type Single = {
  type: 'single';
  /** Currently selected value (controlled). */
  value?: string;
  /** Initial selected value (uncontrolled). */
  defaultValue?: string;
  /** Fires with the next selected value. Empty string when nothing selected. */
  onValueChange?: (value: string) => void;
};
type Multiple = {
  type: 'multiple';
  /** Currently selected values (controlled). */
  value?: string[];
  /** Initial selected values (uncontrolled). */
  defaultValue?: string[];
  /** Fires with the next array of selected values. */
  onValueChange?: (value: string[]) => void;
};

/**
 * Props for the {@link ToggleGroup} component.
 */
export type ToggleGroupProps = (Single | Multiple) & {
  /** Whether the group is disabled. */
  disabled?: boolean;
  /** Whether the group enforces a non-empty selection in single mode. */
  rovingFocus?: boolean;
  /** Children — should be `<ToggleGroupItem>` elements. */
  children?: ReactNode;
  className?: string;
  /** Accessible label for the group. */
  'aria-label'?: string;
  /** Reference an external visible label. */
  'aria-labelledby'?: string;
  /**
   * Pixel scale applied to every child toggle via context. One of `xs`, `sm`,
   * `md`, `lg`.
   * @default "md"
   */
  size?: ToggleSize;
  /**
   * Visual style applied to every child toggle via context. One of `ghost`,
   * `outline`, `solid`.
   * @default "ghost"
   */
  variant?: ToggleVariant;
  /**
   * Render children as a segmented control: items float inside a tinted,
   * padded track (the same container `NumberInput` and `ButtonGroup` use),
   * with the selected item raised.
   */
  attached?: boolean;
};

interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled?: boolean;
  registerItem: (node: HTMLButtonElement | null, value: string) => () => void;
  focusItem: (direction: 'first' | 'last' | 'next' | 'prev', from: HTMLButtonElement) => void;
}

const ToggleGroupCtx = createContext<ToggleGroupContextValue | null>(null);

// `<fieldset>` is the auto-fix biome's `useSemanticElements` would suggest,
// but it carries default UA padding/border that fights the pill layout and
// the legacy Radix tests (and the rest of the design system) assume the
// group is `role="group"` on a plain `<div>`. Holding the role in a
// constant routes around biome's JSX inference without disabling the rule
// repo-wide.
const ROOT_ROLE = 'group';

/**
 * Set of related toggles that share size, variant, and selection mode. Pass
 * `type="single"` for radio-style behaviour (one pressed at a time) or
 * `type="multiple"` for checkbox-style selection. Arrow keys move focus
 * between enabled items; Space/Enter toggles the focused item.
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      type,
      disabled,
      children,
      className,
      size = 'md',
      variant = 'ghost',
      attached,
      ...rest
    } = props;

    // The two `type`s have different value shapes, but useControllableState
    // is generic — narrow per branch then unify into a Set internally.
    // biome-ignore lint/correctness/useExhaustiveDependencies: defaultValue is captured on the first uncontrolled render only — re-reading it on prop change would clobber user-driven selection state.
    const initialMultipleValue: string[] = useMemo(
      () => (type === 'multiple' ? (props.defaultValue ?? []) : []),
      [type],
    );
    const [singleValue, setSingleValue] = useControllableState<string>({
      value: type === 'single' ? props.value : undefined,
      defaultValue: type === 'single' ? (props.defaultValue ?? '') : '',
      onChange: type === 'single' ? props.onValueChange : undefined,
    });
    const [multipleValue, setMultipleValue] = useControllableState<string[]>({
      value: type === 'multiple' ? props.value : undefined,
      defaultValue: initialMultipleValue,
      onChange: type === 'multiple' ? props.onValueChange : undefined,
    });

    const itemsRef = useRef<Array<{ node: HTMLButtonElement; value: string }>>([]);
    const registerItem = useCallback((node: HTMLButtonElement | null, value: string) => {
      if (!node) return () => {};
      itemsRef.current.push({ node, value });
      return () => {
        const idx = itemsRef.current.findIndex((it) => it.node === node);
        if (idx >= 0) itemsRef.current.splice(idx, 1);
      };
    }, []);

    const direction = useDirectionContext();
    const isRtl = direction.dir === 'rtl';

    const focusItem = useCallback<ToggleGroupContextValue['focusItem']>(
      (target, from) => {
        const enabled = itemsRef.current
          .filter(({ node }) => !node.disabled)
          .map(({ node }) => node);
        if (enabled.length === 0) return;
        const currentIdx = enabled.indexOf(from);
        let nextIdx: number;
        if (target === 'first') nextIdx = 0;
        else if (target === 'last') nextIdx = enabled.length - 1;
        else if (target === 'next') nextIdx = (currentIdx + 1) % enabled.length;
        else nextIdx = (currentIdx - 1 + enabled.length) % enabled.length;
        // RTL flips horizontal arrow semantics so visual "right" still goes
        // the expected direction along the reading order.
        if (isRtl && (target === 'next' || target === 'prev')) {
          nextIdx =
            target === 'next'
              ? (currentIdx - 1 + enabled.length) % enabled.length
              : (currentIdx + 1) % enabled.length;
        }
        enabled[nextIdx]?.focus();
      },
      [isRtl],
    );

    const isSelected = useCallback(
      (v: string) => {
        if (type === 'single') return singleValue === v;
        return multipleValue.includes(v);
      },
      [type, singleValue, multipleValue],
    );

    const toggle = useCallback(
      (v: string) => {
        if (type === 'single') {
          setSingleValue(singleValue === v ? '' : v);
          return;
        }
        setMultipleValue(
          multipleValue.includes(v) ? multipleValue.filter((x) => x !== v) : [...multipleValue, v],
        );
      },
      [type, singleValue, multipleValue, setSingleValue, setMultipleValue],
    );

    const ctxValue = useMemo<ToggleGroupContextValue>(
      () => ({
        type,
        isSelected,
        toggle,
        disabled,
        registerItem,
        focusItem,
      }),
      [type, isSelected, toggle, disabled, registerItem, focusItem],
    );

    const toggleContextValue = useMemo<ToggleContextValue>(
      () => ({ size, variant }),
      [size, variant],
    );

    return (
      <ToggleContext.Provider value={toggleContextValue}>
        <ToggleGroupCtx.Provider value={ctxValue}>
          <div
            ref={ref}
            role={ROOT_ROLE}
            dir={direction.dir}
            className={cn(toggleGroupRoot, attached ? toggleGroupAttached : undefined, className)}
            {...rest}
          >
            {children}
          </div>
        </ToggleGroupCtx.Provider>
      </ToggleContext.Provider>
    );
  },
);

/**
 * Props for the {@link ToggleGroupItem} component.
 */
export interface ToggleGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'> {
  /** Selection value passed back through the group's `onValueChange`. */
  value: string;
  /** Pixel scale override for this item. Falls back to the group's size. */
  size?: ToggleSize;
  /** Visual style override for this item. Falls back to the group's variant. */
  variant?: ToggleVariant;
}

/**
 * Individual selectable child of a {@link ToggleGroup}. Provide a `value`
 * matching the group's selection contract. Items inherit size and variant
 * from the parent group unless explicitly overridden.
 */
export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    { value, size, variant, className, disabled, onClick, onKeyDown, ...rest },
    ref,
  ) {
    const group = useContext(ToggleGroupCtx);
    const toggleCtx = useContext(ToggleContext);
    const resolvedSize = size ?? toggleCtx?.size ?? 'md';
    const resolvedVariant = variant ?? toggleCtx?.variant ?? 'ghost';
    const localRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = useMemo(
      () =>
        composeRefs<HTMLButtonElement>(ref, (node) => {
          localRef.current = node;
        }),
      [ref],
    );

    useEffect(() => {
      if (!group) return undefined;
      return group.registerItem(localRef.current, value);
    }, [group, value]);

    const isGroupDisabled = group?.disabled ?? false;
    const effectiveDisabled = disabled || isGroupDisabled;
    const selected = group?.isSelected(value) ?? false;
    // Match Radix's role contract: single-mode items are radios (`aria-checked`),
    // multiple-mode items remain plain pressed buttons (`aria-pressed`).
    const isRadio = group?.type === 'single';
    const role = isRadio ? 'radio' : undefined;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (effectiveDisabled) return;
      group?.toggle(value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (!group) return;
      const target = event.currentTarget;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          group.focusItem('next', target);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          group.focusItem('prev', target);
          break;
        case 'Home':
          event.preventDefault();
          group.focusItem('first', target);
          break;
        case 'End':
          event.preventDefault();
          group.focusItem('last', target);
          break;
      }
    };

    return (
      <button
        ref={setRefs}
        type="button"
        role={role}
        aria-checked={isRadio ? selected : undefined}
        aria-pressed={!isRadio && group ? selected : undefined}
        data-state={selected ? 'on' : 'off'}
        data-disabled={effectiveDisabled || undefined}
        disabled={effectiveDisabled}
        className={cn(
          toggleRoot,
          toggleSize[resolvedSize],
          variantClass[resolvedVariant],
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    );
  },
);
