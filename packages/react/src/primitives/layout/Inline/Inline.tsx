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

export interface InlineOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  gap?: Responsive<SpaceToken>;
  rowGap?: Responsive<SpaceToken>;
  columnGap?: Responsive<SpaceToken>;
  align?: Responsive<InlineAlign>;
  justify?: Responsive<InlineJustify>;
  /** Wrap children onto multiple lines. Defaults to `true`. */
  wrap?: Responsive<boolean>;
}

export type InlineProps<E extends ElementType = 'div'> = InlineOwnProps & {
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
    toResponsiveVars(gap, 'lumen-inline-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'lumen-inline-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'lumen-inline-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'lumen-inline-align', (v) => ALIGN_MAP[v]),
    toResponsiveVars(justify, 'lumen-inline-justify', (v) => JUSTIFY_MAP[v]),
    toResponsiveVars(wrap, 'lumen-inline-wrap', (v) => (v ? 'wrap' : 'nowrap')),
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
