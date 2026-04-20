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
   * When `decorative` (default), the divider is hidden from assistive tech
   * (`role="presentation"` + `aria-hidden`). Set `decorative={false}` to expose
   * it as a meaningful separator with the appropriate orientation.
   */
  decorative?: boolean;
}

const resolveClasses = (orientation: DividerOrientation, variant: DividerVariant): string => {
  if (orientation === 'horizontal') {
    if (variant === 'dashed') return cn(dividerBase, dividerHorizontal, dividerDashed);
    if (variant === 'dotted') return cn(dividerBase, dividerHorizontal, dividerDotted);
    return cn(dividerBase, dividerHorizontal, dividerSolid);
  }
  if (variant === 'dashed') return cn(dividerBase, dividerVertical, dividerVerticalDashed);
  if (variant === 'dotted') return cn(dividerBase, dividerVertical, dividerVerticalDotted);
  return cn(dividerBase, dividerVertical, dividerSolid);
};

/**
 * Visual separator. Renders an `<hr>` in both orientations — the semantic
 * choice for a thematic break. Horizontal is the browser default; vertical
 * uses `aria-orientation="vertical"` so AT announces the axis correctly.
 * Decorative dividers (the default) drop the implicit separator role with
 * `role="presentation"` so they don't clutter the accessibility tree.
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    variant = 'solid',
    thickness = '1',
    className,
    style,
    decorative = true,
  },
  ref: ForwardedRef<HTMLHRElement>,
) {
  const resolvedStyle: CSSProperties = {
    ['--cynosure-divider-thickness' as string]: `${thickness}px`,
    ...style,
  };
  const classes = cn(resolveClasses(orientation, variant), className);

  return (
    <hr
      ref={ref}
      role={decorative ? 'presentation' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
      className={classes}
      style={resolvedStyle}
    />
  );
});
