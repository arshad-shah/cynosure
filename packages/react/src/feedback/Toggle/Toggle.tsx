import * as RadixToggle from '@radix-ui/react-toggle';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  createContext,
  forwardRef,
  useContext,
} from 'react';
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
export interface ToggleProps extends ComponentPropsWithoutRef<typeof RadixToggle.Root> {
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
 * Two-state button that flips between on and off. Built on Radix Toggle, so
 * it exposes `aria-pressed` and supports controlled and uncontrolled
 * pressed-state APIs. Use Toggle for single binary actions like bold/italic
 * formatting controls; for mutually exclusive choices, prefer `ToggleGroup`.
 */
export const Toggle = forwardRef<ElementRef<typeof RadixToggle.Root>, ToggleProps>(function Toggle(
  { size, variant, className, ...rest },
  ref,
) {
  const context = useContext(ToggleContext);
  const resolvedSize = size ?? context?.size ?? 'md';
  const resolvedVariant = variant ?? context?.variant ?? 'ghost';

  return (
    <RadixToggle.Root
      ref={ref}
      className={cn(toggleRoot, toggleSize[resolvedSize], variantClass[resolvedVariant], className)}
      {...rest}
    />
  );
});
