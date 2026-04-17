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

export type ToggleGroupProps = (RadixSingle | RadixMulti) & {
  size?: ToggleSize;
  variant?: ToggleVariant;
  /** Render children in an attached pill-bar layout with shared borders. */
  attached?: boolean;
};

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

export interface ToggleGroupItemProps
  extends ComponentPropsWithoutRef<typeof RadixToggleGroup.Item> {
  size?: ToggleSize;
  variant?: ToggleVariant;
}

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
