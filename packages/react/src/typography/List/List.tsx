import {
  type CSSProperties,
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
  type SpaceToken,
  mergeStyles,
  resolveColor,
  resolveSpace,
  toResponsiveVars,
} from '../../primitives/layout/shared/index.js';
import type { ColorToken } from '../../primitives/layout/shared/index.js';
import { cn } from '../../utils/cn.js';
import {
  descriptionDetails,
  descriptionListBase,
  descriptionTerm,
  listBase,
  listItemBase,
} from './List.css.js';

export type ListMarker =
  | 'disc'
  | 'circle'
  | 'square'
  | 'none'
  | 'decimal'
  | 'lower-alpha'
  | 'upper-alpha';

/**
 * Shared props for every list variant (`List`, `OrderedList`, `DescriptionList`).
 */
export interface ListBaseProps extends LayoutProps, AsChildProps {
  /**
   * Vertical gap between list items, from the spacing scale.
   * @default "2"
   */
  spacing?: Responsive<SpaceToken>;
  /**
   * `list-style-type`. `List` defaults to `disc`; `OrderedList` defaults to
   * `decimal`. Use `none` to hide markers entirely.
   */
  marker?: Responsive<ListMarker>;
  /**
   * Colour for the marker glyph (`::marker`). Independent of text colour.
   */
  markerColor?: ColorToken;
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * List items.
   */
  children?: ReactNode;
}

// Widen `process` locally so DTS (rollup-plugin-dts) doesn't require
// `@types/node`; mirrors the pattern in `useControllableState`.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

const devWarnAs = (as: unknown, element: string): void => {
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
    if (typeof as === 'string') {
      // eslint-disable-next-line no-console
      console.error(
        `[cynosure] Do not pass \`as="${as}"\` to <${element}>. List components are bound to their semantic element; use the matching component instead.`,
      );
    }
  }
};

const buildListStyle = (
  spacing: Responsive<SpaceToken> | undefined,
  marker: Responsive<ListMarker> | undefined,
  markerColor: ColorToken | undefined,
  style: CSSProperties | undefined,
): CSSProperties | undefined =>
  mergeStyles(
    toResponsiveVars(spacing, 'cynosure-list-spacing', (v) => resolveSpace(v)),
    toResponsiveVars(marker, 'cynosure-list-marker', (v) => v),
    markerColor !== undefined
      ? ({ '--cynosure-list-marker-color': resolveColor(markerColor) } as CSSProperties)
      : undefined,
    style,
  );

// ── List (unordered) ─────────────────────────────────────────────────────

/**
 * Props for the unordered `<ul>` `List` — `ListBaseProps` plus remaining
 * `<ul>` HTML attributes minus Cynosure-owned keys.
 */
export interface ListProps
  extends ListBaseProps,
    Omit<React.HTMLAttributes<HTMLUListElement>, keyof ListBaseProps | 'color'> {}

type AnyListProps = ListBaseProps & { [key: string]: unknown };

