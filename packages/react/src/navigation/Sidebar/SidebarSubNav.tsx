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

export interface SidebarSubNavProps {
  /** Parent label shown as the flyout header when collapsed. */
  parentLabel?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  /** Trigger element (usually the parent `SidebarItem`). Required for flyout mode. */
  trigger?: ReactNode;
  className?: string;
}

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

type SubItemProps = {
  isActive?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>;

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
