import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  calloutBody,
  calloutColorScheme,
  calloutContent,
  calloutIcon,
  calloutOutlineColorScheme,
  calloutRoot,
  calloutTitle,
  calloutVariantOutline,
} from './Callout.css.js';

export type CalloutColorScheme = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';
export type CalloutVariant = 'soft' | 'outline';

/**
 * Props for the {@link Callout} root component.
 */
export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Semantic palette. One of `accent`, `neutral`, `success`, `warning`,
   * `danger`.
   * @default "accent"
   */
  colorScheme?: CalloutColorScheme;
  /**
   * Visual style. `soft` is a tinted surface; `outline` is bordered.
   * @default "soft"
   */
  variant?: CalloutVariant;
  /** Leading icon node. Pass `false` to skip rendering an icon slot. */
  icon?: ReactNode | false;
}

/**
 * Inline block that draws attention to supporting prose — tips, warnings, or
 * supplementary context within long-form content. Callout is a passive
 * surface (not a live region); use {@link Alert} when you need to announce a
 * change to assistive technology.
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { colorScheme = 'accent', variant = 'soft', icon, className, children, ...rest },
  ref,
) {
  const schemeCls =
    variant === 'outline'
      ? calloutOutlineColorScheme[colorScheme]
      : calloutColorScheme[colorScheme];

  return (
    <div
      ref={ref}
      data-color-scheme={colorScheme}
      className={cn(
        calloutRoot,
        variant === 'outline' ? calloutVariantOutline : undefined,
        schemeCls,
        className,
      )}
      {...rest}
    >
      {icon && icon !== true ? <span className={calloutIcon}>{icon}</span> : null}
      <div className={calloutBody}>{children}</div>
    </div>
  );
});

/**
 * Props for the {@link CalloutTitle} heading slot.
 */
export interface CalloutTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * HTML element used to render the title. Choose a heading level that fits
   * the surrounding document outline.
   * @default "p"
   */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

/**
 * Heading slot for {@link Callout}. Defaults to a paragraph so the callout
 * can live inside prose without breaking the heading outline.
 */
export const CalloutTitle = forwardRef<HTMLHeadingElement, CalloutTitleProps>(function CalloutTitle(
  { as: As = 'p', className, ...rest },
  ref,
) {
  return <As ref={ref as never} className={cn(calloutTitle, className)} {...rest} />;
});

/**
 * Props for the {@link CalloutContent} body slot.
 */
export interface CalloutContentProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Body slot for {@link Callout}. Wraps long-form content with the correct
 * typography and spacing under the title.
 */
export const CalloutContent = forwardRef<HTMLDivElement, CalloutContentProps>(
  function CalloutContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(calloutContent, className)} {...rest} />;
  },
);
