import {
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../../utils/cn.js';
import { Slot } from '../../Slot.js';
import {
  type AsChildProps,
  type LayoutProps,
  type Responsive,
  type SpaceToken,
  mergeStyles,
  resolveLayoutProps,
  resolveSpace,
  splitLayoutProps,
  toResponsiveVars,
} from '../shared/index.js';
import { inline } from './Inline.css.js';

export type InlineAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type InlineJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const ALIGN_MAP: Record<InlineAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<InlineJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * Props specific to `Inline`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface InlineOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Inline children.
   */
  children?: ReactNode;
  /**
   * Uniform gap in both axes. Falls back to `rowGap`/`columnGap` when set.
   */
  gap?: Responsive<SpaceToken>;
  /**
   * Gap between wrapped rows. Overrides the row axis of `gap`.
   */
  rowGap?: Responsive<SpaceToken>;
  /**
   * Gap between adjacent items on the inline axis. Overrides `gap`'s columns.
   */
  columnGap?: Responsive<SpaceToken>;
  /**
   * Cross-axis alignment — maps to `align-items`. Supports `baseline` for
   * text rows.
   */
  align?: Responsive<InlineAlign>;
  /**
   * Main-axis distribution — maps to `justify-content`.
   */
  justify?: Responsive<InlineJustify>;
  /**
   * Allow items to wrap onto multiple lines.
   * @default true
   */
  wrap?: Responsive<boolean>;
}

/**
 * Full `Inline` props. Generic over the rendered element.
 */
export type InlineProps<E extends ElementType = 'div'> = InlineOwnProps & {
  /**
   * Rendered intrinsic element or component.
   * @default "div"
   */
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof InlineOwnProps | 'as'>;

type AnyProps = InlineOwnProps & { as?: ElementType; [key: string]: unknown };

const InlineRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const {
    as,
    asChild,
    className,
    style,
    children,
    gap,
    rowGap,
    columnGap,
    align,
    justify,
    wrap,
    ...rest
  } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as InlineOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const inlineStyle = mergeStyles(
    // `gap` writes both longhand vars so the column/row-gap CSS rules in
    // Inline.css.ts always resolve. See Grid.tsx for the rationale.
    toResponsiveVars(gap, 'cynosure-inline-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(gap, 'cynosure-inline-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'cynosure-inline-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'cynosure-inline-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'cynosure-inline-align', (v) => ALIGN_MAP[v]),
    toResponsiveVars(justify, 'cynosure-inline-justify', (v) => JUSTIFY_MAP[v]),
    toResponsiveVars(wrap, 'cynosure-inline-wrap', (v) => (v ? 'wrap' : 'nowrap')),
  );
  const mergedStyle = mergeStyles(layoutStyle, inlineStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(inline, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Horizontal flex container that wraps by default. Use for toolbars, chip
 * rows, button groups — anywhere a row of items needs consistent `gap` +
 * graceful reflow. Pass `wrap={false}` to keep items on a single line.
 */
export const Inline = forwardRef<Element, AnyProps>(InlineRender) as <
  E extends ElementType = 'div',
>(
  props: InlineProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
