import {
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { Box } from '../../primitives/layout/Box/Box.js';
import {
  type AsChildProps,
  type LayoutProps,
  type Responsive,
  mergeStyles,
  toResponsiveVars,
} from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import { HEADING_LEVEL_DEFAULT_SIZE, lineClamp, truncateOne } from '../shared/shared.css.js';
import { typographyInlineStyle } from '../shared/utils.js';
import { heading } from './Heading.css.js';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type HeadingWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type HeadingAlign = 'start' | 'center' | 'end';

/**
 * Heading sizes pull from both the body and heading composite token sets so a
 * designer can render an h1 with tiny body text (`<Heading level={1}
 * size="xs">`) and still keep semantic hierarchy intact.
 */
const HEADING_FAMILY = {
  xs: 'var(--cynosure-font-body-xs-family)',
  sm: 'var(--cynosure-font-body-sm-family)',
  md: 'var(--cynosure-font-body-md-family)',
  lg: 'var(--cynosure-font-heading-6-family)',
  xl: 'var(--cynosure-font-heading-5-family)',
  '2xl': 'var(--cynosure-font-heading-4-family)',
  '3xl': 'var(--cynosure-font-heading-3-family)',
  '4xl': 'var(--cynosure-font-heading-2-family)',
  '5xl': 'var(--cynosure-font-heading-1-family)',
} as const satisfies Record<HeadingSize, string>;

const HEADING_SIZE = {
  xs: 'var(--cynosure-font-body-xs-size)',
  sm: 'var(--cynosure-font-body-sm-size)',
  md: 'var(--cynosure-font-body-md-size)',
  lg: 'var(--cynosure-font-heading-6-size)',
  xl: 'var(--cynosure-font-heading-5-size)',
  '2xl': 'var(--cynosure-font-heading-4-size)',
  '3xl': 'var(--cynosure-font-heading-3-size)',
  '4xl': 'var(--cynosure-font-heading-2-size)',
  '5xl': 'var(--cynosure-font-heading-1-size)',
} as const satisfies Record<HeadingSize, string>;

const HEADING_LINE_HEIGHT = {
  xs: 'var(--cynosure-font-body-xs-line-height)',
  sm: 'var(--cynosure-font-body-sm-line-height)',
  md: 'var(--cynosure-font-body-md-line-height)',
  lg: 'var(--cynosure-font-heading-6-line-height)',
  xl: 'var(--cynosure-font-heading-5-line-height)',
  '2xl': 'var(--cynosure-font-heading-4-line-height)',
  '3xl': 'var(--cynosure-font-heading-3-line-height)',
  '4xl': 'var(--cynosure-font-heading-2-line-height)',
  '5xl': 'var(--cynosure-font-heading-1-line-height)',
} as const satisfies Record<HeadingSize, string>;

const HEADING_LETTER_SPACING = {
  xs: 'var(--cynosure-letter-spacing-normal)',
  sm: 'var(--cynosure-letter-spacing-normal)',
  md: 'var(--cynosure-letter-spacing-normal)',
  lg: 'var(--cynosure-font-heading-6-letter-spacing)',
  xl: 'var(--cynosure-font-heading-5-letter-spacing)',
  '2xl': 'var(--cynosure-font-heading-4-letter-spacing)',
  '3xl': 'var(--cynosure-font-heading-3-letter-spacing)',
  '4xl': 'var(--cynosure-font-heading-2-letter-spacing)',
  '5xl': 'var(--cynosure-font-heading-1-letter-spacing)',
} as const satisfies Record<HeadingSize, string>;

const HEADING_WEIGHT_DEFAULT = {
  xs: 'var(--cynosure-font-weight-regular)',
  sm: 'var(--cynosure-font-weight-regular)',
  md: 'var(--cynosure-font-weight-regular)',
  lg: 'var(--cynosure-font-heading-6-weight)',
  xl: 'var(--cynosure-font-heading-5-weight)',
  '2xl': 'var(--cynosure-font-heading-4-weight)',
  '3xl': 'var(--cynosure-font-heading-3-weight)',
  '4xl': 'var(--cynosure-font-heading-2-weight)',
  '5xl': 'var(--cynosure-font-heading-1-weight)',
} as const satisfies Record<HeadingSize, string>;

const WEIGHT_OVERRIDE: Record<HeadingWeight, string> = {
  regular: 'var(--cynosure-font-weight-regular)',
  medium: 'var(--cynosure-font-weight-medium)',
  semibold: 'var(--cynosure-font-weight-semibold)',
  bold: 'var(--cynosure-font-weight-bold)',
};

const ALIGN_VALUE: Record<HeadingAlign, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
};

export interface HeadingOwnProps extends LayoutProps, AsChildProps {
  level?: HeadingLevel;
  size?: Responsive<HeadingSize>;
  weight?: Responsive<HeadingWeight>;
  align?: Responsive<HeadingAlign>;
  truncate?: boolean | number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export type HeadingProps = HeadingOwnProps &
  Omit<React.HTMLAttributes<HTMLHeadingElement>, keyof HeadingOwnProps | 'color'>;

type AnyProps = HeadingOwnProps & { [key: string]: unknown };

const HeadingRender = (props: AnyProps, ref: ForwardedRef<HTMLHeadingElement>): ReactElement => {
  const {
    level = 2,
    asChild,
    className,
    style,
    children,
    size,
    weight,
    align,
    truncate,
    ...rest
  } = props;

  // Default the size from the semantic level; explicit `size` always wins.
  const resolvedSize = size ?? HEADING_LEVEL_DEFAULT_SIZE[level];

  const headingStyle = mergeStyles(
    toResponsiveVars(resolvedSize, 'cynosure-heading-family', (v) => HEADING_FAMILY[v]),
    toResponsiveVars(resolvedSize, 'cynosure-heading-size', (v) => HEADING_SIZE[v]),
    toResponsiveVars(resolvedSize, 'cynosure-heading-lh', (v) => HEADING_LINE_HEIGHT[v]),
    toResponsiveVars(resolvedSize, 'cynosure-heading-ls', (v) => HEADING_LETTER_SPACING[v]),
    // Default weight comes from the heading token; an explicit `weight` prop
    // overrides it at the same breakpoint via the same cascade variable.
    toResponsiveVars(resolvedSize, 'cynosure-heading-weight', (v) => HEADING_WEIGHT_DEFAULT[v]),
    toResponsiveVars(weight, 'cynosure-heading-weight', (v) => WEIGHT_OVERRIDE[v]),
    toResponsiveVars(align, 'cynosure-heading-align', (v) => ALIGN_VALUE[v]),
    typographyInlineStyle({ truncate }),
    style,
  );

  const truncateClass =
    truncate === true || truncate === 1
      ? truncateOne
      : typeof truncate === 'number' && truncate > 1
        ? lineClamp
        : undefined;

  return (
    <Box
      ref={ref as unknown as never}
      as={`h${level}` as ElementType}
      asChild={asChild}
      className={cn(heading, truncateClass, className)}
      style={headingStyle}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Box>
  );
};

/**
 * Semantic heading. `level` controls the rendered element (`h1`..`h6`) for
 * screen-reader and SEO-relevant document outline; `size` is decoupled so
 * visual hierarchy can diverge from structural hierarchy. Omitting `size`
 * defaults to the matching heading composite token for `level`.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(HeadingRender as never);
