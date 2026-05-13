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

/**
 * Props for the `<nav>` element inside the sidebar that hosts roving-focus
 * navigation across its `SidebarItem` descendants.
 */
export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  /**
   * Accessible label for the `<nav>` element. Required when the page has
   * more than one navigation region (e.g. sidebar + breadcrumb).
   */
  'aria-label'?: string;
}

/**
 * `<nav>` wrapper that wires up roving-tab-index focus across its
 * descendants — `Tab` enters the region once, `↑`/`↓` move between items.
 */
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

/**
 * Props for a grouping of `SidebarItem`s under an optional collapsible
 * label.
 */
export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Visible group heading. */
  label?: ReactNode;
  /**
   * Render a caret + toggle that show/hide the group's body.
   * @default false
   */
  collapsible?: boolean;
  /**
   * Initial open state when `collapsible` is `true` and uncontrolled.
   * @default true
   */
  defaultOpen?: boolean;
  /** Controlled open state when `collapsible` is `true`. */
  open?: boolean;
  /** Change handler for the controlled open state. */
  onOpenChange?: (open: boolean) => void;
  /** Trailing slot beside the group label (e.g. a "+" action button). */
  action?: ReactNode;
}

/**
 * Grouping of related `SidebarItem`s under an optional collapsible label.
 * `aria-expanded` / `aria-controls` are wired automatically between the
 * toggle button and the body so screen readers track the collapse state.
 */
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
