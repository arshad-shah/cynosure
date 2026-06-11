import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Shared base used by every typography component. The default `color` uses
 * `inherit` so nesting inside a coloured container flows through; override by
 * setting the `color` LayoutProp.
 */
export const typographyBase = style({
  margin: 0,
  padding: 0,
  color: 'inherit',
});

/**
 * `text-align` variants used by Text, Heading, Link. Horizontal alignment is
 * the only recipe these components share — colour/size/weight are either
 * intrinsic to the semantic token or delegated to `LayoutProps`.
 */
/**
 * Text alignment variants. Declared as an explicit string union so the
 * docs site's PropsTable extracts the literal members (otherwise
 * react-docgen-typescript falls back to the unhelpful `enum` placeholder).
 */
export type AlignVariant = 'start' | 'center' | 'end' | 'justify';

export const alignClass: Record<AlignVariant, string> = styleVariants({
  start: { textAlign: 'start' },
  center: { textAlign: 'center' },
  end: { textAlign: 'end' },
  justify: { textAlign: 'justify' },
});

/**
 * Truncate-to-one-line via the classic `white-space: nowrap` trick.
 * `truncate={n > 1}` goes through `lineClamp` instead, which relies on
 * `-webkit-line-clamp` + per-instance line-count CSS var.
 */
export const truncateOne = style({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  minWidth: 0,
});

export const lineClamp = style({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 'var(--cynosure-typography-line-clamp, 1)',
});

export const italicClass = style({ fontStyle: 'italic' });

/**
 * Decoration stack. `textDecorationLine` is set separately so underline +
 * strikethrough can coexist; colour is driven by `--cynosure-typography-decoration-color`.
 */
export const underlineClass = style({
  textDecorationLine: 'underline',
  textDecorationColor: 'var(--cynosure-typography-decoration-color, currentColor)',
  textUnderlineOffset: '0.15em',
});

export const strikethroughClass = style({
  textDecorationLine: 'line-through',
  textDecorationColor: 'var(--cynosure-typography-decoration-color, currentColor)',
});

export const underlineAndStrikethrough = style({
  textDecorationLine: 'underline line-through',
  textDecorationColor: 'var(--cynosure-typography-decoration-color, currentColor)',
  textUnderlineOffset: '0.15em',
});

/**
 * Body text size. Declared as an explicit string union for ts-docgen
 * visibility — the matching `bodySize` style map is then constrained to keep
 * the two in sync at compile time.
 */
export type BodySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Body size variants driven by the semantic `font.body.*` composite tokens.
 * The composites expand to flat custom properties in `@arshad-shah/cynosure-tokens/css`, so
 * we reference them directly here rather than duplicating sizes/weights.
 */
export const bodySize: Record<BodySize, string> = styleVariants({
  xs: {
    fontFamily: vars.font.body.xs.family,
    fontSize: vars.font.body.xs.size,
    lineHeight: vars.font.body.xs.lineHeight,
  },
  sm: {
    fontFamily: vars.font.body.sm.family,
    fontSize: vars.font.body.sm.size,
    lineHeight: vars.font.body.sm.lineHeight,
  },
  md: {
    fontFamily: vars.font.body.md.family,
    fontSize: vars.font.body.md.size,
    lineHeight: vars.font.body.md.lineHeight,
  },
  lg: {
    fontFamily: vars.font.body.lg.family,
    fontSize: vars.font.body.lg.size,
    lineHeight: vars.font.body.lg.lineHeight,
  },
  xl: {
    fontFamily: vars.font.body.lg.family,
    fontSize: 'var(--cynosure-font-font-size-xl, var(--cynosure-font-size-xl))',
    lineHeight: vars.font.body.lg.lineHeight,
  },
});

/**
 * Font-weight tokens recognised by the typography components.
 */
export type WeightVariant = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Overrides applied per font-weight token. Keeps weight orthogonal to size.
 */
export const weightClass: Record<WeightVariant, string> = styleVariants({
  regular: { fontWeight: vars.font.weight.regular },
  medium: { fontWeight: vars.font.weight.medium },
  semibold: { fontWeight: vars.font.weight.semibold },
  bold: { fontWeight: vars.font.weight.bold },
});

