import type { Responsive } from './breakpoints.js';
import type {
  ColorToken,
  LengthValue,
  RadiusToken,
  ShadowToken,
  SizeValue,
  SpaceToken,
  ZIndexToken,
} from './tokens.js';

type MarginValue = SpaceToken | 'auto';
type InsetValue = SpaceToken | '0' | 'auto' | LengthValue;

/**
 * The universal layout-prop superset. Every layout primitive accepts this
 * verbatim; higher primitives (Stack/Inline/…) add their own opinionated props
 * on top.
 *
 * **Stability**: once shipped, breaking changes to this interface require a
 * major-version bump. Adding an optional prop is a minor bump.
 */
export interface LayoutProps {
  // ── padding ───────────────────────────────────────────────────────────
  padding?: Responsive<SpaceToken>;
  paddingX?: Responsive<SpaceToken>;
  paddingY?: Responsive<SpaceToken>;
  paddingTop?: Responsive<SpaceToken>;
  paddingRight?: Responsive<SpaceToken>;
  paddingBottom?: Responsive<SpaceToken>;
  paddingLeft?: Responsive<SpaceToken>;

  // ── margin ────────────────────────────────────────────────────────────
  margin?: Responsive<MarginValue>;
  marginX?: Responsive<MarginValue>;
  marginY?: Responsive<MarginValue>;
  marginTop?: Responsive<MarginValue>;
  marginRight?: Responsive<MarginValue>;
  marginBottom?: Responsive<MarginValue>;
  marginLeft?: Responsive<MarginValue>;

  // ── size ──────────────────────────────────────────────────────────────
  width?: Responsive<SizeValue>;
  height?: Responsive<SizeValue>;
  minWidth?: Responsive<SizeValue>;
  maxWidth?: Responsive<SizeValue>;
  minHeight?: Responsive<SizeValue>;
  maxHeight?: Responsive<SizeValue>;

  // ── visual ────────────────────────────────────────────────────────────
  background?: Responsive<ColorToken>;
  color?: Responsive<ColorToken>;
  borderColor?: Responsive<ColorToken>;
  borderWidth?: Responsive<'0' | '1' | '2' | '4'>;
  borderStyle?: Responsive<'solid' | 'dashed' | 'dotted' | 'none'>;
  borderRadius?: Responsive<RadiusToken>;
  boxShadow?: Responsive<ShadowToken>;
  opacity?: Responsive<number | `${number}`>;
  overflow?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  overflowX?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  overflowY?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;

  // ── display & position ───────────────────────────────────────────────
  display?: Responsive<
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
    | 'none'
    | 'contents'
  >;
  position?: Responsive<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>;
  top?: Responsive<InsetValue>;
  right?: Responsive<InsetValue>;
  bottom?: Responsive<InsetValue>;
  left?: Responsive<InsetValue>;
  zIndex?: Responsive<ZIndexToken>;

  // ── grid child hints ──────────────────────────────────────────────────
  gridColumn?: Responsive<string>;
  gridRow?: Responsive<string>;
  gridArea?: Responsive<string>;
}
