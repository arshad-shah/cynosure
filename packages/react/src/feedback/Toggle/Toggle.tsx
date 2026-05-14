import { type ButtonHTMLAttributes, createContext, forwardRef, useContext } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import { toggleRoot, toggleSize, toggleVariantOutline, toggleVariantSolid } from './Toggle.css.js';

export type ToggleSize = 'xs' | 'sm' | 'md' | 'lg';
export type ToggleVariant = 'ghost' | 'outline' | 'solid';

export interface ToggleContextValue {
  size?: ToggleSize;
  variant?: ToggleVariant;
}

export const ToggleContext = createContext<ToggleContextValue | null>(null);

const variantClass: Record<ToggleVariant, string | undefined> = {
  ghost: undefined,
  outline: toggleVariantOutline,
  solid: toggleVariantSolid,
};

/**
 * Props for the {@link Toggle} component.
 */
export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange'> {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Uncontrolled initial pressed state. */
  defaultPressed?: boolean;
  /** Fires with the next pressed state when toggled. */
  onPressedChange?: (pressed: boolean) => void;
  /**
   * Pixel scale. One of `xs`, `sm`, `md`, `lg`. Inherits from a parent
   * `ToggleGroup` when unset.
   * @default "md"
   */
  size?: ToggleSize;
  /**
   * Visual style. `ghost` is borderless, `outline` is bordered, `solid` has
   * a filled active background. Inherits from a parent `ToggleGroup` when
   * unset.
   * @default "ghost"
   */
  variant?: ToggleVariant;
}

/**
 * Two-state button that flips between on and off. Renders a `<button>` with
 * `aria-pressed` and `data-state="on"|"off"` for styling hooks — same
 * contract Radix Toggle exposed, owned in-tree to drop the dep.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed: pressedProp,
    defaultPressed,
    onPressedChange,
    size,
    variant,
    className,
    onClick,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const context = useContext(ToggleContext);
  const resolvedSize = size ?? context?.size ?? 'md';
  const resolvedVariant = variant ?? context?.variant ?? 'ghost';

  const [pressed, setPressed] = useControllableState<boolean>({
    value: pressedProp,
    defaultValue: defaultPressed ?? false,
    onChange: onPressedChange,
  });

  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      data-disabled={disabled || undefined}
      disabled={disabled}
      className={cn(toggleRoot, toggleSize[resolvedSize], variantClass[resolvedVariant], className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (disabled) return;
        setPressed(!pressed);
      }}
      {...rest}
    />
  );
});
