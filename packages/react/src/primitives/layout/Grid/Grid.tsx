import type { CSSProperties, ElementType, ReactNode } from 'react';
import {
  type AsChildProps,
  type LayoutProps,
  type PolymorphicProps,
  type Responsive,
  type SpaceToken,
  createLayoutComponent,
  mergeStyles,
  resolveSpace,
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

/**
 * Props specific to `Grid`, layered on `LayoutProps` and `AsChildProps`.
 */
export interface GridOwnProps extends LayoutProps, AsChildProps {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Grid children. Use `LayoutProps.gridColumn`/`gridRow`/`gridArea` on
   * children for placement.
   */
  children?: ReactNode;
  /**
   * Column-count shorthand — emits `repeat(N, minmax(0, 1fr))`.
   * Superseded by `templateColumns` when both are set.
   */
  columns?: Responsive<number>;
  /**
   * Row-count shorthand — emits `repeat(N, minmax(0, auto))`.
   * Superseded by `templateRows` when both are set.
   */
  rows?: Responsive<number>;
  /**
   * Raw `grid-template-columns` — use for mixed tracks like
   * `"200px 1fr 200px"`. Wins over `columns`.
   */
  templateColumns?: Responsive<string>;
  /**
   * Raw `grid-template-rows`. Wins over `rows`.
   */
  templateRows?: Responsive<string>;
  /**
   * `grid-auto-flow` — direction new tracks are added (`row`, `column`, or
   * `dense` variants).
   */
  autoFlow?: Responsive<GridAutoFlow>;
  /**
   * `grid-auto-columns` — size for implicitly-created columns.
   */
  autoColumns?: Responsive<string>;
  /**
   * `grid-auto-rows` — size for implicitly-created rows.
   */
  autoRows?: Responsive<string>;
  /**
   * Uniform gap in both axes. Falls back to `rowGap`/`columnGap` when set.
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
  /**
   * `align-items` — how each item sits within its cell on the block axis.
   */
  align?: Responsive<GridAlignItems>;
  /**
   * `justify-items` — how each item sits within its cell on the inline axis.
   */
  justifyItems?: Responsive<GridAlignItems>;
  /**
   * `align-content` — how tracks are distributed when the grid is shorter
   * than its container on the block axis.
   */
  alignContent?: Responsive<GridJustifyContent>;
  /**
   * `justify-content` — how tracks are distributed along the inline axis.
   * Matches Radix/Chakra semantics.
   */
  justify?: Responsive<GridJustifyContent>;
}

/**
 * Full `Grid` props. Generic over the rendered element.
 */
export type GridProps<E extends ElementType = 'div'> = PolymorphicProps<E, GridOwnProps>;

const columnsTemplate = (n: number): string => `repeat(${n}, minmax(0, 1fr))`;
const rowsTemplate = (n: number): string => `repeat(${n}, minmax(0, auto))`;

/**
 * CSS Grid container. Pass `columns={N}` for `repeat(N, minmax(0, 1fr))` or
 * `templateColumns="200px 1fr 200px"` for explicit tracks. `justify` controls
 * `justify-content` (track distribution); use `justifyItems` for per-cell
 * alignment. Children control placement through `LayoutProps.gridColumn` /
 * `gridRow` / `gridArea`.
 */
export const Grid = createLayoutComponent<GridOwnProps>({
  base: grid,
  displayName: 'Grid',
  ownKeys: [
    'columns',
    'rows',
    'templateColumns',
    'templateRows',
    'autoFlow',
    'autoColumns',
    'autoRows',
    'gap',
    'columnGap',
    'rowGap',
    'align',
    'justifyItems',
    'alignContent',
    'justify',
  ],
  resolveStyle: ({
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
  }) => {
    // Explicit templates win over the `columns`/`rows` shorthands.
    const colsValue = templateColumns ?? (columns !== undefined ? columns : undefined);
    const rowsValue = templateRows ?? (rows !== undefined ? rows : undefined);
    return mergeStyles(
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
  },
});
