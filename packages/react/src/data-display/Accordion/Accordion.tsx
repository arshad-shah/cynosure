import * as RadixAccordion from '@radix-ui/react-accordion';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
  forwardRef,
} from 'react';
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

export type AccordionProps = (RadixSingle | RadixMulti) & {
  variant?: AccordionVariant;
  size?: AccordionSize;
};

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

export interface AccordionItemProps extends ComponentPropsWithoutRef<typeof RadixAccordion.Item> {}
export const AccordionItem = forwardRef<ElementRef<typeof RadixAccordion.Item>, AccordionItemProps>(
  function AccordionItem({ className, ...rest }, ref) {
    return <RadixAccordion.Item ref={ref} className={cn(accordionItem, className)} {...rest} />;
  },
);

const ChevronIcon = (): ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    data-slot="chevron"
    className={accordionChevron}
  >
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> {
  /** Hide the built-in chevron indicator. */
  hideIndicator?: boolean;
}

export const AccordionTrigger = forwardRef<
  ElementRef<typeof RadixAccordion.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ className, children, hideIndicator, ...rest }, ref) {
  return (
    <RadixAccordion.Header className={accordionHeader}>
      <RadixAccordion.Trigger ref={ref} className={cn(accordionTrigger, className)} {...rest}>
        <span>{children}</span>
        {!hideIndicator ? <ChevronIcon /> : null}
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  );
});

export interface AccordionContentProps
  extends ComponentPropsWithoutRef<typeof RadixAccordion.Content> {}

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
