import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useState,
} from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../overlay/Popover/Popover.js';
import { Slot } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import {
  sidebarSubItem,
  sidebarSubNavFlyout,
  sidebarSubNavFlyoutHeader,
  sidebarSubNavInline,
} from './Sidebar.css.js';
import { useSidebar } from './context.js';

/**
 * Props for the nested-items group beneath a `SidebarItem`.
 */
export interface SidebarSubNavProps {
  /**
   * Parent label shown as the flyout header when the sidebar is collapsed
   * to an icon-only rail.
   */
  parentLabel?: ReactNode;
  /**
   * Initial open state in uncontrolled mode.
   * @default false
   */
  defaultOpen?: boolean;
  /** Controlled open state; pair with `onOpenChange`. */
  open?: boolean;
  /** Change handler for the controlled open state. */
  onOpenChange?: (open: boolean) => void;
  /** Sub-items — typically `SidebarSubItem`s. */
  children?: ReactNode;
  /**
   * Trigger element (usually the parent `SidebarItem`). Required for the
   * collapsed-rail flyout mode; in expanded mode the trigger is rendered
   * inline before the inline sub-list.
   */
  trigger?: ReactNode;
  className?: string;
}

/**
 * Nested navigation group under a `SidebarItem`. In expanded mode the
 * sub-items render inline; in collapsed-rail mode they switch to a flyout
 * `Popover` so the icon-only rail stays narrow. Focus and dismissal in
 * flyout mode come from the underlying Radix `Popover` primitive.
 */
export const SidebarSubNav = forwardRef<HTMLDivElement, SidebarSubNavProps>(function SidebarSubNav(
  { parentLabel, defaultOpen = false, open: openProp, onOpenChange, children, trigger, className },
  ref,
) {
  const ctx = useSidebar();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  if (ctx.isCollapsedIconRail && trigger) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          side={ctx.side === 'right' ? 'left' : 'right'}
          align="start"
          sideOffset={4}
          className={cn(sidebarSubNavFlyout, className)}
        >
          {parentLabel ? <div className={sidebarSubNavFlyoutHeader}>{parentLabel}</div> : null}
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      {trigger}
      <div
        ref={ref}
        data-open={open ? 'true' : 'false'}
        className={cn(sidebarSubNavInline, className)}
      >
        {children}
      </div>
    </>
  );
});

/**
 * Polymorphic prop bag for `SidebarSubItem` — combines a small set of
 * component-specific props with the underlying button + anchor attributes.
 */
type SubItemProps = {
  /**
   * Mark the item as the current page. Sets `aria-current="page"` plus a
   * `data-active="true"` styling hook.
   * @default false
   */
  isActive?: boolean;
  /**
   * Disable interaction. Sets `aria-disabled`; for the `<button>` variant
   * also applies the native `disabled` attribute.
   * @default false
   */
  disabled?: boolean;
  /**
   * Project the item chrome onto a consumer element (e.g. a router
   * `<Link>`) via `Slot`.
   * @default false
   */
  asChild?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>;

/**
 * Single entry inside a `SidebarSubNav` — typically renders a deeper-level
 * page link. Participates in the same roving-focus group as top-level
 * `SidebarItem`s.
 */
export const SidebarSubItem = forwardRef<HTMLElement, SubItemProps>(function SidebarSubItem(
  { isActive, disabled, asChild, className, children, ...rest },
  ref,
) {
  const Comp: typeof Slot | 'button' = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref as never}
      data-roving-focus-item=""
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(sidebarSubItem, className)}
      {...(Comp === 'button'
        ? { type: 'button' as const, disabled }
        : { 'aria-disabled': disabled })}
      {...rest}
    >
      {children}
    </Comp>
  );
});
