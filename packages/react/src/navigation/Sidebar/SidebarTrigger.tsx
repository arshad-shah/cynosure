import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, forwardRef } from 'react';
import { Tooltip } from '../../overlay/Tooltip/Tooltip.js';
import { cn } from '../../utils/cn.js';
import { sidebarTriggerButton, sidebarTriggerLabel } from './Sidebar.css.js';
import { useSidebar } from './context.js';

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name and visible text (hidden when collapsed to icon rail). */
  label?: string;
  icon?: ReactNode;
  /** Hide the visible text label; leave accessible name only. Default `false`. */
  hideLabel?: boolean;
}

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
