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

export interface ToggleProps extends ComponentPropsWithoutRef<typeof RadixToggle.Root> {
  size?: ToggleSize;
  variant?: ToggleVariant;
}

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
