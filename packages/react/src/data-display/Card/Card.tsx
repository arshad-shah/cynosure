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

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  orientation?: CardOrientation;
  interactive?: boolean;
  asChild?: boolean;
}

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

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardHeader, className)} {...rest} />;
});

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardBody, className)} {...rest} />;
});

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(cardFooter, className)} {...rest} />;
});

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as: As = 'h3', className, ...rest },
  ref,
) {
  return <As ref={ref} className={cn(cardTitle, className)} {...rest} />;
});

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cn(cardDescription, className)} {...rest} />;
  },
);

export interface CardImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: number | string;
  /** Forces horizontal-orientation sizing (inside a horizontal Card). */
  horizontal?: boolean;
}

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

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  aspectRatio?: number | string;
  horizontal?: boolean;
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
