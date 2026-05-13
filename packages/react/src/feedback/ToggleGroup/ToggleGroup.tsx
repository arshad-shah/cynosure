import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useMemo } from 'react';
import { cn } from '../../utils/cn.js';
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

type RadixSingle = ComponentPropsWithoutRef<typeof RadixToggleGroup.Root> & { type: 'single' };
type RadixMulti = ComponentPropsWithoutRef<typeof RadixToggleGroup.Root> & { type: 'multiple' };

/**
 * Props for the {@link ToggleGroup} component.
 */
export type ToggleGroupProps = (RadixSingle | RadixMulti) & {
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
  /** Render children in an attached pill-bar layout with shared borders. */
  attached?: boolean;
};

/**
 * Set of related toggles that share size, variant, and selection mode. Pass
 * `type="single"` for radio-style behaviour (one pressed at a time) or
 * `type="multiple"` for checkbox-style selection. ToggleGroup forwards the
 * full Radix keyboard model — arrow keys move focus, Space/Enter toggles —
 * so it integrates with assistive tech out of the box.
 */
export const ToggleGroup = forwardRef<ElementRef<typeof RadixToggleGroup.Root>, ToggleGroupProps>(
  function ToggleGroup({ size = 'md', variant = 'ghost', attached, className, ...rest }, ref) {
    const contextValue = useMemo<ToggleContextValue>(() => ({ size, variant }), [size, variant]);

    return (
      <ToggleContext.Provider value={contextValue}>
        <RadixToggleGroup.Root
          ref={ref}
          className={cn(toggleGroupRoot, attached ? toggleGroupAttached : undefined, className)}
          {...(rest as ComponentPropsWithoutRef<typeof RadixToggleGroup.Root>)}
        />
      </ToggleContext.Provider>
    );
  },
);

/**
 * Props for the {@link ToggleGroupItem} component.
 */
export interface ToggleGroupItemProps
  extends ComponentPropsWithoutRef<typeof RadixToggleGroup.Item> {
  /**
   * Pixel scale override for this item. Falls back to the group's size.
   * @default "md"
   */
  size?: ToggleSize;
  /**
   * Visual style override for this item. Falls back to the group's variant.
   * @default "ghost"
   */
  variant?: ToggleVariant;
}

/**
 * Individual selectable child of a {@link ToggleGroup}. Provide a `value`
 * matching the group's selection contract. Items inherit size and variant
 * from the parent group unless explicitly overridden.
 */
export const ToggleGroupItem = forwardRef<
  ElementRef<typeof RadixToggleGroup.Item>,
  ToggleGroupItemProps
>(function ToggleGroupItem({ size, variant, className, ...rest }, ref) {
  const resolvedSize = size ?? 'md';
  const resolvedVariant = variant ?? 'ghost';
  return (
    <RadixToggleGroup.Item
      ref={ref}
      className={cn(toggleRoot, toggleSize[resolvedSize], variantClass[resolvedVariant], className)}
      {...rest}
    />
  );
});
