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

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  colorScheme?: CalloutColorScheme;
  variant?: CalloutVariant;
  icon?: ReactNode | false;
}

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

export interface CalloutTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export const CalloutTitle = forwardRef<HTMLHeadingElement, CalloutTitleProps>(function CalloutTitle(
  { as: As = 'p', className, ...rest },
  ref,
) {
  return <As ref={ref as never} className={cn(calloutTitle, className)} {...rest} />;
});

export interface CalloutContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CalloutContent = forwardRef<HTMLDivElement, CalloutContentProps>(
  function CalloutContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(calloutContent, className)} {...rest} />;
  },
);
