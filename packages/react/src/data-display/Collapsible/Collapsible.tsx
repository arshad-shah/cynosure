import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { collapsibleContent, collapsibleRoot } from './Collapsible.css.js';

export interface CollapsibleProps extends ComponentPropsWithoutRef<typeof RadixCollapsible.Root> {}

export const Collapsible = forwardRef<ElementRef<typeof RadixCollapsible.Root>, CollapsibleProps>(
  function Collapsible({ className, ...rest }, ref) {
    return <RadixCollapsible.Root ref={ref} className={cn(collapsibleRoot, className)} {...rest} />;
  },
);

export const CollapsibleTrigger = RadixCollapsible.Trigger;

export interface CollapsibleContentProps
  extends ComponentPropsWithoutRef<typeof RadixCollapsible.Content> {}

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
