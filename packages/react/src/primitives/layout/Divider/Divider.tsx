import { type CSSProperties, type ForwardedRef, forwardRef } from 'react';
import { cn } from '../../../utils/cn.js';
import { type LengthValue, type SpaceToken, resolveSize, resolveSpace } from '../shared/tokens.js';
import {
  dividerBase,
  dividerDashed,
  dividerDotted,
  dividerHorizontal,
  dividerSolid,
  dividerVertical,
} from './Divider.css.js';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerThickness = '1' | '2';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  /**
   * Explicit cross-axis length. For `horizontal`, sets the width;
   * for `vertical`, sets the height. Accepts a size token (`"full"`,
   * `"prose"`, …), a space token (`"8"`), or a raw length (`"200px"`).
   * Vertical dividers default to stretching to the parent flex height
   * with a `1.5em` floor; pass `length` to pin an explicit size.
   */
  length?: LengthValue | 'full' | 'auto' | 'fit' | 'screen' | 'prose' | SpaceToken;
  /**
   * Margin on the axis perpendicular to the divider. Horizontal dividers
   * apply it block-wise (above/below); vertical dividers apply it inline
   * (left/right). Accepts a space token like `"3"`.
   */
  spacing?: SpaceToken;
  className?: string;
  style?: CSSProperties;
  /**
   * When `decorative` (default), the divider is hidden from assistive tech
   * (`role="presentation"` + `aria-hidden`). Set `decorative={false}` to expose
   * it as a meaningful separator with the appropriate orientation.
   */
  decorative?: boolean;
}

const variantClass = (variant: DividerVariant): string => {
  if (variant === 'dashed') return dividerDashed;
  if (variant === 'dotted') return dividerDotted;
  return dividerSolid;
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
    length,
    spacing,
    className,
    style,
    decorative = true,
  },
  ref: ForwardedRef<HTMLHRElement>,
) {
  const isVertical = orientation === 'vertical';
  const orientationClass = isVertical ? dividerVertical : dividerHorizontal;

  const resolvedStyle: CSSProperties = {
    ['--cynosure-divider-thickness' as string]: `${thickness}px`,
    ...(length !== undefined
      ? isVertical
        ? { ['--cynosure-divider-length' as string]: resolveSize(length) }
        : { width: resolveSize(length) }
      : null),
    ...(spacing !== undefined
      ? isVertical
        ? { marginInline: resolveSpace(spacing) }
        : { marginBlock: resolveSpace(spacing) }
      : null),
    ...style,
  };

  const classes = cn(dividerBase, orientationClass, variantClass(variant), className);

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
