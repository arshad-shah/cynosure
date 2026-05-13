import { ChevronRight } from 'lucide-react';
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useId,
} from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../data-display/Collapsible/Collapsible.js';
import { Badge } from '../../feedback/Badge/Badge.js';
import { Slot, Slottable } from '../../primitives/Slot.js';
import { Divider } from '../../primitives/layout/Divider/Divider.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { cn } from '../../utils/cn.js';
import {
  menuGroupCaret,
  menuGroupLabel,
  menuGroupToggle,
  menuItemBase,
  menuItemIcon,
  menuItemLabel,
} from './Menu.css.js';

/**
 * Props for the vertical navigation menu root.
 */
export interface MenuProps extends HTMLAttributes<HTMLElement> {
  /**
   * Accessible label for the wrapping `<nav>` element. Required when the
   * page contains more than one navigation region so assistive tech can
   * disambiguate them.
   */
  'aria-label'?: string;
}

/**
 * Vertical navigation list — typically the contents of a sidebar. Renders
 * a `<nav>` over a vertical `Stack`; semantics for individual items
 * (`aria-current`, focus management) come from `MenuItem`/`MenuGroup`.
 */
export const Menu = forwardRef<HTMLElement, MenuProps>(function Menu(
  { className, 'aria-label': ariaLabel, children, ...rest },
  ref,
) {
  return (
    <Stack
      as="nav"
      ref={ref as ForwardedRef<Element>}
      aria-label={ariaLabel}
      gap="0.5"
      className={className}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Stack>
  );
});

/**
 * Props for a grouping of related navigation items inside a `Menu`.
 */
export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Visible section heading. */
  label?: ReactNode;
  /**
   * Render a caret + toggle that show/hide the group's items.
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
}

/**
 * Groups related items and optionally hides them behind a caret. Non-
 * collapsible groups render their `label` as a quiet section heading; the
 * group's items live in the group's flex column. Collapse behaviour and the
 * aria wiring come from Cynosure's `Collapsible` (which wraps Radix), so the
 * trigger/content stay in lockstep without manual `aria-expanded`/`-controls`.
 */
export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  {
    label,
    collapsible = false,
    defaultOpen = true,
    open,
    onOpenChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const labelId = useId();
  const hasLabel = label !== undefined && label !== null;

  if (collapsible) {
    return (
      <Collapsible
        ref={ref}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        className={className}
        {...rest}
      >
        <CollapsibleTrigger asChild>
          <button type="button" className={menuGroupToggle}>
            <span className={menuGroupCaret} aria-hidden="true">
              <ChevronRight size={14} />
            </span>
            {hasLabel ? (
              <span id={labelId} className={menuGroupLabel}>
                {label}
              </span>
            ) : null}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* biome-ignore lint/a11y/useSemanticElements: role="group" is the correct ARIA pattern inside a menu — groups related items under the visible label without picking up <fieldset>'s form-specific styling. */}
          <Stack gap="0.5" role="group" aria-labelledby={hasLabel ? labelId : undefined}>
            {children}
          </Stack>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Stack
      ref={ref as ForwardedRef<Element>}
      gap="0.5"
      className={className}
      {...(rest as Record<string, unknown>)}
    >
      {hasLabel ? (
        <Inline align="center" paddingX="2" paddingY="1">
          <span id={labelId} className={menuGroupLabel}>
            {label}
          </span>
        </Inline>
      ) : null}
      {/* biome-ignore lint/a11y/useSemanticElements: role="group" is the correct ARIA pattern inside a menu — groups related items under the visible label without picking up <fieldset>'s form-specific styling. */}
      <Stack gap="0.5" role="group" aria-labelledby={hasLabel ? labelId : undefined}>
        {children}
      </Stack>
    </Stack>
  );
});

/**
 * Component-specific props layered on top of the underlying button/anchor
 * HTML attributes — exposed via `MenuItemProps`.
 */
