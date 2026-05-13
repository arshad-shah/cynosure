import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, forwardRef } from 'react';
import { Tooltip } from '../../overlay/Tooltip/Tooltip.js';
import { cn } from '../../utils/cn.js';
import { sidebarTriggerButton, sidebarTriggerLabel } from './Sidebar.css.js';
import { useSidebar } from './context.js';

/**
 * Props for the button that toggles a `Sidebar` collapsed / open. Reads
 * the current mode from `SidebarProvider` so the icon + label auto-update.
 */
export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Accessible name and visible text. Defaults to a context-sensitive
   * value (`"Open"` / `"Close"` on mobile, `"Expand"` / `"Collapse"` on
   * desktop) derived from the current sidebar state.
   */
  label?: string;
  /**
   * Override the auto-selected icon. Defaults to a Lucide
   * `PanelLeftClose`/`PanelLeftOpen` pair on desktop and `Menu`/`X` on
   * mobile.
   */
  icon?: ReactNode;
  /**
   * Hide the visible text label, keeping only the accessible name on the
   * icon button.
   * @default false
   */
  hideLabel?: boolean;
}

/**
 * Button that toggles the parent `Sidebar` open/closed. On desktop it
 * collapses to / expands from the icon rail; on mobile it opens / closes
 * the Drawer. Sets `aria-pressed` and `aria-expanded` to reflect the
 * current state and auto-renders a tooltip with the label when the
 * sidebar is collapsed to an icon-only rail.
 */
export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, label, icon, hideLabel, onClick, type, ...rest }, ref) {
    const ctx = useSidebar();
    const defaultLabel = ctx.isMobile
      ? ctx.mobileOpen
        ? 'Close'
        : 'Open'
      : ctx.collapsed
        ? 'Expand'
        : 'Collapse';
    const resolvedLabel = label ?? defaultLabel;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (ctx.isMobile) ctx.setMobileOpen(!ctx.mobileOpen);
      else ctx.toggleCollapsed();
    };

    const defaultIcon = ctx.isMobile ? (
      ctx.mobileOpen ? (
        <XIcon size={18} />
      ) : (
        <MenuIcon size={18} />
      )
    ) : ctx.collapsed ? (
      <PanelLeftOpenIcon size={18} />
    ) : (
      <PanelLeftCloseIcon size={18} />
    );

    const button = (
      <button
        ref={ref}
        type={type ?? 'button'}
        aria-label={resolvedLabel}
        aria-pressed={ctx.isMobile ? ctx.mobileOpen : !ctx.collapsed}
        aria-expanded={ctx.isMobile ? ctx.mobileOpen : !ctx.collapsed}
        className={cn(sidebarTriggerButton, className)}
        onClick={handleClick}
        {...rest}
      >
        <span aria-hidden="true" style={{ display: 'inline-flex', flexShrink: 0 }}>
          {icon ?? defaultIcon}
        </span>
        {hideLabel ? null : <span className={sidebarTriggerLabel}>{resolvedLabel}</span>}
      </button>
    );

    if (ctx.isCollapsedIconRail) {
      return (
        <Tooltip
          content={resolvedLabel}
          side={ctx.side === 'right' ? 'left' : 'right'}
          delayMs={200}
        >
          {button}
        </Tooltip>
      );
    }

    return button;
  },
);
