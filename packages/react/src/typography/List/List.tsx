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

export interface ListBaseProps extends LayoutProps, AsChildProps {
  spacing?: Responsive<SpaceToken>;
  marker?: Responsive<ListMarker>;
  markerColor?: ColorToken;
  className?: string;
  style?: CSSProperties;
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

export const List = forwardRef<HTMLUListElement, ListProps>(ListRender as never);

// ── OrderedList ──────────────────────────────────────────────────────────

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

export const OrderedList = forwardRef<HTMLOListElement, OrderedListProps>(
  OrderedListRender as never,
);

// ── ListItem ─────────────────────────────────────────────────────────────

export interface ListItemProps
  extends LayoutProps,
    AsChildProps,
    Omit<React.LiHTMLAttributes<HTMLLIElement>, keyof LayoutProps | 'color'> {
  className?: string;
  style?: CSSProperties;
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

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(ListItemRender as never);

// ── DescriptionList ──────────────────────────────────────────────────────

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

export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  DescriptionListRender as never,
);

// ── DescriptionTerm / DescriptionDetails ─────────────────────────────────

export interface DescriptionTermProps
  extends LayoutProps,
    AsChildProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof LayoutProps | 'color'> {
  className?: string;
  style?: CSSProperties;
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

export const DescriptionTerm = forwardRef<HTMLElement, DescriptionTermProps>(
  DescriptionTermRender as never,
);

export interface DescriptionDetailsProps
  extends LayoutProps,
    AsChildProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof LayoutProps | 'color'> {
  className?: string;
  style?: CSSProperties;
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

export const DescriptionDetails = forwardRef<HTMLElement, DescriptionDetailsProps>(
  DescriptionDetailsRender as never,
);
