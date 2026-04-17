import * as Radix from '@radix-ui/react-context-menu';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  menuContent,
  menuIndicator,
  menuItem,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubChevron,
} from '../shared/menu.css.js';

/**
 * Right-click-triggered menu. Shares the same CSS recipe as DropdownMenu;
 * the only behavioural difference is the trigger event (contextmenu).
 */
export const ContextMenu = Radix.Root;
export const ContextMenuTrigger = Radix.Trigger;
export const ContextMenuPortal = Radix.Portal;
export const ContextMenuGroup = Radix.Group;
export const ContextMenuSub = Radix.Sub;
export const ContextMenuRadioGroup = Radix.RadioGroup;

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const RadioDot = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
    <circle cx="4" cy="4" r="3" />
  </svg>
);
const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface ContextMenuContentProps
  extends Omit<ComponentPropsWithoutRef<typeof Radix.Content>, 'asChild'> {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}

export const ContextMenuContent = forwardRef<
  ElementRef<typeof Radix.Content>,
  ContextMenuContentProps
>(function ContextMenuContent(
  { className, collisionPadding = 8, container, children, ...rest },
  ref,
) {
  const resolvedContainer = typeof container === 'function' ? container() : container;
  return (
    <Radix.Portal container={resolvedContainer}>
      <Radix.Content
        ref={ref}
        data-lumen-overlay=""
        collisionPadding={collisionPadding}
        className={cn(menuContent, className)}
        {...rest}
      >
        {children}
      </Radix.Content>
    </Radix.Portal>
  );
});

export const ContextMenuItem = forwardRef<
  ElementRef<typeof Radix.Item>,
  ComponentPropsWithoutRef<typeof Radix.Item>
>(function ContextMenuItem({ className, ...rest }, ref) {
  return <Radix.Item ref={ref} className={cn(menuItem, className)} {...rest} />;
});

export const ContextMenuCheckboxItem = forwardRef<
  ElementRef<typeof Radix.CheckboxItem>,
  ComponentPropsWithoutRef<typeof Radix.CheckboxItem>
>(function ContextMenuCheckboxItem({ className, children, ...rest }, ref) {
  return (
    <Radix.CheckboxItem ref={ref} className={cn(menuItem, className)} {...rest}>
      <Radix.ItemIndicator className={menuIndicator}>
        <CheckIcon />
      </Radix.ItemIndicator>
      {children}
    </Radix.CheckboxItem>
  );
});

export const ContextMenuRadioItem = forwardRef<
  ElementRef<typeof Radix.RadioItem>,
  ComponentPropsWithoutRef<typeof Radix.RadioItem>
>(function ContextMenuRadioItem({ className, children, ...rest }, ref) {
  return (
    <Radix.RadioItem ref={ref} className={cn(menuItem, className)} {...rest}>
      <Radix.ItemIndicator className={menuIndicator}>
        <RadioDot />
      </Radix.ItemIndicator>
      {children}
    </Radix.RadioItem>
  );
});

export const ContextMenuLabel = forwardRef<
  ElementRef<typeof Radix.Label>,
  ComponentPropsWithoutRef<typeof Radix.Label>
>(function ContextMenuLabel({ className, ...rest }, ref) {
  return <Radix.Label ref={ref} className={cn(menuLabel, className)} {...rest} />;
});

export const ContextMenuSeparator = forwardRef<
  ElementRef<typeof Radix.Separator>,
  ComponentPropsWithoutRef<typeof Radix.Separator>
>(function ContextMenuSeparator({ className, ...rest }, ref) {
  return <Radix.Separator ref={ref} className={cn(menuSeparator, className)} {...rest} />;
});

export const ContextMenuSubTrigger = forwardRef<
  ElementRef<typeof Radix.SubTrigger>,
  ComponentPropsWithoutRef<typeof Radix.SubTrigger>
>(function ContextMenuSubTrigger({ className, children, ...rest }, ref) {
  return (
    <Radix.SubTrigger ref={ref} className={cn(menuItem, className)} {...rest}>
      {children}
      <span className={menuSubChevron} aria-hidden="true">
        <ChevronRight />
      </span>
    </Radix.SubTrigger>
  );
});

export const ContextMenuSubContent = forwardRef<
  ElementRef<typeof Radix.SubContent>,
  ComponentPropsWithoutRef<typeof Radix.SubContent>
>(function ContextMenuSubContent({ className, ...rest }, ref) {
  return (
    <Radix.Portal>
      <Radix.SubContent
        ref={ref}
        data-lumen-overlay=""
        className={cn(menuContent, className)}
        {...rest}
      />
    </Radix.Portal>
  );
});

export const ContextMenuShortcut = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function ContextMenuShortcut({ className, ...rest }, ref) {
    return <span ref={ref} className={cn(menuShortcut, className)} {...rest} />;
  },
);