/**
 * Semantic text role applied on top of the chosen size — `body` for default
 * copy, `caption` for fine print, `overline` for short uppercase labels,
 * `lead` for an introductory paragraph.
 */
export type TextVariant = 'body' | 'caption' | 'overline' | 'lead';

/**
 * Text "variant" (body/caption/overline/lead) applies look tweaks on top of
 * the chosen size. Keeps the size axis orthogonal: you pick a size for scale
 * and a variant for role.
 */
export const textVariant: Record<TextVariant, string> = styleVariants({
  body: {},
  caption: {
    color: vars.color.foreground.muted,
    letterSpacing: vars.letter.spacing.normal,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: vars.letter.spacing.wide,
    fontWeight: vars.font.weight.semibold,
    color: vars.color.foreground.muted,
  },
  lead: {
    color: vars.color.foreground.muted,
    fontWeight: vars.font.weight.regular,
    lineHeight: vars.line.height.relaxed,
  },
});

/**
 * Heading display size. Decoupled from the semantic level so `<Heading
 * level={1} size="xs">` is valid (a heading whose role is h1 but whose visual
 * weight is small).
 */
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

/**
 * Heading size variants mapped to the semantic `font.heading.*` composite
 * tokens. Sizes `xs..lg` reuse body sizes so `<Heading level={1} size="xs">`
 * can render an h1 with body text styling (the decoupling the spec requires).
 */
export const headingSize: Record<HeadingSize, string> = styleVariants({
  xs: {
    fontFamily: vars.font.body.xs.family,
    fontSize: vars.font.body.xs.size,
    lineHeight: vars.font.body.xs.lineHeight,
  },
  sm: {
    fontFamily: vars.font.body.sm.family,
    fontSize: vars.font.body.sm.size,
    lineHeight: vars.font.body.sm.lineHeight,
  },
  md: {
    fontFamily: vars.font.body.md.family,
    fontSize: vars.font.body.md.size,
    lineHeight: vars.font.body.md.lineHeight,
  },
  lg: {
    fontFamily: vars.font.heading['6'].family,
    fontSize: vars.font.heading['6'].size,
    lineHeight: vars.font.heading['6'].lineHeight,
    fontWeight: vars.font.heading['6'].weight,
    letterSpacing: vars.font.heading['6'].letterSpacing,
  },
  xl: {
    fontFamily: vars.font.heading['5'].family,
    fontSize: vars.font.heading['5'].size,
    lineHeight: vars.font.heading['5'].lineHeight,
    fontWeight: vars.font.heading['5'].weight,
    letterSpacing: vars.font.heading['5'].letterSpacing,
  },
  '2xl': {
    fontFamily: vars.font.heading['4'].family,
    fontSize: vars.font.heading['4'].size,
    lineHeight: vars.font.heading['4'].lineHeight,
    fontWeight: vars.font.heading['4'].weight,
    letterSpacing: vars.font.heading['4'].letterSpacing,
  },
  '3xl': {
    fontFamily: vars.font.heading['3'].family,
    fontSize: vars.font.heading['3'].size,
    lineHeight: vars.font.heading['3'].lineHeight,
    fontWeight: vars.font.heading['3'].weight,
    letterSpacing: vars.font.heading['3'].letterSpacing,
  },
  '4xl': {
    fontFamily: vars.font.heading['2'].family,
    fontSize: vars.font.heading['2'].size,
    lineHeight: vars.font.heading['2'].lineHeight,
    fontWeight: vars.font.heading['2'].weight,
    letterSpacing: vars.font.heading['2'].letterSpacing,
  },
  '5xl': {
    fontFamily: vars.font.heading['1'].family,
    fontSize: vars.font.heading['1'].size,
    lineHeight: vars.font.heading['1'].lineHeight,
    fontWeight: vars.font.heading['1'].weight,
    letterSpacing: vars.font.heading['1'].letterSpacing,
  },
});

/** Default heading size per semantic level. */
export const HEADING_LEVEL_DEFAULT_SIZE = {
  1: '5xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: 'xl',
  6: 'lg',
} as const satisfies Record<1 | 2 | 3 | 4 | 5 | 6, HeadingSize>;
