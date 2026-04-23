import { ChevronRight } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, forwardRef, useId, useState } from 'react';
import { cn } from '../../utils/cn.js';
import {
  sidebarGroup,
  sidebarGroupBody,
  sidebarGroupCaret,
  sidebarGroupCollapsedDivider,
  sidebarGroupLabel,
  sidebarGroupLabelRow,
  sidebarGroupToggle,
  sidebarNav,
} from './Sidebar.css.js';
import { useRovingFocus } from './useRovingFocus.js';

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  'aria-label'?: string;
}

export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(function SidebarNav(
  { className, 'aria-label': ariaLabel, children, ...rest },
  ref,
) {
  const { containerRef } = useRovingFocus<HTMLElement>();
  return (
    <nav
      ref={(node) => {
        (containerRef as { current: HTMLElement | null }).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as { current: HTMLElement | null }).current = node;
      }}
      aria-label={ariaLabel}
      className={cn(sidebarNav, className)}
      {...rest}
    >
      {children}
    </nav>
  );
});

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trailing slot beside the group label (e.g. a "+" button). */
  action?: ReactNode;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  {
    label,
    collapsible = false,
    defaultOpen = true,
    open: openProp,
    onOpenChange,
    action,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? Boolean(openProp) : internalOpen;
  const bodyId = useId();

  const toggle = () => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div ref={ref} className={cn(sidebarGroup, className)} {...rest}>
      {label !== undefined ? (
        <div className={sidebarGroupLabelRow}>
          <span className={sidebarGroupLabel}>{label}</span>
          {action}
          {collapsible ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={toggle}
              className={sidebarGroupToggle}
            >
              <ChevronRight
                size={14}
                data-open={open ? 'true' : 'false'}
                className={sidebarGroupCaret}
              />
            </button>
          ) : null}
        </div>
      ) : null}
      <div aria-hidden="true" className={sidebarGroupCollapsedDivider} />
      <div id={bodyId} data-open={open ? 'true' : 'false'} className={sidebarGroupBody}>
        {children}
      </div>
    </div>
  );
});
