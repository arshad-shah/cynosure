import { type CSSProperties, type ForwardedRef, type ReactNode, forwardRef } from 'react';
import { cn } from '../../../utils/cn.js';
import { type LengthValue, type SpaceToken, resolveSize, resolveSpace } from '../shared/tokens.js';
import {
  dividerBase,
  dividerDashed,
  dividerDotted,
  dividerHorizontal,
  dividerLabel,
  dividerLabelAlign,
  dividerLabeled,
  dividerSoft,
  dividerSolid,
  dividerTone,
  dividerVertical,
} from './Divider.css.js';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerThickness = '1' | '2';
export type DividerTone = 'default' | 'subtle';
export type DividerLabelAlign = 'start' | 'center' | 'end';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  /**
   * Explicit cross-axis length. For `horizontal`, sets the width;
   * for `vertical`, sets the height. Accepts a size token (`"full"`,
   * `"prose"`, …), a space token (`"8"`), or a raw length (`"200px"`).
   */
  length?: LengthValue | 'full' | 'auto' | 'fit' | 'screen' | 'prose' | SpaceToken;
  /**
   * Margin on the axis perpendicular to the divider. Horizontal dividers
   * apply it block-wise (above/below); vertical dividers apply it inline
   * (left/right).
   */
  spacing?: SpaceToken;
  /**
   * Line color tone. Defaults to `subtle` (thematic rule). Use `default` when
   * you want a stronger rule (e.g. matching input borders).
   */
  tone?: DividerTone;
  /** Fade the rule toward its ends via `mask-image`. */
  soft?: boolean;
  /**
   * Inline label rendered between two rules. Horizontal orientation only —
   * ignored with `orientation="vertical"`.
   */
  children?: ReactNode;
  /** Alignment for `children`. Defaults to `center`. */
  labelAlign?: DividerLabelAlign;
  className?: string;
  style?: CSSProperties;
  /**
   * When `decorative` (default), the divider is hidden from assistive tech.
   * Set `decorative={false}` to expose it as a meaningful separator.
   */
  decorative?: boolean;
}

const variantClass = (variant: DividerVariant): string => {
  if (variant === 'dashed') return dividerDashed;
  if (variant === 'dotted') return dividerDotted;
  return dividerSolid;
};

/**
 * Visual separator. Without `children`, renders `<hr>`. With `children`,
 * renders a `<div role="separator">` with rules drawn as `::before` /
 * `::after` pseudo-elements on either side of the label.
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    variant = 'solid',
    thickness = '1',
    length,
    spacing,
    tone = 'subtle',
    soft = false,
    children,
    labelAlign = 'center',
    className,
    style,
    decorative = true,
  },
  ref: ForwardedRef<HTMLElement>,
) {
  const isVertical = orientation === 'vertical';
  const hasLabel = children !== undefined && children !== null && !isVertical;

  if (children && isVertical && typeof console !== 'undefined') {
    console.warn('[Divider] `children` is not supported with `orientation="vertical"`.');
  }

  const resolvedStyle: CSSProperties = {
    ['--cynosure-divider-thickness' as string]: `${thickness}px`,
    ...(length !== undefined && !hasLabel
      ? isVertical
        ? { ['--cynosure-divider-length' as string]: resolveSize(length) }
        : { width: resolveSize(length) }
      : null),
    ...(length !== undefined && hasLabel ? { width: resolveSize(length) } : null),
    ...(spacing !== undefined
      ? isVertical
        ? { marginInline: resolveSpace(spacing) }
        : { marginBlock: resolveSpace(spacing) }
      : null),
    ...style,
  };

  if (hasLabel) {
    const classes = cn(
      dividerBase,
      dividerLabeled,
      dividerTone[tone],
      variantClass(variant),
      soft ? dividerSoft : undefined,
      dividerLabelAlign[labelAlign],
      className,
    );
    return (
      <div
        ref={ref as ForwardedRef<HTMLDivElement>}
        role={decorative ? 'presentation' : 'separator'}
        aria-orientation={decorative ? undefined : 'horizontal'}
        aria-hidden={decorative ? true : undefined}
        className={classes}
        style={resolvedStyle}
      >
        <span className={dividerLabel}>{children}</span>
      </div>
    );
  }

  const orientationClass = isVertical ? dividerVertical : dividerHorizontal;
  const classes = cn(
    dividerBase,
    orientationClass,
    dividerTone[tone],
    variantClass(variant),
    soft ? dividerSoft : undefined,
    className,
  );

  return (
    <hr
      ref={ref as ForwardedRef<HTMLHRElement>}
      role={decorative ? 'presentation' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
      className={classes}
      style={resolvedStyle}
    />
  );
});