const ListRender = (props: AnyListProps, ref: ForwardedRef<HTMLUListElement>): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    spacing = '2',
    marker,
    markerColor,
    as: _asIgnored,
    ...rest
  } = props as AnyListProps & { as?: unknown };
  devWarnAs(_asIgnored, 'List');

  const resolvedMarker = marker ?? 'disc';
  const listStyle = buildListStyle(spacing, resolvedMarker, markerColor, style);
  const markerHidden = typeof resolvedMarker === 'string' && resolvedMarker === 'none';

  return (
    <Box
      ref={ref as never}
      as="ul"
      asChild={asChild}
      className={cn(listBase, className)}
      style={listStyle}
      data-marker-hidden={markerHidden ? 'true' : undefined}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * Unordered list. Renders `<ul>` with disc markers by default; pass
 * `marker="none"` to hide bullets, or `marker="square"`/`"circle"` for the
 * standard variants. Spacing is controlled by `spacing`, not by item margin,
 * so dividers and other inserted content stay aligned.
 */
export const List = forwardRef<HTMLUListElement, ListProps>(ListRender as never);

// ── OrderedList ──────────────────────────────────────────────────────────

/**
 * Props for the ordered `<ol>` `OrderedList` — `ListBaseProps` plus remaining
 * `<ol>` HTML attributes (including `start`, `reversed`, `type`).
 */
export interface OrderedListProps
  extends ListBaseProps,
    Omit<React.OlHTMLAttributes<HTMLOListElement>, keyof ListBaseProps | 'color'> {}

type AnyOrderedListProps = ListBaseProps & {
  start?: number;
  reversed?: boolean;
  type?: 'a' | 'A' | 'i' | 'I' | '1';
  [key: string]: unknown;
};

const OrderedListRender = (
  props: AnyOrderedListProps,
  ref: ForwardedRef<HTMLOListElement>,
): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    spacing = '2',
    marker,
    markerColor,
    start,
    reversed,
    type,
    as: _asIgnored,
    ...rest
  } = props as AnyOrderedListProps & { as?: unknown };
  devWarnAs(_asIgnored, 'OrderedList');

  const resolvedMarker = marker ?? 'decimal';
  const listStyle = buildListStyle(spacing, resolvedMarker, markerColor, style);
  const markerHidden = typeof resolvedMarker === 'string' && resolvedMarker === 'none';

  return (
    <Box
      ref={ref as never}
      as="ol"
      asChild={asChild}
      className={cn(listBase, className)}
      style={listStyle}
      data-marker-hidden={markerHidden ? 'true' : undefined}
      start={start}
      reversed={reversed}
      type={type}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * Ordered list. Renders `<ol>` with decimal markers by default. Pass
 * native `start`, `reversed`, or `type` for numbering tweaks, or override
 * `marker` for alpha / roman styles.
 */
export const OrderedList = forwardRef<HTMLOListElement, OrderedListProps>(
  OrderedListRender as never,
);

// ── ListItem ─────────────────────────────────────────────────────────────

/**
 * Props for `<li>` items rendered inside `List` / `OrderedList`.
 */
export interface ListItemProps
  extends LayoutProps,
    AsChildProps,
    Omit<React.LiHTMLAttributes<HTMLLIElement>, keyof LayoutProps | 'color'> {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Item content.
   */
  children?: ReactNode;
}

type AnyListItemProps = ListItemProps & { [key: string]: unknown };

const ListItemRender = (
  props: AnyListItemProps,
  ref: ForwardedRef<HTMLLIElement>,
): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    as: _asIgnored,
    ...rest
  } = props as AnyListItemProps & { as?: unknown };
  return (
    <Box
      ref={ref as never}
      as="li"
      asChild={asChild}
      className={cn(listItemBase, className)}
      style={style}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * `<li>` row inside `List` or `OrderedList`. Pair with `LayoutProps` for
 * per-item padding/background tweaks; the parent owns spacing and markers.
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(ListItemRender as never);

// ── DescriptionList ──────────────────────────────────────────────────────

/**
 * Props for the `<dl>` `DescriptionList` — `ListBaseProps` minus the marker
 * (description lists don't have list markers) plus `<dl>` HTML attributes.
 */
export interface DescriptionListProps
  extends ListBaseProps,
    Omit<React.HTMLAttributes<HTMLDListElement>, keyof ListBaseProps | 'color'> {}

type AnyDescriptionListProps = ListBaseProps & { [key: string]: unknown };

const DescriptionListRender = (
  props: AnyDescriptionListProps,
  ref: ForwardedRef<HTMLDListElement>,
): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    spacing = '2',
    marker: _marker,
    markerColor,
    as: _asIgnored,
    ...rest
  } = props as AnyDescriptionListProps & { as?: unknown };
  devWarnAs(_asIgnored, 'DescriptionList');

  const listStyle = buildListStyle(spacing, undefined, markerColor, style);

  return (
    <Box
      ref={ref as never}
      as="dl"
      asChild={asChild}
      className={cn(descriptionListBase, className)}
      style={listStyle}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * Renders `<dl>` for term / definition pairs. Compose with
 * `DescriptionTerm` (`<dt>`) and `DescriptionDetails` (`<dd>`). The `marker`
 * prop is accepted for type compatibility with the base but is ignored —
 * `<dl>` has no list-marker.
 */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  DescriptionListRender as never,
);

// ── DescriptionTerm / DescriptionDetails ─────────────────────────────────

/**
 * Props for the `<dt>` term row inside a `DescriptionList`.
 */
export interface DescriptionTermProps
  extends LayoutProps,
    AsChildProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof LayoutProps | 'color'> {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Term label content.
   */
  children?: ReactNode;
}

type AnyDescriptionTermProps = DescriptionTermProps & { [key: string]: unknown };

const DescriptionTermRender = (
  props: AnyDescriptionTermProps,
  ref: ForwardedRef<HTMLElement>,
): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    as: _asIgnored,
    ...rest
  } = props as AnyDescriptionTermProps & { as?: unknown };
  return (
    <Box
      ref={ref as never}
      as="dt"
      asChild={asChild}
      className={cn(descriptionTerm, className)}
      style={style}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * `<dt>` term row used inside `DescriptionList`. Carries the term label that
 * pairs with one or more `DescriptionDetails` siblings.
 */
export const DescriptionTerm = forwardRef<HTMLElement, DescriptionTermProps>(
  DescriptionTermRender as never,
);

/**
 * Props for the `<dd>` description row inside a `DescriptionList`.
 */
export interface DescriptionDetailsProps
  extends LayoutProps,
    AsChildProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof LayoutProps | 'color'> {
  /**
   * Additional class names appended after Cynosure's base classes.
   */
  className?: string;
  /**
   * Inline style overrides merged last.
   */
  style?: CSSProperties;
  /**
   * Definition / detail content for the preceding term.
   */
  children?: ReactNode;
}

type AnyDescriptionDetailsProps = DescriptionDetailsProps & { [key: string]: unknown };

const DescriptionDetailsRender = (
  props: AnyDescriptionDetailsProps,
  ref: ForwardedRef<HTMLElement>,
): ReactElement => {
  const {
    asChild,
    className,
    style,
    children,
    as: _asIgnored,
    ...rest
  } = props as AnyDescriptionDetailsProps & { as?: unknown };
  return (
    <Box
      ref={ref as never}
      as="dd"
      asChild={asChild}
      className={cn(descriptionDetails, className)}
      style={style}
      {...rest}
    >
      {children}
    </Box>
  );
};

/**
 * `<dd>` description row used inside `DescriptionList`. Carries the
 * definition / detail content for the preceding `DescriptionTerm`.
 */
export const DescriptionDetails = forwardRef<HTMLElement, DescriptionDetailsProps>(
  DescriptionDetailsRender as never,
);
