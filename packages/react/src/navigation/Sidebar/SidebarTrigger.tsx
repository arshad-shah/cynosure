// packages/react/src/navigation/Sidebar/SidebarTrigger.tsx
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { sidebarTriggerButton } from './Sidebar.css.js';
import { useSidebar } from './context.js';

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: ReactNode;
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, label, icon, onClick, type, ...rest }, ref) {
    const ctx = useSidebar();
    const defaultLabel = ctx.isMobile
      ? ctx.mobileOpen
        ? 'Close sidebar'
        : 'Open sidebar'
      : ctx.collapsed
        ? 'Expand sidebar'
        : 'Collapse sidebar';

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

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        aria-label={label ?? defaultLabel}
        aria-pressed={ctx.isMobile ? ctx.mobileOpen : !ctx.collapsed}
        aria-expanded={ctx.isMobile ? ctx.mobileOpen : !ctx.collapsed}
        className={cn(sidebarTriggerButton, className)}
        onClick={handleClick}
        {...rest}
      >
        {icon ?? defaultIcon}
      </button>
    );
  },
);
