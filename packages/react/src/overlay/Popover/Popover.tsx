import * as RadixPopover from '@radix-ui/react-popover';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { popoverArrow, popoverContent } from '../shared/popover.css.js';

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;
export const PopoverPortal = RadixPopover.Portal;

export interface PopoverContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixPopover.Content>, 'asChild'> {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}

export const PopoverContent = forwardRef<
  ElementRef<typeof RadixPopover.Content>,
  PopoverContentProps
>(function PopoverContent(
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
    <RadixPopover.Portal container={resolvedContainer}>
      <RadixPopover.Content
        ref={ref}
        data-lumen-overlay=""
        sideOffset={sideOffset}
        align={align}
        side={side}
        collisionPadding={collisionPadding}
        className={cn(popoverContent, className)}
        {...rest}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
});

export interface PopoverArrowProps extends ComponentPropsWithoutRef<typeof RadixPopover.Arrow> {}

export const PopoverArrow = forwardRef<ElementRef<typeof RadixPopover.Arrow>, PopoverArrowProps>(
  function PopoverArrow({ className, width = 12, height = 6, ...rest }, ref) {
    return (
      <RadixPopover.Arrow
        ref={ref}
        width={width}
        height={height}
        className={cn(popoverArrow, className)}
        {...rest}
      />
    );
  },
);
