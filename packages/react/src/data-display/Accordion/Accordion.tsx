import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  accordionChevron,
  accordionContent,
  accordionContentInner,
  accordionHeader,
  accordionItem,
  accordionRoot,
  accordionSize,
  accordionTrigger,
} from './Accordion.css.js';

export type AccordionVariant = 'default' | 'contained' | 'ghost';
export type AccordionSize = 'sm' | 'md' | 'lg';

type RadixSingle = ComponentPropsWithoutRef<typeof RadixAccordion.Root> & { type: 'single' };
type RadixMulti = ComponentPropsWithoutRef<typeof RadixAccordion.Root> & { type: 'multiple' };

/** Props for the {@link Accordion} root, extending Radix UI's Accordion.Root in either `single` or `multiple` mode. */
export type AccordionProps = (RadixSingle | RadixMulti) & {
  /**
   * Visual treatment. `default` shows divider lines, `contained` renders each
   * item as a separate bordered card, `ghost` removes all chrome.
   * @default "default"
   */
  variant?: AccordionVariant;
  /**
   * Controls trigger padding, font size, and chevron size.
   * @default "md"
   */
  size?: AccordionSize;
};

/**
 * Accordion is a vertically stacked set of headers that each reveal a panel.
 * Wraps Radix UI's accordion primitive, adding cynosure variants and sizing.
 * Use `type="single"` for one-open-at-a-time behaviour or `type="multiple"`
 * to allow independent panels. Keyboard navigation (Up/Down/Home/End) and
 * `aria-expanded` state are handled by Radix.
 */
export const Accordion = forwardRef<ElementRef<typeof RadixAccordion.Root>, AccordionProps>(
  function Accordion({ variant = 'default', size = 'md', className, ...rest }, ref) {
    return (
      <RadixAccordion.Root
        ref={ref}
        data-variant={variant}
        className={cn(accordionRoot, accordionSize[size], className)}
        {...(rest as ComponentPropsWithoutRef<typeof RadixAccordion.Root>)}
      />
    );
  },
);

/** Props for a single collapsible row inside the {@link Accordion}. Inherits Radix `value`, `disabled`, etc. */
export interface AccordionItemProps extends ComponentPropsWithoutRef<typeof RadixAccordion.Item> {}

/**
 * One collapsible row in the {@link Accordion}. Must be a direct child of the
 * root and supply a unique `value`. Renders the visual divider between items.
 */
export const AccordionItem = forwardRef<ElementRef<typeof RadixAccordion.Item>, AccordionItemProps>(
  function AccordionItem({ className, ...rest }, ref) {
    return <RadixAccordion.Item ref={ref} className={cn(accordionItem, className)} {...rest} />;
  },
);

/** Props for the clickable header that toggles an {@link AccordionItem}. */
export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> {
  /**
   * Hide the built-in chevron indicator. Useful when supplying a custom
   * indicator via `children`.
   * @default false
   */
  hideIndicator?: boolean;
}

/**
 * The clickable header that opens or closes its sibling
 * {@link AccordionContent}. Renders a chevron indicator that rotates on
 * expand; pair with `hideIndicator` to provide a custom one.
 */
export const AccordionTrigger = forwardRef<
  ElementRef<typeof RadixAccordion.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ className, children, hideIndicator, ...rest }, ref) {
  return (
    <RadixAccordion.Header className={accordionHeader}>
      <RadixAccordion.Trigger ref={ref} className={cn(accordionTrigger, className)} {...rest}>
        <span>{children}</span>
        {!hideIndicator ? <ChevronDownIcon className={accordionChevron} /> : null}
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
});

/** Props for the expanding panel revealed by an {@link AccordionTrigger}. */
export interface AccordionContentProps
  extends ComponentPropsWithoutRef<typeof RadixAccordion.Content> {}

/**
 * The expandable panel beneath an {@link AccordionTrigger}. Animates open/close
 * via CSS using the `--radix-accordion-content-height` variable Radix exposes.
 */
export const AccordionContent = forwardRef<
  ElementRef<typeof RadixAccordion.Content>,
  AccordionContentProps
>(function AccordionContent({ className, children, ...rest }, ref) {
  return (
    <RadixAccordion.Content ref={ref} className={cn(accordionContent, className)} {...rest}>
      <div className={accordionContentInner}>{children}</div>
    </RadixAccordion.Content>
  );
});
