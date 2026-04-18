import * as RadixHoverCard from '@radix-ui/react-hover-card';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { popoverArrow, popoverContent } from '../shared/popover.css.js';

export const HoverCard = RadixHoverCard.Root;
export const HoverCardTrigger = RadixHoverCard.Trigger;
export const HoverCardPortal = RadixHoverCard.Portal;

export interface HoverCardContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixHoverCard.Content>, 'asChild'> {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}

export const HoverCardContent = forwardRef<
  ElementRef<typeof RadixHoverCard.Content>,
  HoverCardContentProps
>(function HoverCardContent(
  {
    className,
    sideOffset = 8,
    align = 'center',
    side = 'bottom',
    collisionPadding = 8,
    container,
    children,
    ...rest
  },
  ref,
) {
  const resolvedContainer = typeof container === 'function' ? container() : container;
  return (
    <RadixHoverCard.Portal container={resolvedContainer}>
      <RadixHoverCard.Content
        ref={ref}
        data-cynosure-overlay=""
        sideOffset={sideOffset}
        align={align}
        side={side}
        collisionPadding={collisionPadding}
        className={cn(popoverContent, className)}
        {...rest}
      >
        {children}
      </RadixHoverCard.Content>
    </RadixHoverCard.Portal>
  );
});

export const HoverCardArrow = forwardRef<
  ElementRef<typeof RadixHoverCard.Arrow>,
  ComponentPropsWithoutRef<typeof RadixHoverCard.Arrow>
>(function HoverCardArrow({ className, width = 12, height = 6, ...rest }, ref) {
  return (
    <RadixHoverCard.Arrow
      ref={ref}
      width={width}
      height={height}
      className={cn(popoverArrow, className)}
      {...rest}
    />
  );
});
