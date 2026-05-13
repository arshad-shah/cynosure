import * as RadixHoverCard from '@radix-ui/react-hover-card';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { popoverArrow, popoverContent } from '../shared/popover.css.js';

/**
 * Hover-revealed rich preview. Backed by `@radix-ui/react-hover-card` —
 * opens on pointer-enter with a configurable open delay (set via `Root`'s
 * `openDelay`/`closeDelay`), positions with collision detection, and stays
 * open while the pointer is inside the trigger or content. Not a
 * keyboard-equivalent affordance — for keyboard users it opens on focus
 * but is purely informational, so don't put primary actions inside it.
 */
export const HoverCard = RadixHoverCard.Root;
export const HoverCardTrigger = RadixHoverCard.Trigger;
export const HoverCardPortal = RadixHoverCard.Portal;

/**
 * Props for the hover-card floating surface. Layers a portal target on top
 * of Radix's HoverCard content primitive.
 */
export interface HoverCardContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixHoverCard.Content>, 'asChild'> {
  /** Portal target — forwarded to Radix's `Portal`. */
  container?: HTMLElement | (() => HTMLElement);
  /** Card body. */
  children?: ReactNode;
}

/**
 * Floating hover-card surface. Portals into the document and positions
 * relative to the trigger with collision detection. Defaults to bottom
 * placement with a small offset so the arrow + content sit clear of the
 * trigger.
 *
 * Forwards `sideOffset` (default `8`), `align` (default `"center"`), `side`
 * (default `"bottom"`), and `collisionPadding` (default `8`) to Radix —
 * override per-instance to fine-tune placement.
 */
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

/**
 * Optional caret pointing at the trigger. Defaults to a 12x6 SVG wedge;
 * pass `width`/`height` to resize.
 */
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
