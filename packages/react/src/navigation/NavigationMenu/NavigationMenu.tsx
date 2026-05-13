import * as Radix from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { Card } from '../../data-display/Card/Card.js';
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

/**
 * Props for the `NavigationMenu` root. Forwards everything accepted by
 * Radix's `NavigationMenu.Root` (`value`/`defaultValue`/`onValueChange`,
 * `orientation`, `dir`, `delayDuration`, `skipDelayDuration`).
 */
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

/**
 * Props for the horizontal list of top-level menu items. Forwards all
 * Radix `NavigationMenu.List` props.
 */
export interface NavigationMenuListProps extends ComponentPropsWithoutRef<typeof Radix.List> {}

/**
 * Container for the top-level `<NavigationMenuItem>`s. Renders as a
 * horizontal `<ul>` with roving-tab-index focus handled by Radix.
 */
export const NavigationMenuList = forwardRef<
  ElementRef<typeof Radix.List>,
  NavigationMenuListProps
>(function NavigationMenuList({ className, ...rest }, ref) {
  return <Radix.List ref={ref} className={cn(navigationMenuList, className)} {...rest} />;
});

/**
 * Props for a top-level menu cell. Forwards all Radix `NavigationMenu.Item`
 * props (including the optional `value` used for controlled open state).
 */
export interface NavigationMenuItemProps extends ComponentPropsWithoutRef<typeof Radix.Item> {}

/**
 * Single cell in the top-level list. Hosts either a `NavigationMenuTrigger`
 * + `NavigationMenuContent` pair (dropdown) or a flat `NavigationMenuLink`
 * (no panel).
 */
export const NavigationMenuItem = forwardRef<
  ElementRef<typeof Radix.Item>,
  NavigationMenuItemProps
>(function NavigationMenuItem({ className, ...rest }, ref) {
  return <Radix.Item ref={ref} className={className} {...rest} />;
});

/**
 * Props for the top-level trigger that opens a `NavigationMenuContent`
 * panel.
 */
export interface NavigationMenuTriggerProps extends ComponentPropsWithoutRef<typeof Radix.Trigger> {
  /**
   * Suppress the built-in caret icon rendered at the right edge of the
   * trigger label.
   * @default false
   */
  hideChevron?: boolean;
}

/**
 * Top-level menu trigger. Opens its `NavigationMenuContent` on hover (with
 * hover-intent timing managed by Radix) or on `Enter`/`Space` for keyboard
 * users.
 */
export const NavigationMenuTrigger = forwardRef<
  ElementRef<typeof Radix.Trigger>,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger({ className, children, hideChevron, ...rest }, ref) {
  return (
    <Radix.Trigger ref={ref} className={cn(navigationMenuTrigger, className)} {...rest}>
      {children}
      {hideChevron ? null : (
        <span className={navigationMenuCaret} aria-hidden="true">
          <ChevronDown size={14} />
        </span>
      )}
    </Radix.Trigger>
  );
});

/**
 * Props for the floating panel rendered beneath a trigger. Forwards every
 * Radix `NavigationMenu.Content` prop (incl. `forceMount`, `onPointer…`,
 * collision-avoidance callbacks).
 */
export interface NavigationMenuContentProps
  extends ComponentPropsWithoutRef<typeof Radix.Content> {}

/**
 * Floating panel that opens beneath a `<NavigationMenuTrigger>`. The surface
 * (background / border / radius / shadow) is delegated to `<Card variant=
 * "elevated">` so the popup matches every other elevated surface in the
 * library; this component only owns positioning, the dropdown z-layer, and
 * the open/close animation.
 *
 * Card is rendered **as a child of** `Radix.Content` rather than projected
 * via `asChild`. Radix observes the Content node itself with a
 * ResizeObserver to drive `--radix-navigation-menu-viewport-{width,height}`
 * for the `<Viewport>` mode; projecting onto Card interferes with that ref
 * pipeline and leaves the Viewport collapsed to its parent's width. Keeping
 * Card as an inner child lets Radix measure correctly while the visible
 * surface is still our shared Card variant.
 *
 * `width: 'fit-content'` on the Card lets it size to its contents inside an
 * absolutely-positioned `Radix.Content`. The panel intentionally adds no
 * internal padding — consumers typically fill it with their own padded
 * layout (a grid of cards, a `<ul>`, a custom mega-menu split), so an extra
 * inner gutter would double-up and crowd the items out.
 */
export const NavigationMenuContent = forwardRef<
  ElementRef<typeof Radix.Content>,
  NavigationMenuContentProps
>(function NavigationMenuContent({ className, children, ...rest }, ref) {
  return (
    <Radix.Content ref={ref} className={cn(navigationMenuContent, className)} {...rest}>
      <Card variant="elevated" style={{ overflow: 'visible' }}>
        {children}
      </Card>
    </Radix.Content>
  );
});

/**
 * Props for a link rendered inside or outside a `NavigationMenuContent`
 * panel.
 */
export interface NavigationMenuLinkProps extends ComponentPropsWithoutRef<typeof Radix.Link> {
  /**
   * Mark the link as the current page. Sets `aria-current="page"` plus a
   * `data-active="true"` hook for styling.
   * @default false
   */
  active?: boolean;
  /** Link contents. */
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

/**
 * Props for the active-trigger indicator (the small wedge that lines up
 * underneath the open trigger). Forwards every Radix
 * `NavigationMenu.Indicator` prop. Pass custom `children` to replace the
 * default SVG wedge.
 */
export interface NavigationMenuIndicatorProps
  extends ComponentPropsWithoutRef<typeof Radix.Indicator> {}

export const NavigationMenuIndicator = forwardRef<
  ElementRef<typeof Radix.Indicator>,
  NavigationMenuIndicatorProps
>(function NavigationMenuIndicator({ className, children, ...rest }, ref) {
  return (
    <Radix.Indicator ref={ref} className={cn(navigationMenuIndicator, className)} {...rest}>
      {children ?? (
        // SVG triangle. The fill picks up the panel's surface colour (white
        // in light mode), and the stroke pulls a token-driven border line so
        // the wedge reads against any page background. The `viewBox` covers
        // both the upper triangle and a 1-px slice below it that lines up
        // with the panel's top edge, so the bottom stroke gets clipped
        // behind the panel and the upward V remains.
        <svg
          aria-hidden="true"
          className={navigationMenuIndicatorArrow}
          width="14"
          height="8"
          viewBox="0 0 14 8"
          fill="none"
        >
          <path
            d="M0.5 7.5 L7 1 L13.5 7.5"
            fill="currentColor"
            stroke="var(--cynosure-color-border-default)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Radix.Indicator>
  );
});

/**
 * Props for the shared viewport that hosts each open panel — Radix
 * animates between trigger panels by sliding the viewport. Forwards every
 * Radix `NavigationMenu.Viewport` prop.
 */
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
