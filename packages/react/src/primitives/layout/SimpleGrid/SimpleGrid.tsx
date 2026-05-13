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
import { grid } from '../Grid/Grid.css.js';
import {
  type AsChildProps,
  type LayoutProps,
  type Responsive,
  type SizeValue,
  type SpaceToken,
  mergeStyles,
  resolveLayoutProps,
  resolveSize,
  resolveSpace,
  splitLayoutProps,
  toResponsiveVars,
} from '../shared/index.js';

/**
 * Props specific to `SimpleGrid`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface SimpleGridOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Grid children.
   */
  children?: ReactNode;
  /**
   * Fixed column count — emits `repeat(N, minmax(0, 1fr))`. Ignored when
   * `minChildWidth` is set.
   */
  columns?: Responsive<number>;
  /**
   * Minimum width each child should occupy before a new column is added.
   * Emits `repeat(auto-fit, minmax(<minChildWidth>, 1fr))` for a fluid grid
   * that reflows without breakpoints. Wins over `columns`.
   */
  minChildWidth?: Responsive<SizeValue>;
  /**
   * Uniform gap in both axes.
   */
  gap?: Responsive<SpaceToken>;
  /**
   * Gap between columns. Overrides the column axis of `gap`.
   */
  columnGap?: Responsive<SpaceToken>;
  /**
   * Gap between rows. Overrides the row axis of `gap`.
   */
  rowGap?: Responsive<SpaceToken>;
}

/**
 * Full `SimpleGrid` props. Generic over the rendered element.
 */
export type SimpleGridProps<E extends ElementType = 'div'> = SimpleGridOwnProps & {
  /**
   * Rendered intrinsic element or component.
   * @default "div"
   */
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof SimpleGridOwnProps | 'as'>;

type AnyProps = SimpleGridOwnProps & { as?: ElementType; [key: string]: unknown };

const columnsTemplate = (n: number): string => `repeat(${n}, minmax(0, 1fr))`;
const minChildTemplate = (v: SizeValue): string =>
  `repeat(auto-fit, minmax(${resolveSize(v)}, 1fr))`;

const SimpleGridRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const {
    as,
    asChild,
    className,
    style,
    children,
    columns,
    minChildWidth,
    gap,
    columnGap,
    rowGap,
    ...rest
  } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as SimpleGridOwnProps);

  // `minChildWidth` drives auto-fit and wins over `columns` when both are set —
  // matches Chakra/Mantine semantics.
  const template =
    minChildWidth !== undefined
      ? toResponsiveVars(minChildWidth, 'cynosure-grid-cols', (v) => minChildTemplate(v))
      : toResponsiveVars(columns, 'cynosure-grid-cols', (v) => columnsTemplate(v));

  const layoutStyle = resolveLayoutProps(layoutProps);
  const gridStyle = mergeStyles(
    template,
    toResponsiveVars(gap, 'cynosure-grid-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'cynosure-grid-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'cynosure-grid-row-gap', (v) => resolveSpace(v)),
  );
  const mergedStyle = mergeStyles(layoutStyle, gridStyle, style);

  const Comp: ElementType = asChild ? Slot : (as ?? 'div');

  return (
    <Comp
      ref={ref}
      className={cn(grid, className)}
      style={mergedStyle}
      {...(domProps as Record<string, unknown>)}
    >
      {children}
    </Comp>
  );
};

/**
 * A grid that lays children out in equal-width columns with a single,
 * predictable API. Pass `columns={N}` for a fixed-track grid, or
 * `minChildWidth="14rem"` for a responsive auto-fit layout that reflows
 * without media queries.
 */
export const SimpleGrid = forwardRef<Element, AnyProps>(SimpleGridRender) as <
  E extends ElementType = 'div',
>(
  props: SimpleGridProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
