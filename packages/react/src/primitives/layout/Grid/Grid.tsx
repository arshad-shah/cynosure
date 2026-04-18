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
import { grid } from './Grid.css.js';

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';

const ALIGN_MAP: Record<GridAlign, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};

export interface GridOwnProps extends LayoutProps, AsChildProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Shorthand for `repeat(N, minmax(0, 1fr))`. */
  columns?: Responsive<number>;
  /** Shorthand for `repeat(N, minmax(0, auto))`. */
  rows?: Responsive<number>;
  /** Raw CSS `grid-template-columns` — use for mixed tracks like `"200px 1fr 200px"`. */
  templateColumns?: Responsive<string>;
  /** Raw CSS `grid-template-rows`. */
  templateRows?: Responsive<string>;
  gap?: Responsive<SpaceToken>;
  columnGap?: Responsive<SpaceToken>;
  rowGap?: Responsive<SpaceToken>;
  align?: Responsive<GridAlign>;
  justify?: Responsive<GridAlign>;
}

export type GridProps<E extends ElementType = 'div'> = GridOwnProps & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof GridOwnProps | 'as'>;

type AnyProps = GridOwnProps & { as?: ElementType; [key: string]: unknown };

const columnsTemplate = (n: number): string => `repeat(${n}, minmax(0, 1fr))`;
const rowsTemplate = (n: number): string => `repeat(${n}, minmax(0, auto))`;

const GridRender = (props: AnyProps, ref: ForwardedRef<Element>): ReactElement => {
  const {
    as,
    asChild,
    className,
    style,
    children,
    columns,
    rows,
    templateColumns,
    templateRows,
    gap,
    columnGap,
    rowGap,
    align,
    justify,
    ...rest
  } = props;

  const { layoutProps, rest: domProps } = splitLayoutProps(rest as GridOwnProps);

  const layoutStyle = resolveLayoutProps(layoutProps);
  // Explicit templates win over the `columns`/`rows` shorthands.
  const colsValue = templateColumns ?? (columns !== undefined ? columns : undefined);
  const rowsValue = templateRows ?? (rows !== undefined ? rows : undefined);

  const gridStyle = mergeStyles(
    toResponsiveVars(colsValue, 'cynosure-grid-cols', (v) =>
      typeof v === 'number' ? columnsTemplate(v) : (v as string),
    ),
    toResponsiveVars(rowsValue, 'cynosure-grid-rows', (v) =>
      typeof v === 'number' ? rowsTemplate(v) : (v as string),
    ),
    toResponsiveVars(gap, 'cynosure-grid-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'cynosure-grid-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'cynosure-grid-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'cynosure-grid-align', (v) => ALIGN_MAP[v]),
    toResponsiveVars(justify, 'cynosure-grid-justify', (v) => ALIGN_MAP[v]),
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
 * CSS Grid container. Pass `columns={N}` for `repeat(N, minmax(0, 1fr))` or
 * `templateColumns="200px 1fr 200px"` for explicit tracks. Children control
 * placement through `LayoutProps.gridColumn` / `gridRow` / `gridArea`.
 */
export const Grid = forwardRef<Element, AnyProps>(GridRender) as <E extends ElementType = 'div'>(
  props: GridProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
