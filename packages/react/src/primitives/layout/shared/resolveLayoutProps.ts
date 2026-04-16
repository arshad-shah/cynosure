import type { CSSProperties } from 'react';
import type { Breakpoint, Responsive } from './breakpoints.js';
import { mergeStyles, toResponsiveVars } from './responsive.js';
import {
  type ColorToken,
  type RadiusToken,
  type ShadowToken,
  type SizeValue,
  type SpaceToken,
  type ZIndexToken,
  resolveColor,
  resolveRadius,
  resolveShadow,
  resolveSize,
  resolveSpace,
  resolveZIndex,
} from './tokens.js';
import type { LayoutProps } from './types.js';

const BORDER_WIDTHS: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '4': '4px',
};

const asString = (v: unknown): string => {
  if (typeof v === 'number') return String(v);
  return String(v);
};

const passthrough = (v: unknown) => asString(v);

const spaceResolver = (v: SpaceToken | 'auto', _bp: Breakpoint) =>
  v === 'auto' ? 'auto' : resolveSpace(v as SpaceToken);

const sizeResolver = (v: SizeValue, _bp: Breakpoint) => resolveSize(v);

const colorResolver = (v: ColorToken, _bp: Breakpoint) => resolveColor(v);

const borderWidthResolver = (v: '0' | '1' | '2' | '4', _bp: Breakpoint) =>
  BORDER_WIDTHS[v] ?? `${v}px`;

const radiusResolver = (v: RadiusToken, _bp: Breakpoint) => resolveRadius(v);
const shadowResolver = (v: ShadowToken, _bp: Breakpoint) => resolveShadow(v);
const zResolver = (v: ZIndexToken, _bp: Breakpoint) => resolveZIndex(v);

/** `--lumen-lp-{key}-{bp}` for each breakpoint the user provided. */
const emit = <T>(
  value: Responsive<T> | undefined,
  varBase: string,
  transform: (v: T, bp: Breakpoint) => string,
): CSSProperties | undefined => toResponsiveVars(value, varBase, transform);

/**
 * Map every `LayoutProps` entry into its `--lumen-lp-*-{bp}` CSS custom
 * property form so that `layoutPropsStyle` can pick it up. Unknown / undefined
 * props are skipped.
 *
 * Every layout primitive calls this in its render path.
 */
export const resolveLayoutProps = (props: LayoutProps): CSSProperties | undefined =>
  mergeStyles(
    // padding
    emit(props.padding, 'lumen-lp-p', spaceResolver),
    emit(props.paddingX, 'lumen-lp-px', spaceResolver),
    emit(props.paddingY, 'lumen-lp-py', spaceResolver),
    emit(props.paddingTop, 'lumen-lp-pt', spaceResolver),
    emit(props.paddingRight, 'lumen-lp-pr', spaceResolver),
    emit(props.paddingBottom, 'lumen-lp-pb', spaceResolver),
    emit(props.paddingLeft, 'lumen-lp-pl', spaceResolver),
    // margin
    emit(props.margin, 'lumen-lp-m', spaceResolver),
    emit(props.marginX, 'lumen-lp-mx', spaceResolver),
    emit(props.marginY, 'lumen-lp-my', spaceResolver),
    emit(props.marginTop, 'lumen-lp-mt', spaceResolver),
    emit(props.marginRight, 'lumen-lp-mr', spaceResolver),
    emit(props.marginBottom, 'lumen-lp-mb', spaceResolver),
    emit(props.marginLeft, 'lumen-lp-ml', spaceResolver),
    // size
    emit(props.width, 'lumen-lp-w', sizeResolver),
    emit(props.height, 'lumen-lp-h', sizeResolver),
    emit(props.minWidth, 'lumen-lp-minw', sizeResolver),
    emit(props.maxWidth, 'lumen-lp-maxw', sizeResolver),
    emit(props.minHeight, 'lumen-lp-minh', sizeResolver),
    emit(props.maxHeight, 'lumen-lp-maxh', sizeResolver),
    // visual
    emit(props.background, 'lumen-lp-bg', colorResolver),
    emit(props.color, 'lumen-lp-fg', colorResolver),
    emit(props.borderColor, 'lumen-lp-bc', colorResolver),
    emit(props.borderWidth, 'lumen-lp-bw', borderWidthResolver),
    emit(props.borderStyle, 'lumen-lp-bs', passthrough as never),
    emit(props.borderRadius, 'lumen-lp-br', radiusResolver),
    emit(props.boxShadow, 'lumen-lp-sh', shadowResolver),
    emit(props.opacity, 'lumen-lp-op', passthrough as never),
    emit(props.overflow, 'lumen-lp-ov', passthrough as never),
    emit(props.overflowX, 'lumen-lp-ovx', passthrough as never),
    emit(props.overflowY, 'lumen-lp-ovy', passthrough as never),
    // display / position
    emit(props.display, 'lumen-lp-d', passthrough as never),
    emit(props.position, 'lumen-lp-pos', passthrough as never),
    emit(props.top, 'lumen-lp-top', sizeResolver as never),
    emit(props.right, 'lumen-lp-right', sizeResolver as never),
    emit(props.bottom, 'lumen-lp-bottom', sizeResolver as never),
    emit(props.left, 'lumen-lp-left', sizeResolver as never),
    emit(props.zIndex, 'lumen-lp-z', zResolver),
    // grid child hints
    emit(props.gridColumn, 'lumen-lp-gc', passthrough as never),
    emit(props.gridRow, 'lumen-lp-gr', passthrough as never),
    emit(props.gridArea, 'lumen-lp-ga', passthrough as never),
  );

/**
 * Keys consumed by `resolveLayoutProps` — useful for stripping them out of a
 * props object before spreading DOM attributes.
 */
export const LAYOUT_PROP_KEYS = new Set<keyof LayoutProps>([
  'padding',
  'paddingX',
  'paddingY',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginX',
  'marginY',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'background',
  'color',
  'borderColor',
  'borderWidth',
  'borderStyle',
  'borderRadius',
  'boxShadow',
  'opacity',
  'overflow',
  'overflowX',
  'overflowY',
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'gridColumn',
  'gridRow',
  'gridArea',
]);

export const splitLayoutProps = <P extends Partial<LayoutProps>>(
  props: P,
): { layoutProps: LayoutProps; rest: Omit<P, keyof LayoutProps> } => {
  const layoutProps: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    const value = (props as Record<string, unknown>)[key];
    if (LAYOUT_PROP_KEYS.has(key as keyof LayoutProps)) {
      layoutProps[key] = value;
    } else {
      rest[key] = value;
    }
  }
  return {
    layoutProps: layoutProps as LayoutProps,
    rest: rest as Omit<P, keyof LayoutProps>,
  };
};
