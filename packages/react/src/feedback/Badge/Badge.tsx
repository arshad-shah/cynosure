import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import type { FeedbackColorScheme, FeedbackVariant } from '../shared/types.js';
import {
  badgeDot,
  badgeDotSize,
  badgeIcon,
  badgeRoot,
  badgeShape,
  badgeSize,
} from './Badge.css.js';
import { badgeVariantClass } from './variants.js';

export type BadgeVariant = FeedbackVariant;
export type BadgeColorScheme = FeedbackColorScheme;
export type BadgeSize = 'xs' | 'sm' | 'md';
export type BadgeShape = 'default' | 'pill' | 'square';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  colorScheme?: BadgeColorScheme;
  size?: BadgeSize;
  shape?: BadgeShape;
  /** Leading icon rendered before the children. */
  icon?: ReactNode;
  /** Render as a bare coloured dot (no content). */
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = 'soft',
    colorScheme = 'neutral',
    size = 'md',
    shape = 'default',
    icon,
    dot = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const variantCls = badgeVariantClass[variant][colorScheme];

  if (dot) {
    return (
      <span
        ref={ref}
        aria-hidden={children === undefined ? true : undefined}
        className={cn(badgeRoot, badgeDot, badgeDotSize[size], variantCls, className)}
        {...rest}
      />
    );
  }

  return (
    <span
      ref={ref}
      className={cn(badgeRoot, badgeSize[size], badgeShape[shape], variantCls, className)}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className={badgeIcon}>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
});
