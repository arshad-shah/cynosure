import { type CSSProperties, type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  skeletonAnimationPulse,
  skeletonAnimationWave,
  skeletonBase,
  skeletonVariant,
} from './Skeleton.css.js';

export type SkeletonVariant = 'text' | 'rect' | 'circle';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

/** Props for the {@link Skeleton} placeholder block. */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual shape: `text` is a short rounded line, `rect` is a flexible
   * rectangle, `circle` paints a perfectly round shape (pair with equal
   * `width` and `height`).
   * @default "text"
   */
  variant?: SkeletonVariant;
  /**
   * Loading animation. `pulse` fades opacity in/out, `wave` sweeps a
   * highlight across, `none` disables motion.
   * @default "pulse"
   */
  animation?: SkeletonAnimation;
  /** Explicit width (number is converted to `px`). */
  width?: number | string;
  /** Explicit height (number is converted to `px`). */
  height?: number | string;
  /** CSS `aspect-ratio` for proportional placeholders (e.g. `"16 / 9"`). */
  aspectRatio?: number | string;
}

const animationClass: Record<SkeletonAnimation, string | undefined> = {
  pulse: skeletonAnimationPulse,
  wave: skeletonAnimationWave,
  none: undefined,
};

const toCss = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value.toString()}px` : value;
};

/**
 * Skeleton renders an inert placeholder while real content loads. Marked with
 * `aria-hidden="true"` so screen readers skip it. Pair sizes/aspect-ratios
 * to the eventual content so the layout doesn't jump on hydration.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'text', animation = 'pulse', width, height, aspectRatio, className, style, ...rest },
  ref,
) {
  const mergedStyle: CSSProperties = {
    width: toCss(width),
    height: toCss(height),
    aspectRatio: aspectRatio === undefined ? undefined : String(aspectRatio),
    ...style,
  };

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-variant={variant}
      className={cn(skeletonBase, skeletonVariant[variant], animationClass[animation], className)}
      style={mergedStyle}
      {...rest}
    />
  );
});
