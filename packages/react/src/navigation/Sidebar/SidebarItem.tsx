import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';
import { Tooltip } from '../../overlay/Tooltip/Tooltip.js';
import { Slot } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import {
  sidebarItemBadge,
  sidebarItemBadgeDot,
  sidebarItemIcon,
  sidebarItemLabel,
  sidebarItemRoot,
} from './Sidebar.css.js';
import { useSidebar } from './context.js';

export interface SidebarItemProps extends HTMLAttributes<HTMLElement> {
  icon?: ReactNode;
  label?: ReactNode;
  badge?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  /** Override or disable the auto-tooltip shown when the rail is collapsed. */
  tooltip?: ReactNode | false;
}

export const SidebarItem = forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  {
    icon,
    label,
    badge,
    isActive,
    disabled,
    asChild,
    tooltip,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const ctx = useSidebar();
  const Comp: typeof Slot | 'button' = asChild ? Slot : 'button';

  const content = (
    <>
      {icon ? (
        <span className={sidebarItemIcon} aria-hidden="true">
          {icon}
          {badge !== undefined && badge !== null ? (
            <span className={sidebarItemBadgeDot} aria-hidden="true" />
          ) : null}
        </span>
      ) : null}
      <span className={sidebarItemLabel}>{label ?? children}</span>
      {badge !== undefined && badge !== null ? (
        <span className={sidebarItemBadge}>{badge}</span>
      ) : null}
    </>
  );

  const commonProps = {
    ref: ref as never,
    'data-roving-focus-item': '',
    'data-active': isActive ? 'true' : undefined,
    'aria-current': isActive ? ('page' as const) : undefined,
    className: cn(sidebarItemRoot, className),
    onClick: disabled ? undefined : onClick,
    ...(Comp === 'button' ? { type: 'button' as const, disabled } : { 'aria-disabled': disabled }),
    ...rest,
  };

  let node: ReactElement;
  if (asChild && isValidElement(children)) {
    node = <Comp {...commonProps}>{cloneElement(children, {}, content)}</Comp>;
  } else {
    node = <Comp {...commonProps}>{content}</Comp>;
  }

  const shouldTooltip = ctx.isCollapsedIconRail && tooltip !== false && (tooltip || label);
  if (!shouldTooltip) return node;

  return (
    <Tooltip
      content={tooltip ?? label}
      side={ctx.side === 'right' ? 'left' : 'right'}
      delayMs={200}
    >
      {node}
    </Tooltip>
  );
});
