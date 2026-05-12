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
  resolveSize,
  resolveSpace,
  splitLayoutProps,
  toResponsiveVars,
} from '../shared/index.js';
import { flex } from './Flex.css.js';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const ALIGN_MAP: Record<FlexAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<FlexJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export interface FlexOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  direction?: Responsive<FlexDirection>;
  wrap?: Responsive<FlexWrap>;
  grow?: Responsive<number | `${number}`>;
  shrink?: Responsive<number | `${number}`>;
  basis?: Responsive<SpaceToken | 'auto' | `${number}px` | `${number}%`>;
  gap?: Responsive<SpaceToken>;
  rowGap?: Responsive<SpaceToken>;
  columnGap?: Responsive<SpaceToken>;
  align?: Responsive<FlexAlign>;
  justify?: Responsive<FlexJustify>;
}

export type FlexProps<E extends ElementType = 'div'> = FlexOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof FlexOwnProps | 'as'>;

type AnyProps = FlexOwnProps & { as?: ElementType; [key: string]: unknown };

const FlexRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const {
    as,
    asChild,
    className,
    style,
    children,
    direction,
    wrap,
    grow,
    shrink,
    basis,
    gap,
    rowGap,
    columnGap,
    align,
    justify,
    ...rest
  } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as FlexOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const flexStyle = mergeStyles(
    toResponsiveVars(direction, 'cynosure-flex-dir', (v) => v),
    toResponsiveVars(wrap, 'cynosure-flex-wrap', (v) => v),
    toResponsiveVars(grow, 'cynosure-flex-grow', (v) => String(v)),
    toResponsiveVars(shrink, 'cynosure-flex-shrink', (v) => String(v)),
    toResponsiveVars(basis, 'cynosure-flex-basis', (v) => resolveSize(v)),
    // `gap` writes to both longhand vars so the column/row-gap CSS rules in
    // Flex.css.ts always have a value to resolve. See Grid.tsx for the
    // shorthand-vs-longhand cascade incident note.
    toResponsiveVars(gap, 'cynosure-flex-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(gap, 'cynosure-flex-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'cynosure-flex-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'cynosure-flex-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'cynosure-flex-align', (v) => ALIGN_MAP[v]),
    toResponsiveVars(justify, 'cynosure-flex-justify', (v) => JUSTIFY_MAP[v]),
  );
  const mergedStyle = mergeStyles(layoutStyle, flexStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(flex, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * Escape-hatch flex container. Exposes every flex prop
 * (`direction`/`wrap`/`grow`/`shrink`/`basis`/`gap`/`align`/`justify`). Prefer
 * `Stack` or `Inline` for 90% of cases — reach for `Flex` only when you need
 * reversing rows, baseline alignment, or explicit `grow`/`shrink` values.
 */
export const Flex = forwardRef<Element, AnyProps>(FlexRender) as <E extends ElementType = 'div'>(
  props: FlexProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
