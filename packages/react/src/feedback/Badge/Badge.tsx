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

/**
 * Props for the {@link Badge} component.
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style. `soft` reads as informational; `solid` draws more
   * attention; `outline` is minimal; `ghost` is borderless.
   * @default "soft"
   */
  variant?: BadgeVariant;
  /**
   * Semantic palette. One of `neutral`, `accent`, `success`, `warning`,
   * `danger`, `info`.
   * @default "neutral"
   */
  colorScheme?: BadgeColorScheme;
  /**
   * Pixel scale. One of `xs`, `sm`, `md`.
   * @default "md"
   */
  size?: BadgeSize;
  /**
   * Outline shape. `default` is gently rounded; `pill` is fully rounded;
   * `square` has no corner rounding.
   * @default "default"
   */
  shape?: BadgeShape;
  /** Leading icon rendered before the children. */
  icon?: ReactNode;
  /**
   * Render as a bare coloured dot (no content).
   * @default false
   */
  dot?: boolean;
}

/**
 * Compact label for status, counts, or categorisation. Badge is purely
 * presentational; pair it with surrounding text or an `aria-label` when the
 * meaning is colour- or icon-dependent so it remains accessible to assistive
 * technology.
 */
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
