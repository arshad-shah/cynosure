import { type CSSProperties, type ForwardedRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn.js';
import {
  dividerBase,
  dividerDashed,
  dividerDotted,
  dividerHorizontal,
  dividerSolid,
  dividerVertical,
  dividerVerticalDashed,
  dividerVerticalDotted,
} from './Divider.css.js';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerThickness = '1' | '2';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  className?: string;
  style?: CSSProperties;
  /**
   * When `decorative` (default), renders an ARIA-hidden `<hr>` /
   * `<div role="separator" aria-orientation>`. Setting `decorative={false}`
   * exposes the divider as a meaningful separator to assistive tech.
   */
  decorative?: boolean;
}

const resolveClasses = (orientation: DividerOrientation, variant: DividerVariant): string => {
  if (orientation === 'horizontal') {
    if (variant === 'dashed') return cn(dividerBase, dividerDashed);
    if (variant === 'dotted') return cn(dividerBase, dividerDotted);
    return cn(dividerBase, dividerHorizontal, dividerSolid);
  }
  if (variant === 'dashed') return cn(dividerBase, dividerVertical, dividerVerticalDashed);
  if (variant === 'dotted') return cn(dividerBase, dividerVertical, dividerVerticalDotted);
  return cn(dividerBase, dividerVertical, dividerSolid);
};

/**
 * Visual separator. Horizontal renders an `<hr>`; vertical renders a
 * `<div role="separator" aria-orientation="vertical">` because a real `<hr>`
 * doesn't resolve vertically across browsers without CSS gymnastics.
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    variant = 'solid',
    thickness = '1',
    className,
    style,
    decorative = true,
  },
  ref: ForwardedRef<HTMLElement>,
) {
  const resolvedStyle: CSSProperties = {
    ['--cynosure-divider-thickness' as string]: `${thickness}px`,
    ...style,
  };
  const classes = cn(resolveClasses(orientation, variant), className);

  if (orientation === 'vertical') {
    return (
      <div
        ref={ref as ForwardedRef<HTMLDivElement>}
        role={decorative ? undefined : 'separator'}
        aria-orientation="vertical"
        aria-hidden={decorative ? true : undefined}
        className={classes}
        style={resolvedStyle}
      />
    );
  }

  return (
    <hr
      ref={ref as ForwardedRef<HTMLHRElement>}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'separator'}
      className={classes}
      style={resolvedStyle}
    />
  );
});
