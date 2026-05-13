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

const ALIGN_SELF_MAP: Record<string, string> = {
  auto: 'auto',
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_SELF_MAP: Record<string, string> = {
  auto: 'auto',
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};

const alignSelfResolver = (v: string, _bp: Breakpoint) => ALIGN_SELF_MAP[v] ?? v;
const justifySelfResolver = (v: string, _bp: Breakpoint) => JUSTIFY_SELF_MAP[v] ?? v;
const flexBasisResolver = (v: string, _bp: Breakpoint) => {
  if (v === 'auto' || v === 'content') return v;
  return resolveSize(v as SizeValue);
};

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

/** `--cynosure-lp-{key}-{bp}` for each breakpoint the user provided. */
const emit = <T>(
  value: Responsive<T> | undefined,
  varBase: string,
  transform: (v: T, bp: Breakpoint) => string,
): CSSProperties | undefined => toResponsiveVars(value, varBase, transform);

/**
 * Map every `LayoutProps` entry into its `--cynosure-lp-*-{bp}` CSS custom
 * property form so that `layoutPropsStyle` can pick it up. Unknown / undefined
 * props are skipped.
 *
 * Every layout primitive calls this in its render path.
 */
export const resolveLayoutProps = (props: LayoutProps): CSSProperties | undefined =>
  mergeStyles(
    // padding
    emit(props.padding, 'cynosure-lp-p', spaceResolver),
    emit(props.paddingX, 'cynosure-lp-px', spaceResolver),
    emit(props.paddingY, 'cynosure-lp-py', spaceResolver),
    emit(props.paddingTop, 'cynosure-lp-pt', spaceResolver),
    emit(props.paddingRight, 'cynosure-lp-pr', spaceResolver),
    emit(props.paddingBottom, 'cynosure-lp-pb', spaceResolver),
    emit(props.paddingLeft, 'cynosure-lp-pl', spaceResolver),
    // margin
    emit(props.margin, 'cynosure-lp-m', spaceResolver),
    emit(props.marginX, 'cynosure-lp-mx', spaceResolver),
    emit(props.marginY, 'cynosure-lp-my', spaceResolver),
    emit(props.marginTop, 'cynosure-lp-mt', spaceResolver),
    emit(props.marginRight, 'cynosure-lp-mr', spaceResolver),
    emit(props.marginBottom, 'cynosure-lp-mb', spaceResolver),
    emit(props.marginLeft, 'cynosure-lp-ml', spaceResolver),
    // size
    emit(props.width, 'cynosure-lp-w', sizeResolver),
    emit(props.height, 'cynosure-lp-h', sizeResolver),
    emit(props.minWidth, 'cynosure-lp-minw', sizeResolver),
    emit(props.maxWidth, 'cynosure-lp-maxw', sizeResolver),
    emit(props.minHeight, 'cynosure-lp-minh', sizeResolver),
    emit(props.maxHeight, 'cynosure-lp-maxh', sizeResolver),
    // visual
    emit(props.background, 'cynosure-lp-bg', colorResolver),
    emit(props.color, 'cynosure-lp-fg', colorResolver),
    emit(props.borderColor, 'cynosure-lp-bc', colorResolver),
    emit(props.borderWidth, 'cynosure-lp-bw', borderWidthResolver),
    emit(props.borderStyle, 'cynosure-lp-bs', passthrough as never),
    emit(props.borderRadius, 'cynosure-lp-br', radiusResolver),
    emit(props.boxShadow, 'cynosure-lp-sh', shadowResolver),
    emit(props.opacity, 'cynosure-lp-op', passthrough as never),
    emit(props.overflow, 'cynosure-lp-ov', passthrough as never),
    emit(props.overflowX, 'cynosure-lp-ovx', passthrough as never),
    emit(props.overflowY, 'cynosure-lp-ovy', passthrough as never),
    // display / position
    emit(props.display, 'cynosure-lp-d', passthrough as never),
    emit(props.position, 'cynosure-lp-pos', passthrough as never),
    emit(props.top, 'cynosure-lp-top', sizeResolver as never),
    emit(props.right, 'cynosure-lp-right', sizeResolver as never),
    emit(props.bottom, 'cynosure-lp-bottom', sizeResolver as never),
    emit(props.left, 'cynosure-lp-left', sizeResolver as never),
    emit(props.zIndex, 'cynosure-lp-z', zResolver),
    // grid child hints
    emit(props.gridColumn, 'cynosure-lp-gc', passthrough as never),
    emit(props.gridRow, 'cynosure-lp-gr', passthrough as never),
    emit(props.gridArea, 'cynosure-lp-ga', passthrough as never),
    // flex/grid child hints
    emit(props.flex, 'cynosure-lp-flex', passthrough as never),
    // `cynosure-lp-grow`, not `lp-fg` — the `fg` slug already carries `color`
    // (foreground), and reusing it for `flex-grow` would silently override one
    // of the two whenever a consumer set both `color` and `grow`.
    emit(props.flexGrow, 'cynosure-lp-grow', passthrough as never),
    emit(props.flexShrink, 'cynosure-lp-fs', passthrough as never),
    emit(props.flexBasis, 'cynosure-lp-fb', flexBasisResolver as never),
    emit(props.alignSelf, 'cynosure-lp-as', alignSelfResolver as never),
    emit(props.justifySelf, 'cynosure-lp-js', justifySelfResolver as never),
    emit(props.order, 'cynosure-lp-order', passthrough as never),
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
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'justifySelf',
  'order',
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
