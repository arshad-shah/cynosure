import {
  Children,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import { avatarGroup, avatarGroupItem, avatarOverflow } from '../Avatar/Avatar.css.js';
import { Avatar, type AvatarProps, type AvatarShape, type AvatarSize } from '../Avatar/Avatar.js';
import { AvatarGroupContext, type AvatarGroupContextValue } from './context.js';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
  shape?: AvatarShape;
  ring?: boolean;
  /**
   * Maximum number of child avatars to render inline. Excess avatars collapse
   * into a `+N` overflow tile.
   */
  max?: number;
  /** Render override for the overflow tile. Receives the hidden count. */
  renderOverflow?: (count: number) => ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { size = 'md', shape = 'circle', ring = true, max, renderOverflow, className, children, ...rest },
  ref,
) {
  const contextValue = useMemo<AvatarGroupContextValue>(() => ({ size, ring }), [size, ring]);

  const array = Children.toArray(children).filter(isValidElement);
  const visible = typeof max === 'number' && max >= 0 ? array.slice(0, max) : array;
  const hiddenCount = array.length - visible.length;

  return (
    <AvatarGroupContext.Provider value={contextValue}>
      <div ref={ref} className={cn(avatarGroup, className)} data-size={size} {...rest}>
        {visible.map((child, index) => {
          const element = child as ReactElement<Record<string, unknown>>;
          return cloneElement(element, {
            key: element.key ?? index,
            className: cn(avatarGroupItem, element.props.className as string | undefined),
          });
        })}
        {hiddenCount > 0 ? (
          renderOverflow ? (
            <div className={avatarGroupItem}>{renderOverflow(hiddenCount)}</div>
          ) : (
            <Avatar
              aria-label={`${hiddenCount} more`}
              shape={shape}
              size={size}
              className={cn(avatarGroupItem, avatarOverflow)}
              initials={`+${hiddenCount}`}
              {...({} as Partial<AvatarProps>)}
            />
          )
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  );
});
