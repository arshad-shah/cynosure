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
 * Every prop accepts a single value or a per-breakpoint `Responsive<T>` object
 * — `padding="4"` applies at every breakpoint; `padding={{ base: "2", md: "4" }}`
 * tightens on mobile and relaxes on `md+`. See the [Type reference](/reference/types/)
 * for the token enumerations.
 *
 * **Stability**: once shipped, breaking changes to this interface require a
 * major-version bump. Adding an optional prop is a minor bump.
 */
export interface LayoutProps {
  // ── padding ───────────────────────────────────────────────────────────
  /** Padding on all four sides. Token from the spacing scale. */
  padding?: Responsive<SpaceToken>;
  /** Horizontal padding (left + right). Overrides `padding` on the X axis. */
  paddingX?: Responsive<SpaceToken>;
  /** Vertical padding (top + bottom). Overrides `padding` on the Y axis. */
  paddingY?: Responsive<SpaceToken>;
  /** Padding on the top edge. Beats `padding` / `paddingY`. */
  paddingTop?: Responsive<SpaceToken>;
  /** Padding on the right (inline-end in RTL) edge. */
  paddingRight?: Responsive<SpaceToken>;
  /** Padding on the bottom edge. */
  paddingBottom?: Responsive<SpaceToken>;
  /** Padding on the left (inline-start in RTL) edge. */
  paddingLeft?: Responsive<SpaceToken>;

  // ── margin ────────────────────────────────────────────────────────────
  /** Margin on all four sides. Accepts the spacing scale or `"auto"`. */
  margin?: Responsive<MarginValue>;
  /** Horizontal margin (left + right). Use `"auto"` to centre. */
  marginX?: Responsive<MarginValue>;
  /** Vertical margin (top + bottom). */
  marginY?: Responsive<MarginValue>;
  /** Margin on the top edge. */
  marginTop?: Responsive<MarginValue>;
  /** Margin on the right edge. */
  marginRight?: Responsive<MarginValue>;
  /** Margin on the bottom edge. */
  marginBottom?: Responsive<MarginValue>;
  /** Margin on the left edge. */
  marginLeft?: Responsive<MarginValue>;

  // ── size ──────────────────────────────────────────────────────────────
  /** Element width. Accepts a `SpaceToken`, `LengthValue`, or named alias. */
  width?: Responsive<SizeValue>;
  /** Element height. Accepts a `SpaceToken`, `LengthValue`, or named alias. */
  height?: Responsive<SizeValue>;
  /** Minimum width — useful for preventing flex children from collapsing. */
  minWidth?: Responsive<SizeValue>;
  /** Maximum width — `"prose"` caps to a comfortable reading measure. */
  maxWidth?: Responsive<SizeValue>;
  /** Minimum height. */
  minHeight?: Responsive<SizeValue>;
  /** Maximum height. */
  maxHeight?: Responsive<SizeValue>;

  // ── visual ────────────────────────────────────────────────────────────
  /** Background colour. Use a `ColorToken` like `"bg.surface"` for theme awareness. */
  background?: Responsive<ColorToken>;
  /** Text colour. Inherits unless set. */
  color?: Responsive<ColorToken>;
  /** Border colour. Pair with `borderWidth` to make the border visible. */
  borderColor?: Responsive<ColorToken>;
  /** Border thickness in scale steps. */
  borderWidth?: Responsive<'0' | '1' | '2' | '4'>;
  /** Border line style. */
  borderStyle?: Responsive<'solid' | 'dashed' | 'dotted' | 'none'>;
  /** Corner rounding token. */
  borderRadius?: Responsive<RadiusToken>;
  /** Drop-shadow token from the elevation scale. */
  boxShadow?: Responsive<ShadowToken>;
  /** Opacity 0–1. Use sparingly — prefer surface tokens over translucency. */
  opacity?: Responsive<number | `${number}`>;
  /** How content that exceeds the box is handled. */
  overflow?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  /** Horizontal-axis overflow control. Overrides `overflow` for the X axis. */
  overflowX?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;
  /** Vertical-axis overflow control. */
  overflowY?: Responsive<'visible' | 'hidden' | 'auto' | 'scroll'>;

  // ── display & position ───────────────────────────────────────────────
  /** CSS `display` value. `"contents"` removes the element's box from layout. */
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
  /** CSS `position`. Pair with `top`/`right`/`bottom`/`left` for placement. */
  position?: Responsive<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>;
  /** Top inset (when positioned). Accepts a `SpaceToken`, `"auto"`, `"0"`, or `LengthValue`. */
  top?: Responsive<InsetValue>;
  /** Right inset (when positioned). */
  right?: Responsive<InsetValue>;
  /** Bottom inset (when positioned). */
  bottom?: Responsive<InsetValue>;
  /** Left inset (when positioned). */
  left?: Responsive<InsetValue>;
  /** Stacking-context layer token (`"modal"`, `"tooltip"`, …). */
  zIndex?: Responsive<ZIndexToken>;

  // ── grid child hints ──────────────────────────────────────────────────
  /** Grid-column shorthand (e.g. `"1 / 3"`, `"span 2"`). */
  gridColumn?: Responsive<string>;
  /** Grid-row shorthand. */
  gridRow?: Responsive<string>;
  /** Named grid area. */
  gridArea?: Responsive<string>;

  // ── flex/grid child hints ─────────────────────────────────────────────
  /** Shorthand: `1 | auto | none | initial | <css>`. Resolves to `flex` on the child. */
  flex?: Responsive<'1' | 'auto' | 'none' | 'initial' | (string & {})>;
  /** Grow factor inside a flex container. */
  flexGrow?: Responsive<number | `${number}`>;
  /** Shrink factor inside a flex container. */
  flexShrink?: Responsive<number | `${number}`>;
  /** Initial main-axis size before grow/shrink. */
  flexBasis?: Responsive<SpaceToken | SizeValue | 'auto' | 'content'>;
  /** Override `align-items` for a single child. */
  alignSelf?: Responsive<'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  /** Override `justify-items` for a single child (grid). */
  justifySelf?: Responsive<'auto' | 'start' | 'center' | 'end' | 'stretch'>;
  /** Flex/grid child reorder index. */
  order?: Responsive<number | `${number}`>;
}
