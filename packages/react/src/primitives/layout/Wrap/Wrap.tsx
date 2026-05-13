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
import { inline } from '../Inline/Inline.css.js';
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

export type WrapAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type WrapJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const ALIGN_MAP: Record<WrapAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<WrapJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * Props specific to `Wrap`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface WrapOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Wrapped items.
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
   * Cross-axis alignment — maps to `align-items`. Supports `baseline`.
   */
  align?: Responsive<WrapAlign>;
  /**
   * Main-axis distribution — maps to `justify-content`.
   */
  justify?: Responsive<WrapJustify>;
}

/**
 * Full `Wrap` props. Generic over the rendered element.
 */
export type WrapProps<E extends ElementType = 'div'> = WrapOwnProps & {
  /**
   * Rendered intrinsic element or component.
   * @default "div"
   */
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof WrapOwnProps | 'as'>;

type AnyProps = WrapOwnProps & { as?: ElementType; [key: string]: unknown };

const WrapRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
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
    ...rest
  } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as WrapOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  const wrapStyle = mergeStyles(
    toResponsiveVars(gap, 'cynosure-inline-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'cynosure-inline-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'cynosure-inline-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'cynosure-inline-align', (v) => ALIGN_MAP[v]),
    toResponsiveVars(justify, 'cynosure-inline-justify', (v) => JUSTIFY_MAP[v]),
  );
  const mergedStyle = mergeStyles(layoutStyle, wrapStyle, style);

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
 * A row of items that wraps onto multiple lines when it runs out of space.
 * Pairs well with chips, tags, and toolbars — pass `gap` for consistent
 * spacing across both axes. Unlike `Inline`, wrapping is always on and the
 * `wrap` prop is intentionally omitted.
 */
export const Wrap = forwardRef<Element, AnyProps>(WrapRender) as <E extends ElementType = 'div'>(
  props: WrapProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
