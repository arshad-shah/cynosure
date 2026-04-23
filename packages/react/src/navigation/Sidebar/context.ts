import { createContext, useContext } from 'react';

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  side: 'left' | 'right';
  variant: 'sidebar' | 'floating' | 'inset';
  collapsible: 'icon' | 'offcanvas' | 'none';
  /** True when the sidebar is visible, collapsed, and in icon-rail mode. */
  isCollapsedIconRail: boolean;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('Sidebar hooks must be used inside <SidebarProvider>');
  return ctx;
}
