import * as Radix from '@radix-ui/react-navigation-menu';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  navigationMenuCaret,
  navigationMenuContent,
  navigationMenuIndicator,
  navigationMenuIndicatorArrow,
  navigationMenuLink,
  navigationMenuList,
  navigationMenuRoot,
  navigationMenuTrigger,
  navigationMenuViewport,
  navigationMenuViewportWrapper,
} from './NavigationMenu.css.js';

const ChevronDown = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface NavigationMenuProps extends ComponentPropsWithoutRef<typeof Radix.Root> {}

/**
 * Horizontal top-nav pattern with rich hover-to-reveal panels. Radix
 * handles hover intent, keyboard navigation, and focus management; we
 * layer Cynosure visuals via vanilla-extract recipes.
 */
export const NavigationMenu = forwardRef<ElementRef<typeof Radix.Root>, NavigationMenuProps>(
  function NavigationMenu({ className, children, ...rest }, ref) {
    return (
      <Radix.Root ref={ref} className={cn(navigationMenuRoot, className)} {...rest}>
        {children}
      </Radix.Root>
    );
  },
);

export interface NavigationMenuListProps extends ComponentPropsWithoutRef<typeof Radix.List> {}

export const NavigationMenuList = forwardRef<
  ElementRef<typeof Radix.List>,
  NavigationMenuListProps
>(function NavigationMenuList({ className, ...rest }, ref) {
  return <Radix.List ref={ref} className={cn(navigationMenuList, className)} {...rest} />;
});

export interface NavigationMenuItemProps extends ComponentPropsWithoutRef<typeof Radix.Item> {}

export const NavigationMenuItem = forwardRef<
  ElementRef<typeof Radix.Item>,
  NavigationMenuItemProps
>(function NavigationMenuItem({ className, ...rest }, ref) {
  return <Radix.Item ref={ref} className={className} {...rest} />;
});

export interface NavigationMenuTriggerProps extends ComponentPropsWithoutRef<typeof Radix.Trigger> {
  /** Suppress the built-in caret icon rendered at the right edge. */
  hideChevron?: boolean;
}

export const NavigationMenuTrigger = forwardRef<
  ElementRef<typeof Radix.Trigger>,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger({ className, children, hideChevron, ...rest }, ref) {
  return (
    <Radix.Trigger ref={ref} className={cn(navigationMenuTrigger, className)} {...rest}>
      {children}
      {hideChevron ? null : (
        <span className={navigationMenuCaret} aria-hidden="true">
          <ChevronDown />
        </span>
      )}
    </Radix.Trigger>
  );
});

export interface NavigationMenuContentProps
  extends ComponentPropsWithoutRef<typeof Radix.Content> {}

export const NavigationMenuContent = forwardRef<
  ElementRef<typeof Radix.Content>,
  NavigationMenuContentProps
>(function NavigationMenuContent({ className, ...rest }, ref) {
  return <Radix.Content ref={ref} className={cn(navigationMenuContent, className)} {...rest} />;
});

export interface NavigationMenuLinkProps extends ComponentPropsWithoutRef<typeof Radix.Link> {
  /** Marks the link as the current page. Sets `aria-current="page"` + data flag. */
  active?: boolean;
  children?: ReactNode;
}

export const NavigationMenuLink = forwardRef<
  ElementRef<typeof Radix.Link>,
  NavigationMenuLinkProps
>(function NavigationMenuLink({ className, active, ...rest }, ref) {
  return (
    <Radix.Link
      ref={ref}
      active={active}
      aria-current={active ? 'page' : undefined}
      data-active={active ? 'true' : undefined}
      className={cn(navigationMenuLink, className)}
      {...rest}
    />
  );
});

export interface NavigationMenuIndicatorProps
  extends ComponentPropsWithoutRef<typeof Radix.Indicator> {}

export const NavigationMenuIndicator = forwardRef<
  ElementRef<typeof Radix.Indicator>,
  NavigationMenuIndicatorProps
>(function NavigationMenuIndicator({ className, children, ...rest }, ref) {
  return (
    <Radix.Indicator ref={ref} className={cn(navigationMenuIndicator, className)} {...rest}>
      {children ?? <span className={navigationMenuIndicatorArrow} />}
    </Radix.Indicator>
  );
});

export interface NavigationMenuViewportProps
  extends ComponentPropsWithoutRef<typeof Radix.Viewport> {}

export const NavigationMenuViewport = forwardRef<
  ElementRef<typeof Radix.Viewport>,
  NavigationMenuViewportProps
>(function NavigationMenuViewport({ className, ...rest }, ref) {
  return (
    <div className={navigationMenuViewportWrapper}>
      <Radix.Viewport ref={ref} className={cn(navigationMenuViewport, className)} {...rest} />
    </div>
  );
});

/** Sub-navigation for nested panels (rarely needed, exposed for parity). */
export const NavigationMenuSub: typeof Radix.Sub = Radix.Sub;
