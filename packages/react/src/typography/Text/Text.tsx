import {
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { Box } from '../../primitives/layout/Box/Box.js';
import type { BoxProps } from '../../primitives/layout/Box/Box.js';
import {
  type AsChildProps,
  type LayoutProps,
  type Responsive,
  mergeStyles,
  toResponsiveVars,
} from '../../primitives/layout/shared/index.js';
import type { ColorToken } from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import {
  italicClass,
  lineClamp,
  strikethroughClass,
  textVariant,
  truncateOne,
  underlineAndStrikethrough,
  underlineClass,
} from '../shared/shared.css.js';
import type { TextVariant } from '../shared/shared.css.js';
import { typographyInlineStyle } from '../shared/utils.js';
import { text } from './Text.css.js';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'start' | 'center' | 'end' | 'justify';

const BODY_FAMILY = {
  xs: 'var(--cynosure-font-body-xs-family)',
  sm: 'var(--cynosure-font-body-sm-family)',
  md: 'var(--cynosure-font-body-md-family)',
  lg: 'var(--cynosure-font-body-lg-family)',
  xl: 'var(--cynosure-font-body-lg-family)',
} as const satisfies Record<TextSize, string>;

const BODY_SIZE = {
  xs: 'var(--cynosure-font-body-xs-size)',
  sm: 'var(--cynosure-font-body-sm-size)',
  md: 'var(--cynosure-font-body-md-size)',
  lg: 'var(--cynosure-font-body-lg-size)',
  xl: 'var(--cynosure-font-size-xl)',
} as const satisfies Record<TextSize, string>;

const BODY_LINE_HEIGHT = {
  xs: 'var(--cynosure-font-body-xs-line-height)',
  sm: 'var(--cynosure-font-body-sm-line-height)',
  md: 'var(--cynosure-font-body-md-line-height)',
  lg: 'var(--cynosure-font-body-lg-line-height)',
  xl: 'var(--cynosure-font-body-lg-line-height)',
} as const satisfies Record<TextSize, string>;

const WEIGHT_VAR: Record<TextWeight, string> = {
  regular: 'var(--cynosure-font-weight-regular)',
  medium: 'var(--cynosure-font-weight-medium)',
  semibold: 'var(--cynosure-font-weight-semibold)',
  bold: 'var(--cynosure-font-weight-bold)',
};

const ALIGN_VALUE: Record<TextAlign, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  justify: 'justify',
};

export type TextAs = 'span' | 'p' | 'div' | 'label' | 'strong' | 'em';

/**
 * Props specific to `Text`, layered on top of `LayoutProps` and `AsChildProps`.
 */
export interface TextOwnProps extends LayoutProps, AsChildProps {
  /**
   * Body type scale step. Maps to the `body.*` composite typography tokens.
   */
  size?: Responsive<TextSize>;
  /**
   * Font-weight token. Resolves to the matching `font-weight-*` CSS variable.
   */
  weight?: Responsive<TextWeight>;
  /**
   * Horizontal text alignment.
   */
  align?: Responsive<TextAlign>;
  /**
   * Semantic role atop the base size — e.g. `caption`, `overline`, `lead`.
   */
  variant?: TextVariant;
  /**
   * `true` → single-line truncation; `number > 1` → multi-line line-clamp.
   */
  truncate?: boolean | number;
  /**
   * Renders italic glyphs via `font-style: italic`.
   */
  italic?: boolean;
  /**
   * Draws a `text-decoration: underline` line.
   */
  underline?: boolean;
  /**
   * Draws a `text-decoration: line-through` line.
   */
  strikethrough?: boolean;
  /**
   * Colour for `underline` / `strikethrough` decorations.
   */
  decorationColor?: ColorToken;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last; wins over Cynosure-computed style.
   */
  style?: CSSProperties;
  /**
   * Rendered content.
   */
  children?: ReactNode;
}

/**
 * Full `Text` props — `TextOwnProps` plus an intrinsic-element `as` override
 * and the remaining HTML attributes minus any Cynosure-owned keys.
 */
export type TextProps = TextOwnProps & {
  /**
   * Rendered intrinsic element. Restricted to inline-friendly tags.
   * @default "span"
   */
  as?: TextAs;
} & Omit<React.HTMLAttributes<HTMLElement>, keyof TextOwnProps | 'color' | 'as'>;

type AnyProps = TextOwnProps & {
  as?: TextAs;
  [key: string]: unknown;
};

const TextRender = (props: AnyProps, ref: ForwardedRef<HTMLElement>): ReactElement => {
  const {
    as,
    asChild,
    className,
    style,
    children,
    size,
    weight,
    align,
    variant,
    truncate,
    italic,
    underline,
    strikethrough,
    decorationColor,
    ...rest
  } = props;

  const textStyle = mergeStyles(
    toResponsiveVars(size, 'cynosure-text-family', (v) => BODY_FAMILY[v]),
    toResponsiveVars(size, 'cynosure-text-size', (v) => BODY_SIZE[v]),
    toResponsiveVars(size, 'cynosure-text-lh', (v) => BODY_LINE_HEIGHT[v]),
    toResponsiveVars(weight, 'cynosure-text-weight', (v) => WEIGHT_VAR[v]),
    toResponsiveVars(align, 'cynosure-text-align', (v) => ALIGN_VALUE[v]),
    typographyInlineStyle({ truncate, decorationColor }),
    style,
  );

  const truncateClass =
    truncate === true || truncate === 1
      ? truncateOne
      : typeof truncate === 'number' && truncate > 1
        ? lineClamp
        : undefined;

  const decorationClass =
    underline && strikethrough
      ? underlineAndStrikethrough
      : underline
        ? underlineClass
        : strikethrough
          ? strikethroughClass
          : undefined;

  const mergedClass = cn(
    text,
    variant ? textVariant[variant] : undefined,
    italic ? italicClass : undefined,
    decorationClass,
    truncateClass,
    className,
  );

  return (
    <Box
      ref={ref as unknown as never}
      as={(as ?? 'span') as ElementType}
      asChild={asChild}
      className={mergedClass}
      style={textStyle}
      {...(rest as BoxProps)}
    >
      {children}
    </Box>
  );
};

/**
 * Body text. Renders `<span>` by default via `<Box>` — change the rendered
 * element through `as` (never swap Box for an intrinsic). Pass `asChild` to
 * merge Text's styling onto a single arbitrary child (e.g. a framework link).
 *
 * `size`, `weight`, and `align` all accept `Responsive<T>` and animate across
 * breakpoints via CSS custom property cascades; `variant` tweaks role
 * (caption/overline/lead) on top of the chosen size.
 */
export const Text = forwardRef<HTMLElement, TextProps>(TextRender as never);
