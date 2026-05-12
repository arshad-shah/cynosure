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

export type GridAlignItems = 'start' | 'center' | 'end' | 'stretch';
export type GridJustifyContent =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'between'
  | 'around'
  | 'evenly';
export type GridAutoFlow = 'row' | 'column' | 'dense' | 'row dense' | 'column dense';

const ITEMS_MAP: Record<GridAlignItems, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};

const CONTENT_MAP: Record<GridJustifyContent, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
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
  /** `grid-auto-flow` — direction new tracks are added (`row` default, `column`, or `dense`). */
  autoFlow?: Responsive<GridAutoFlow>;
  /** `grid-auto-columns` — size for implicitly-created columns. */
  autoColumns?: Responsive<string>;
  /** `grid-auto-rows` — size for implicitly-created rows. */
  autoRows?: Responsive<string>;
  gap?: Responsive<SpaceToken>;
  columnGap?: Responsive<SpaceToken>;
  rowGap?: Responsive<SpaceToken>;
  /** `align-items` — how each item sits within its cell on the block axis. */
  align?: Responsive<GridAlignItems>;
  /** `justify-items` — how each item sits within its cell on the inline axis. */
  justifyItems?: Responsive<GridAlignItems>;
  /** `align-content` — how tracks are distributed when the grid is shorter than its container. */
  alignContent?: Responsive<GridJustifyContent>;
  /** `justify-content` — how tracks are distributed along the inline axis. Matches Radix/Chakra semantics. */
  justify?: Responsive<GridJustifyContent>;
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
    autoFlow,
    autoColumns,
    autoRows,
    gap,
    columnGap,
    rowGap,
    align,
    justifyItems,
    alignContent,
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
    toResponsiveVars(autoFlow, 'cynosure-grid-flow', (v) => v),
    toResponsiveVars(autoColumns, 'cynosure-grid-auto-cols', (v) => v),
    toResponsiveVars(autoRows, 'cynosure-grid-auto-rows', (v) => v),
    // `gap` writes to both longhand vars so the `column-gap` / `row-gap`
    // CSS declarations in `Grid.css.ts` always have a value to resolve to;
    // writing only the `cynosure-grid-gap` var would leave the longhands
    // invalid and revert to `normal`. `columnGap` / `rowGap` props are
    // merged after (later keys in `Object.assign` win), so they override
    // the individual axis as expected.
    toResponsiveVars(gap, 'cynosure-grid-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(gap, 'cynosure-grid-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(columnGap, 'cynosure-grid-col-gap', (v) => resolveSpace(v)),
    toResponsiveVars(rowGap, 'cynosure-grid-row-gap', (v) => resolveSpace(v)),
    toResponsiveVars(align, 'cynosure-grid-align', (v) => ITEMS_MAP[v]),
    toResponsiveVars(justifyItems, 'cynosure-grid-justify-items', (v) => ITEMS_MAP[v]),
    toResponsiveVars(alignContent, 'cynosure-grid-align-content', (v) => CONTENT_MAP[v]),
    toResponsiveVars(justify, 'cynosure-grid-justify', (v) => CONTENT_MAP[v]),
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
 * `templateColumns="200px 1fr 200px"` for explicit tracks. `justify` controls
 * `justify-content` (track distribution); use `justifyItems` for per-cell
 * alignment. Children control placement through `LayoutProps.gridColumn` /
 * `gridRow` / `gridArea`.
 */
export const Grid = forwardRef<Element, AnyProps>(GridRender) as <E extends ElementType = 'div'>(
  props: GridProps<E> & { ref?: ForwardedRef<Element> },
) => ReactElement | null;
