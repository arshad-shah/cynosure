import {
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { Slot } from '../../primitives/Slot.js';
import { cn } from '../../utils/cn.js';
import {
  cardBody,
  cardDescription,
  cardFooter,
  cardHeader,
  cardHorizontalImage,
  cardImage,
  cardImageWrap,
  cardInteractive,
  cardPaddingSize,
  cardRoot,
  cardTitle,
  cardVariant,
} from './Card.css.js';

export type CardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardOrientation = 'vertical' | 'horizontal';

/** Props for the {@link Card} container that groups related content. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual treatment. `outlined` uses a border, `elevated` adds a shadow,
   * `filled` paints a subtle surface tint, `ghost` is borderless.
   * @default "outlined"
   */
  variant?: CardVariant;
  /**
   * Internal padding scale applied to the card and its standard parts.
   * @default "md"
   */
  size?: CardSize;
  /**
   * Lays children left-to-right (e.g. image beside body) instead of top-to-bottom.
   * @default "vertical"
   */
  orientation?: CardOrientation;
  /**
   * Adds hover/focus affordances and a `tabIndex={0}` so the whole card is
   * keyboard-focusable. Combine with an `onClick` or wrap in a link.
   * @default false
   */
  interactive?: boolean;
  /**
   * Render the props onto the immediate child via Slot composition instead of
   * a wrapping `div`. Useful for turning the card into an `<a>` or `<button>`.
   * @default false
   */
  asChild?: boolean;
}

/**
 * Card is a surface that groups related information into a single, scannable
 * unit. Use it for media tiles, summaries, list rows, or interactive entry
 * points. Combine with `CardHeader`, `CardBody`, `CardFooter`, `CardImage`,
 * and `CardMedia` for consistent internal spacing.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'outlined',
    size = 'md',
    orientation = 'vertical',
    interactive = false,
    asChild = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Comp = (asChild ? Slot : 'div') as unknown as 'div';
  const classes = cn(
    cardRoot,
    cardVariant[variant],
    cardPaddingSize[size],
    interactive ? cardInteractive : undefined,
    className,
  );

  return (
    <Comp
      ref={ref as never}
      data-orientation={orientation}
      data-interactive={interactive ? 'true' : undefined}
      className={classes}
      {...(interactive && !asChild ? { tabIndex: 0 } : {})}
      {...rest}
    >
      {children}
    </Comp>
  );
});

/** Props for the {@link CardHeader} region (typically holds title + actions). */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

/** Top region of a {@link Card}; reserved for title, description, and action affordances. */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardHeader, className)} {...rest} />;
});

/** Props for the main content area of a {@link Card}. */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

/** Main content region of a {@link Card}. Fills remaining vertical space. */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardBody, className)} {...rest} />;
});

/** Props for the bottom region of a {@link Card}, typically containing primary actions. */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

/** Bottom region of a {@link Card}, sitting flush with the bottom padding for actions or metadata. */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardFooter, className)} {...rest} />;
});

/** Props for the card's title heading. */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level to render — controls semantics, not visual size (the
   * `cardTitle` style is fixed).
   * @default "h3"
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/** Heading inside a {@link CardHeader}. Renders as `h3` by default; override with `as`. */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as: As = 'h3', className, ...rest },
  ref,
) {
  return <As ref={ref} className={cn(cardTitle, className)} {...rest} />;
});

/** Props for the secondary descriptive line under a {@link CardTitle}. */
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

/** Subtitle/description paragraph rendered below a {@link CardTitle}. */
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cn(cardDescription, className)} {...rest} />;
  },
);

/** Props for a media image rendered inside a {@link Card}. */
export interface CardImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Constrains the image wrapper to a fixed ratio. Accepts CSS aspect-ratio
   * values (`16 / 9`, `"4/3"`). Leave unset to flow with intrinsic image size.
   */
  aspectRatio?: number | string;
  /**
   * Forces horizontal-orientation sizing (e.g. when nested in a horizontal
   * {@link Card} so the image hugs the side rather than the top).
   */
  horizontal?: boolean;
}

/**
 * Renders an `<img>` wrapped in an aspect-ratio container that crops to the
 * card edges. `alt` defaults to `""` so decorative images don't pollute the
 * accessibility tree — set it explicitly when the image is informative.
 */
export const CardImage = forwardRef<HTMLImageElement, CardImageProps>(function CardImage(
  { aspectRatio, horizontal, className, style, alt = '', ...rest },
  ref,
): ReactElement {
  const wrapStyle = aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined;
  return (
    <div
      className={cn(cardImageWrap, horizontal ? cardHorizontalImage : undefined)}
      style={wrapStyle}
    >
      {/* biome-ignore lint/a11y/useAltText: `alt` is forwarded (defaults to "" for decorative imagery) */}
      <img ref={ref} alt={alt} className={cn(cardImage, className)} style={style} {...rest} />
    </div>
  );
});

/** Props for the {@link CardMedia} slot — a generic media wrapper matching {@link CardImage} layout. */
export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** Constrains the wrapper to a fixed ratio (same semantics as {@link CardImageProps.aspectRatio}). */
  aspectRatio?: number | string;
  /** Forces horizontal-orientation sizing inside a horizontal {@link Card}. */
  horizontal?: boolean;
  /** The media element (`<video>`, `<picture>`, `<iframe>`, etc.). */
  children?: ReactNode;
}

/** Wrap arbitrary media (video, picture, …) in the same shape as CardImage. */
export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(function CardMedia(
  { aspectRatio, horizontal, className, style, ...rest },
  ref,
) {
  const wrapStyle = aspectRatio ? { aspectRatio: String(aspectRatio), ...style } : style;
  return (
    <div
      ref={ref}
      className={cn(cardImageWrap, horizontal ? cardHorizontalImage : undefined, className)}
      style={wrapStyle}
      {...rest}
    />
  );
});
