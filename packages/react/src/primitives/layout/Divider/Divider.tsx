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
export type DividerTone = 'default' | 'subtle' | 'strong';
export type DividerLabelAlign = 'start' | 'center' | 'end';

/**
 * Props for the `Divider` separator (rendered as `<hr>` or labelled `<div>`).
 */
export interface DividerProps {
  /**
   * Rule axis. Vertical dividers must sit inside a container with an
   * explicit height to be visible.
   * @default "horizontal"
   */
  orientation?: DividerOrientation;
  /**
   * Line style — `solid`, `dashed`, or `dotted`.
   * @default "solid"
   */
  variant?: DividerVariant;
  /**
   * Line thickness in pixels.
   * @default "1"
   */
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
   * Colour intensity — `subtle` for a faint thematic rule, `default` for the
   * standard visible rule (matches input borders), `strong` for emphasis.
   * @default "default"
   */
  tone?: DividerTone;
  /**
   * Fade the rule toward its ends via `mask-image`.
   * @default false
   */
  soft?: boolean;
  /**
   * Inline label rendered between two rules. Horizontal orientation only —
   * ignored (with a dev warning) when `orientation="vertical"`.
   */
  children?: ReactNode;
  /**
   * Alignment for the inline `children` label between the two rules.
   * @default "center"
   */
  labelAlign?: DividerLabelAlign;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * When `true`, the divider is hidden from assistive tech. Set to `false`
   * to expose it as a meaningful `role="separator"`.
   * @default true
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
    tone = 'default',
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
