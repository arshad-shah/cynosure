import * as RadixPopover from '@radix-ui/react-popover';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { popoverArrow, popoverContent } from '../shared/popover.css.js';

/**
 * Trigger-anchored floating surface. Backed by `@radix-ui/react-popover`:
 * collision-aware positioning, focus moves inside on open, focus returns to
 * the trigger on close, `Escape` and outside-click dismiss by default. Use
 * for rich, interactive content (forms, filter panels, color pickers).
 * For passive, hover-revealed content use `HoverCard`; for short labels
 * use `Tooltip`.
 */
export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;
export const PopoverPortal = RadixPopover.Portal;

/**
 * Props for the popover floating surface. Layers a portal target on top of
 * the Radix Popover content primitive.
 */
export interface PopoverContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixPopover.Content>, 'asChild'> {
  /** Portal target — forwarded to Radix's `Portal`. */
  container?: HTMLElement | (() => HTMLElement);
  /** Popover body. */
  children?: ReactNode;
}

/**
 * Floating popover surface. Portals into the document and positions
 * relative to the trigger with collision detection. Forwards `sideOffset`
 * (default `8`), `align` (default `"center"`), `side` (default `"bottom"`),
 * and `collisionPadding` (default `8`) to Radix.
 */
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
        data-cynosure-overlay=""
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

/**
 * Props for the optional caret arrow pointing at the trigger. Forwards
 * `width` (default `12`) and `height` (default `6`) to Radix's `Arrow`.
 */
export interface PopoverArrowProps extends ComponentPropsWithoutRef<typeof RadixPopover.Arrow> {}

/**
 * Optional caret pointing at the trigger. Defaults to a 12x6 SVG wedge;
 * pass `width`/`height` to resize.
 */
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
