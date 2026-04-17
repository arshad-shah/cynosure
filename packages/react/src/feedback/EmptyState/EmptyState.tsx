import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import {
  emptyStateActions,
  emptyStateDescription,
  emptyStateIcon,
  emptyStateRoot,
  emptyStateSize,
  emptyStateTitle,
  emptyStateVariant,
} from './EmptyState.css.js';

export type EmptyStateSize = 'sm' | 'md' | 'lg' | 'xl';
export type EmptyStateVariant = 'default' | 'subtle';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  size?: EmptyStateSize;
  variant?: EmptyStateVariant;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { size = 'md', variant = 'default', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(emptyStateRoot, emptyStateVariant[variant], emptyStateSize[size], className)}
      {...rest}
    />
  );
});

export interface EmptyStateIconProps extends HTMLAttributes<HTMLSpanElement> {}

export const EmptyStateIcon = forwardRef<HTMLSpanElement, EmptyStateIconProps>(
  function EmptyStateIcon({ className, ...rest }, ref) {
    return (
      <span ref={ref} aria-hidden="true" className={cn(emptyStateIcon, className)} {...rest} />
    );
  },
);

export interface EmptyStateTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle({ as: As = 'h3', className, ...rest }, ref) {
    return <As ref={ref} className={cn(emptyStateTitle, className)} {...rest} />;
  },
);

export interface EmptyStateDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const EmptyStateDescription = forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function EmptyStateDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cn(emptyStateDescription, className)} {...rest} />;
  },
);

export interface EmptyStateActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const EmptyStateActions = forwardRef<HTMLDivElement, EmptyStateActionsProps>(
  function EmptyStateActions({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(emptyStateActions, className)} {...rest} />;
  },
);
