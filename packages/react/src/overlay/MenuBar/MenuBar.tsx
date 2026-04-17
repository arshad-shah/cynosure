import * as Radix from '@radix-ui/react-menubar';
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
  menubarRoot,
  menubarTrigger,
} from '../shared/menu.css.js';

/**
 * Application-style menu bar. Keyboard: arrow ←/→ moves between top-level
 * menus, ↓ opens, Esc closes. All semantics come from Radix; we only paint.
 */
// Re-export Radix's compound parts. Explicit type annotations keep TypeScript
// from inlining a non-portable path to the internal `react-context` module.
export const MenuBarMenu: typeof Radix.Menu = Radix.Menu;
export const MenuBarPortal: typeof Radix.Portal = Radix.Portal;
export const MenuBarGroup: typeof Radix.Group = Radix.Group;
export const MenuBarSub: typeof Radix.Sub = Radix.Sub;
export const MenuBarRadioGroup: typeof Radix.RadioGroup = Radix.RadioGroup;

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

export const MenuBar = forwardRef<
  ElementRef<typeof Radix.Root>,
  ComponentPropsWithoutRef<typeof Radix.Root>
>(function MenuBar({ className, ...rest }, ref) {
  return <Radix.Root ref={ref} className={cn(menubarRoot, className)} {...rest} />;
});

export const MenuBarTrigger = forwardRef<
  ElementRef<typeof Radix.Trigger>,
  ComponentPropsWithoutRef<typeof Radix.Trigger>
>(function MenuBarTrigger({ className, ...rest }, ref) {
  return <Radix.Trigger ref={ref} className={cn(menubarTrigger, className)} {...rest} />;
});

export interface MenuBarContentProps
  extends Omit<ComponentPropsWithoutRef<typeof Radix.Content>, 'asChild'> {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}

export const MenuBarContent = forwardRef<ElementRef<typeof Radix.Content>, MenuBarContentProps>(
  function MenuBarContent(
    { className, align = 'start', sideOffset = 6, container, children, ...rest },
    ref,
  ) {
    const resolvedContainer = typeof container === 'function' ? container() : container;
    return (
      <Radix.Portal container={resolvedContainer}>
        <Radix.Content
          ref={ref}
          data-lumen-overlay=""
          align={align}
          sideOffset={sideOffset}
          className={cn(menuContent, className)}
          {...rest}
        >
          {children}
        </Radix.Content>
      </Radix.Portal>
    );
  },
);

export const MenuBarItem = forwardRef<
  ElementRef<typeof Radix.Item>,
  ComponentPropsWithoutRef<typeof Radix.Item>
>(function MenuBarItem({ className, ...rest }, ref) {
  return <Radix.Item ref={ref} className={cn(menuItem, className)} {...rest} />;
});

export const MenuBarCheckboxItem = forwardRef<
  ElementRef<typeof Radix.CheckboxItem>,
  ComponentPropsWithoutRef<typeof Radix.CheckboxItem>
>(function MenuBarCheckboxItem({ className, children, ...rest }, ref) {
  return (
    <Radix.CheckboxItem ref={ref} className={cn(menuItem, className)} {...rest}>
      <Radix.ItemIndicator className={menuIndicator}>
        <CheckIcon />
      </Radix.ItemIndicator>
      {children}
    </Radix.CheckboxItem>
  );
});

export const MenuBarRadioItem = forwardRef<
  ElementRef<typeof Radix.RadioItem>,
  ComponentPropsWithoutRef<typeof Radix.RadioItem>
>(function MenuBarRadioItem({ className, children, ...rest }, ref) {
  return (
    <Radix.RadioItem ref={ref} className={cn(menuItem, className)} {...rest}>
      <Radix.ItemIndicator className={menuIndicator}>
        <RadioDot />
      </Radix.ItemIndicator>
      {children}
    </Radix.RadioItem>
  );
});

export const MenuBarLabel = forwardRef<
  ElementRef<typeof Radix.Label>,
  ComponentPropsWithoutRef<typeof Radix.Label>
>(function MenuBarLabel({ className, ...rest }, ref) {
  return <Radix.Label ref={ref} className={cn(menuLabel, className)} {...rest} />;
});

export const MenuBarSeparator = forwardRef<
  ElementRef<typeof Radix.Separator>,
  ComponentPropsWithoutRef<typeof Radix.Separator>
>(function MenuBarSeparator({ className, ...rest }, ref) {
  return <Radix.Separator ref={ref} className={cn(menuSeparator, className)} {...rest} />;
});

export const MenuBarSubTrigger = forwardRef<
  ElementRef<typeof Radix.SubTrigger>,
  ComponentPropsWithoutRef<typeof Radix.SubTrigger>
>(function MenuBarSubTrigger({ className, children, ...rest }, ref) {
  return (
    <Radix.SubTrigger ref={ref} className={cn(menuItem, className)} {...rest}>
      {children}
      <span className={menuSubChevron} aria-hidden="true">
        <ChevronRight />
      </span>
    </Radix.SubTrigger>
  );
});

export const MenuBarSubContent = forwardRef<
  ElementRef<typeof Radix.SubContent>,
  ComponentPropsWithoutRef<typeof Radix.SubContent>
>(function MenuBarSubContent({ className, ...rest }, ref) {
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

export const MenuBarShortcut = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function MenuBarShortcut({ className, ...rest }, ref) {
    return <span ref={ref} className={cn(menuShortcut, className)} {...rest} />;
  },
);
