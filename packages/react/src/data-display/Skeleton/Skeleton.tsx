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

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: number | string;
  height?: number | string;
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