export interface MenuItemOwnProps {
  /** Leading-slot icon (typically a Lucide glyph at 16px). */
  icon?: ReactNode;
  /** Trailing-slot icon — useful for chevrons on links to nested pages. */
  iconRight?: ReactNode;
  /**
   * Mark the item as the current page. Sets `aria-current="page"` and a
   * `data-active="true"` hook for styling.
   * @default false
   */
  isActive?: boolean;
  /**
   * Disable interaction. Sets `aria-disabled` and (for the button variant)
   * the native `disabled` attribute.
   * @default false
   */
  disabled?: boolean;
  /**
   * Visual indent level — `1`–`3` add a left padding step per level for
   * representing nested navigation. `0` is flush with the menu edge.
   * @default 0
   */
  indent?: 0 | 1 | 2 | 3;
  /**
   * Optional badge rendered between the label and trailing icon. Strings
   * and numbers are auto-wrapped in a small neutral `Badge`.
   */
  badge?: ReactNode;
  /**
   * Project the item chrome onto a consumer-provided element (e.g. a
   * router `<Link>`). When `true`, the item renders via `Slot` and uses
   * the child as the interactive element.
   * @default false
   */
  asChild?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Polymorphic prop bag for `MenuItem`. Combines the component's own props
 * with the underlying HTML attributes of either a `<button>` or `<a>` —
 * the rendered element is picked from the presence of `href`.
 */
export type MenuItemProps = MenuItemOwnProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof MenuItemOwnProps | 'ref'
  > & {
    /**
     * If set, the item renders as an `<a>` element with this URL;
     * otherwise it renders as a `<button>`.
     */
    href?: string;
  };

const indentStyle = (indent: number): CSSProperties | undefined => {
  if (!indent) return undefined;
  return { paddingInlineStart: `calc(var(--cynosure-space-2) + ${indent} * 1rem)` };
};

type MenuItemElement = HTMLButtonElement & HTMLAnchorElement;

const renderBadge = (badge: ReactNode): ReactElement | null => {
  if (badge === undefined || badge === null || badge === false) return null;
  return (
    <Badge variant="ghost" colorScheme="neutral" size="xs">
      {badge}
    </Badge>
  );
};

const MenuItemRender = (props: MenuItemProps, ref: ForwardedRef<MenuItemElement>): ReactElement => {
  const {
    icon,
    iconRight,
    isActive,
    disabled,
    indent = 0,
    badge,
    asChild,
    className,
    style,
    children,
    href,
    type,
    ...rest
  } = props;

  const mergedClassName = cn(menuItemBase, className);
  const mergedStyle = { ...indentStyle(indent), ...style };

  // Common ARIA / data hooks. `aria-disabled` is set in both branches even
  // when `disabled` is also applied to a native <button>, so the disabled
  // semantics surface for screen readers regardless of element type.
  const stateAttrs = {
    'aria-current': isActive ? ('page' as const) : undefined,
    'aria-disabled': disabled || undefined,
    'data-active': isActive ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
  };

  // `asChild` projects the item chrome (interactive states, icon, badge,
  // iconRight) onto a consumer-provided element — typically a router link.
  // Slot needs a single slottable child; `Slottable` marks where the
  // consumer's element is so our icon / badge / iconRight render as siblings
  // around it. (Same pattern as Button.)
  if (asChild) {
    const SlotAny = Slot as unknown as (props: Record<string, unknown>) => ReactElement;
    return (
      <SlotAny
        ref={ref}
        {...stateAttrs}
        className={mergedClassName}
        style={mergedStyle}
        {...(rest as Record<string, unknown>)}
      >
        {icon ? (
          <span className={menuItemIcon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <Slottable>{children}</Slottable>
        {renderBadge(badge)}
        {iconRight ? (
          <span className={menuItemIcon} aria-hidden="true">
            {iconRight}
          </span>
        ) : null}
      </SlotAny>
    );
  }

  const innerSlots = (
    <>
      {icon ? (
        <span className={menuItemIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={menuItemLabel}>{children}</span>
      {renderBadge(badge)}
      {iconRight ? (
        <span className={menuItemIcon} aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        {...stateAttrs}
        className={mergedClassName}
        style={mergedStyle}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {innerSlots}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled}
      {...stateAttrs}
      className={mergedClassName}
      style={mergedStyle}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {innerSlots}
    </button>
  );
};

/**
 * Polymorphic menu item — renders an `<a>` when `href` is set, a `<button>`
 * otherwise, or projects its styling onto a consumer element via `asChild`.
 * Active state is controlled by the consumer (routers usually provide it).
 */
export const MenuItem = forwardRef(MenuItemRender) as (
  props: MenuItemProps & { ref?: ForwardedRef<MenuItemElement> },
) => ReactElement;

/**
 * Props for the horizontal rule between groups of items. Inherits all
 * standard `<hr>` attributes.
 */
export interface MenuDividerProps extends HTMLAttributes<HTMLHRElement> {}

/**
 * Thin horizontal rule between groups of items. Delegates to `Divider` so the
 * tone / spacing / dark-mode appearance match the rest of the library.
 */
export const MenuDivider = forwardRef<HTMLHRElement, MenuDividerProps>(function MenuDivider(
  { className, ...rest },
  ref,
) {
  return (
    <Divider
      ref={ref as ForwardedRef<HTMLElement>}
      tone="subtle"
      spacing="1"
      className={className}
      {...rest}
    />
  );
});
