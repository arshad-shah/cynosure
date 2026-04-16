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
export const alignClass = styleVariants({
  start: { textAlign: 'start' },
  center: { textAlign: 'center' },
  end: { textAlign: 'end' },
  justify: { textAlign: 'justify' },
});

export type AlignVariant = keyof typeof alignClass;

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
  WebkitLineClamp: 'var(--lumen-typography-line-clamp, 1)',
});

export const italicClass = style({ fontStyle: 'italic' });

/**
 * Decoration stack. `textDecorationLine` is set separately so underline +
 * strikethrough can coexist; colour is driven by `--lumen-typography-decoration-color`.
 */
export const underlineClass = style({
  textDecorationLine: 'underline',
  textDecorationColor: 'var(--lumen-typography-decoration-color, currentColor)',
  textUnderlineOffset: '0.15em',
});

export const strikethroughClass = style({
  textDecorationLine: 'line-through',
  textDecorationColor: 'var(--lumen-typography-decoration-color, currentColor)',
});

export const underlineAndStrikethrough = style({
  textDecorationLine: 'underline line-through',
  textDecorationColor: 'var(--lumen-typography-decoration-color, currentColor)',
  textUnderlineOffset: '0.15em',
});

/**
 * Body size variants driven by the semantic `font.body.*` composite tokens.
 * The composites expand to flat custom properties in `@lumen/tokens/css`, so
 * we reference them directly here rather than duplicating sizes/weights.
 */
export const bodySize = styleVariants({
  xs: {
    fontFamily: 'var(--lumen-font-body-xs-family)',
    fontSize: 'var(--lumen-font-body-xs-size)',
    lineHeight: 'var(--lumen-font-body-xs-line-height)',
  },
  sm: {
    fontFamily: 'var(--lumen-font-body-sm-family)',
    fontSize: 'var(--lumen-font-body-sm-size)',
    lineHeight: 'var(--lumen-font-body-sm-line-height)',
  },
  md: {
    fontFamily: 'var(--lumen-font-body-md-family)',
    fontSize: 'var(--lumen-font-body-md-size)',
    lineHeight: 'var(--lumen-font-body-md-line-height)',
  },
  lg: {
    fontFamily: 'var(--lumen-font-body-lg-family)',
    fontSize: 'var(--lumen-font-body-lg-size)',
    lineHeight: 'var(--lumen-font-body-lg-line-height)',
  },
  xl: {
    fontFamily: 'var(--lumen-font-body-lg-family)',
    fontSize: 'var(--lumen-font-font-size-xl, var(--lumen-font-size-xl))',
    lineHeight: 'var(--lumen-font-body-lg-line-height)',
  },
});

export type BodySize = keyof typeof bodySize;

/**
 * Overrides applied per font-weight token. Keeps weight orthogonal to size.
 */
export const weightClass = styleVariants({
  regular: { fontWeight: 'var(--lumen-font-weight-regular)' },
  medium: { fontWeight: 'var(--lumen-font-weight-medium)' },
  semibold: { fontWeight: 'var(--lumen-font-weight-semibold)' },
  bold: { fontWeight: 'var(--lumen-font-weight-bold)' },
});

export type WeightVariant = keyof typeof weightClass;

/**
 * Text "variant" (body/caption/overline/lead) applies look tweaks on top of
 * the chosen size. Keeps the size axis orthogonal: you pick a size for scale
 * and a variant for role.
 */
export const textVariant = styleVariants({
  body: {},
  caption: {
    color: vars.color.foreground.muted,
    letterSpacing: 'var(--lumen-letter-spacing-normal)',
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 'var(--lumen-letter-spacing-wide)',
    fontWeight: 'var(--lumen-font-weight-semibold)',
    color: vars.color.foreground.muted,
  },
  lead: {
    color: vars.color.foreground.muted,
    fontWeight: 'var(--lumen-font-weight-regular)',
    lineHeight: 'var(--lumen-line-height-relaxed)',
  },
});

export type TextVariant = keyof typeof textVariant;

/**
 * Heading size variants mapped to the semantic `font.heading.*` composite
 * tokens. Sizes `xs..lg` reuse body sizes so `<Heading level={1} size="xs">`
 * can render an h1 with body text styling (the decoupling the spec requires).
 */
export const headingSize = styleVariants({
  xs: {
    fontFamily: 'var(--lumen-font-body-xs-family)',
    fontSize: 'var(--lumen-font-body-xs-size)',
    lineHeight: 'var(--lumen-font-body-xs-line-height)',
  },
  sm: {
    fontFamily: 'var(--lumen-font-body-sm-family)',
    fontSize: 'var(--lumen-font-body-sm-size)',
    lineHeight: 'var(--lumen-font-body-sm-line-height)',
  },
  md: {
    fontFamily: 'var(--lumen-font-body-md-family)',
    fontSize: 'var(--lumen-font-body-md-size)',
    lineHeight: 'var(--lumen-font-body-md-line-height)',
  },
  lg: {
    fontFamily: 'var(--lumen-font-heading-6-family)',
    fontSize: 'var(--lumen-font-heading-6-size)',
    lineHeight: 'var(--lumen-font-heading-6-line-height)',
    fontWeight: 'var(--lumen-font-heading-6-weight)',
    letterSpacing: 'var(--lumen-font-heading-6-letter-spacing)',
  },
  xl: {
    fontFamily: 'var(--lumen-font-heading-5-family)',
    fontSize: 'var(--lumen-font-heading-5-size)',
    lineHeight: 'var(--lumen-font-heading-5-line-height)',
    fontWeight: 'var(--lumen-font-heading-5-weight)',
    letterSpacing: 'var(--lumen-font-heading-5-letter-spacing)',
  },
  '2xl': {
    fontFamily: 'var(--lumen-font-heading-4-family)',
    fontSize: 'var(--lumen-font-heading-4-size)',
    lineHeight: 'var(--lumen-font-heading-4-line-height)',
    fontWeight: 'var(--lumen-font-heading-4-weight)',
    letterSpacing: 'var(--lumen-font-heading-4-letter-spacing)',
  },
  '3xl': {
    fontFamily: 'var(--lumen-font-heading-3-family)',
    fontSize: 'var(--lumen-font-heading-3-size)',
    lineHeight: 'var(--lumen-font-heading-3-line-height)',
    fontWeight: 'var(--lumen-font-heading-3-weight)',
    letterSpacing: 'var(--lumen-font-heading-3-letter-spacing)',
  },
  '4xl': {
    fontFamily: 'var(--lumen-font-heading-2-family)',
    fontSize: 'var(--lumen-font-heading-2-size)',
    lineHeight: 'var(--lumen-font-heading-2-line-height)',
    fontWeight: 'var(--lumen-font-heading-2-weight)',
    letterSpacing: 'var(--lumen-font-heading-2-letter-spacing)',
  },
  '5xl': {
    fontFamily: 'var(--lumen-font-heading-1-family)',
    fontSize: 'var(--lumen-font-heading-1-size)',
    lineHeight: 'var(--lumen-font-heading-1-line-height)',
    fontWeight: 'var(--lumen-font-heading-1-weight)',
    letterSpacing: 'var(--lumen-font-heading-1-letter-spacing)',
  },
});

export type HeadingSize = keyof typeof headingSize;

/** Default heading size per semantic level. */
export const HEADING_LEVEL_DEFAULT_SIZE = {
  1: '5xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: 'xl',
  6: 'lg',
} as const satisfies Record<1 | 2 | 3 | 4 | 5 | 6, HeadingSize>;
