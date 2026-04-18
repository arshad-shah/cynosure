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
  useState,
} from 'react';
import { Slot } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import {
  menuDividerStyle,
  menuGroup,
  menuGroupBody,
  menuGroupCaret,
  menuGroupLabel,
  menuGroupLabelRow,
  menuGroupToggle,
  menuItemBadge,
  menuItemBase,
  menuItemIcon,
  menuItemLabel,
  menuRoot,
} from './Menu.css.js';

const Caret = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface MenuProps extends HTMLAttributes<HTMLElement> {
  'aria-label'?: string;
}

export const Menu = forwardRef<HTMLElement, MenuProps>(function Menu(
  { className, 'aria-label': ariaLabel, children, ...rest },
  ref,
) {
  return (
    <nav ref={ref} aria-label={ariaLabel} className={cn(menuRoot, className)} {...rest}>
      {children}
    </nav>
  );
});

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  /** If true, the group renders a caret that toggles visibility. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Groups related items and optionally hides them behind a caret. Non-
 * collapsible groups render their `label` as a quiet section heading; the
 * group's items live in the group's flex column.
 */
export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  {
    label,
    collapsible = false,
    defaultOpen = true,
    open: openProp,
    onOpenChange,
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
    <div ref={ref} className={cn(menuGroup, className)} {...rest}>
      {label !== undefined ? (
        <div className={menuGroupLabelRow}>
          {collapsible ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={toggle}
              className={menuGroupToggle}
            >
              <span className={menuGroupCaret} data-open={open ? 'true' : 'false'}>
                <Caret />
              </span>
              <span className={menuGroupLabel} style={{ marginLeft: 4 }}>
                {label}
              </span>
            </button>
          ) : (
            <span className={menuGroupLabel}>{label}</span>
          )}
        </div>
      ) : null}
      <div id={bodyId} className={menuGroupBody} data-open={open ? 'true' : 'false'}>
        {children}
      </div>
    </div>
  );
});

export interface MenuItemOwnProps {
  icon?: ReactNode;
  iconRight?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  /** Visual indent level (0 default, 1, 2). */
  indent?: 0 | 1 | 2 | 3;
  badge?: ReactNode;
  asChild?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type MenuItemProps = MenuItemOwnProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof MenuItemOwnProps | 'ref'
  > & {
    href?: string;
  };

const indentStyle = (indent: number): CSSProperties | undefined => {
  if (!indent) return undefined;
  return { paddingLeft: `calc(var(--cynosure-space-2) + ${indent} * 1rem)` };
};

type AnyElement = HTMLButtonElement & HTMLAnchorElement;

const MenuItemRender = (props: MenuItemProps, ref: ForwardedRef<AnyElement>): ReactElement => {
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

  const content = (
    <>
      {icon ? (
        <span className={menuItemIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={menuItemLabel}>{children}</span>
      {badge ? <span className={menuItemBadge}>{badge}</span> : null}
      {iconRight ? (
        <span className={menuItemIcon} aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </>
  );

  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as ForwardedRef<HTMLElement>}
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        className={mergedClassName}
        style={mergedStyle}
        {...(rest as Record<string, unknown>)}
      >
        {content}
      </Slot>
    );
  }

  if (href) {
    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled || undefined}
        data-active={isActive ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        className={mergedClassName}
        style={mergedStyle}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-current={isActive ? 'page' : undefined}
      disabled={disabled}
      data-active={isActive ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={mergedClassName}
      style={mergedStyle}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
};

/**
 * Polymorphic menu item — renders an `<a>` when `href` is set, a `<button>`
 * otherwise, or projects its styling onto a consumer element via `asChild`.
 * Active state is controlled by the consumer (routers usually provide it).
 */
export const MenuItem = forwardRef(MenuItemRender) as (
  props: MenuItemProps & { ref?: ForwardedRef<AnyElement> },
) => ReactElement;

export interface MenuDividerProps extends HTMLAttributes<HTMLHRElement> {}

export const MenuDivider = forwardRef<HTMLHRElement, MenuDividerProps>(function MenuDivider(
  { className, ...rest },
  ref,
) {
  return <hr ref={ref} className={cn(menuDividerStyle, className)} {...rest} />;
});
