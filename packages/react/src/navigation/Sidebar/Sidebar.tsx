// packages/react/src/navigation/Sidebar/Sidebar.tsx
import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '../../overlay/Drawer/Drawer.js';
import { TooltipProvider } from '../../overlay/Tooltip/Tooltip.js';
import { cn } from '../../utils/cn.js';
import { sidebarRoot, sidebarVariant } from './Sidebar.css.js';
import { SidebarContext, type SidebarContextValue } from './context.js';
import { useIsMobile } from './useIsMobile.js';

export interface SidebarProviderProps {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  defaultMobileOpen?: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (value: boolean) => void;
  mobileQuery?: string;
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'icon' | 'offcanvas' | 'none';
  children?: ReactNode;
}

export function SidebarProvider({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  defaultMobileOpen = false,
  mobileOpen: mobileOpenProp,
  onMobileOpenChange,
  mobileQuery = '(max-width: 47.99em)',
  side = 'left',
  variant = 'sidebar',
  collapsible = 'icon',
  children,
}: SidebarProviderProps): ReactElement {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalMobileOpen, setInternalMobileOpen] = useState(defaultMobileOpen);

  const collapsed = collapsedProp ?? internalCollapsed;
  const mobileOpen = mobileOpenProp ?? internalMobileOpen;

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (collapsedProp === undefined) setInternalCollapsed(value);
      onCollapsedChange?.(value);
    },
    [collapsedProp, onCollapsedChange],
  );
  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);
  const setMobileOpen = useCallback(
    (value: boolean) => {
      if (mobileOpenProp === undefined) setInternalMobileOpen(value);
      onMobileOpenChange?.(value);
    },
    [mobileOpenProp, onMobileOpenChange],
  );

  const isMobile = useIsMobile(mobileQuery);
  const isCollapsedIconRail = !isMobile && collapsed && collapsible === 'icon';

  const ctx = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      isMobile,
      mobileOpen,
      setMobileOpen,
      side,
      variant,
      collapsible,
      isCollapsedIconRail,
    }),
    [
      collapsed,
      setCollapsed,
      toggleCollapsed,
      isMobile,
      mobileOpen,
      setMobileOpen,
      side,
      variant,
      collapsible,
      isCollapsedIconRail,
    ],
  );

  return (
    <SidebarContext.Provider value={ctx}>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  side?: 'left' | 'right';
  mobileTitle?: ReactNode;
  mobileDescription?: ReactNode;
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
} as const;

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { className, children, side: sideProp, mobileTitle = 'Sidebar', mobileDescription, ...rest },
  ref,
) {
  const ctx = useSidebarInternal();
  const side = sideProp ?? ctx.side;

  if (ctx.isMobile) {
    return (
      <Drawer open={ctx.mobileOpen} onOpenChange={ctx.setMobileOpen}>
        <DrawerContent side={side} showCloseButton>
          <DrawerTitle style={visuallyHidden}>{mobileTitle}</DrawerTitle>
          {mobileDescription ? (
            <DrawerDescription style={visuallyHidden}>{mobileDescription}</DrawerDescription>
          ) : null}
          <aside
            ref={ref}
            data-side={side}
            data-collapsible="none"
            data-collapsed="false"
            className={cn(sidebarRoot, sidebarVariant[ctx.variant], className)}
            {...rest}
          >
            {children}
          </aside>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <aside
      ref={ref}
      data-side={side}
      data-variant={ctx.variant}
      data-collapsed={ctx.collapsed ? 'true' : 'false'}
      data-collapsible={ctx.collapsible}
      className={cn(sidebarRoot, sidebarVariant[ctx.variant], className)}
      {...rest}
    >
      {children}
    </aside>
  );
});

// Re-export for consumers
export { useSidebar } from './context.js';
export type { SidebarContextValue } from './context.js';

// Internal wrapper so the Sidebar component uses the same hook
import { useSidebar as useSidebarInternal } from './context.js';
