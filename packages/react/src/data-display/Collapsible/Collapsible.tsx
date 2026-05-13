import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { collapsibleContent, collapsibleRoot } from './Collapsible.css.js';

/** Props for the {@link Collapsible} root. Inherits Radix `open` / `defaultOpen` / `onOpenChange`. */
export interface CollapsibleProps extends ComponentPropsWithoutRef<typeof RadixCollapsible.Root> {}

/**
 * Collapsible is a single show/hide disclosure widget. Wraps Radix UI's
 * Collapsible.Root and pairs with {@link CollapsibleTrigger} (any focusable
 * button) and {@link CollapsibleContent}. State is managed by Radix and
 * exposed via `data-state="open|closed"` for styling.
 */
export const Collapsible = forwardRef<ElementRef<typeof RadixCollapsible.Root>, CollapsibleProps>(
  function Collapsible({ className, ...rest }, ref) {
    return <RadixCollapsible.Root ref={ref} className={cn(collapsibleRoot, className)} {...rest} />;
  },
);

/** Re-export of Radix Collapsible.Trigger — the button that toggles the disclosure. */
export const CollapsibleTrigger = RadixCollapsible.Trigger;

/** Props for the {@link CollapsibleContent} animated panel. */
export interface CollapsibleContentProps
  extends ComponentPropsWithoutRef<typeof RadixCollapsible.Content> {}

/**
 * The expanding panel revealed by a {@link CollapsibleTrigger}. Animates via
 * the `--radix-collapsible-content-height` CSS variable Radix exposes.
 */
export const CollapsibleContent = forwardRef<
  ElementRef<typeof RadixCollapsible.Content>,
  CollapsibleContentProps
>(function CollapsibleContent({ className, ...rest }, ref) {
  return (
    <RadixCollapsible.Content ref={ref} className={cn(collapsibleContent, className)} {...rest} />
  );
});

/** Disclosure — semantic alias of Collapsible. */
export const Disclosure = Collapsible;
export const DisclosureTrigger = CollapsibleTrigger;
export const DisclosureContent = CollapsibleContent;
