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

/**
 * Props for the {@link EmptyState} root component.
 */
export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Vertical and typographic scale. One of `sm`, `md`, `lg`, `xl`.
   * @default "md"
   */
  size?: EmptyStateSize;
  /**
   * Surface treatment. `default` adds a bordered card; `subtle` blends with
   * the surrounding container.
   * @default "default"
   */
  variant?: EmptyStateVariant;
}

/**
 * Placeholder shown when a region has no content to display — first-run
 * states, empty search results, or filtered-to-zero lists. Compose with the
 * `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, and
 * `EmptyStateActions` slots to give users a clear next step.
 */
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

/**
 * Props for the {@link EmptyStateIcon} slot.
 */
export interface EmptyStateIconProps extends HTMLAttributes<HTMLSpanElement> {}

/**
 * Decorative illustration or icon slot for {@link EmptyState}. Marked
 * `aria-hidden` so it is skipped by screen readers — keep the title and
 * description as the accessible message.
 */
export const EmptyStateIcon = forwardRef<HTMLSpanElement, EmptyStateIconProps>(
  function EmptyStateIcon({ className, ...rest }, ref) {
    return (
      <span ref={ref} aria-hidden="true" className={cn(emptyStateIcon, className)} {...rest} />
    );
  },
);

/**
 * Props for the {@link EmptyStateTitle} heading slot.
 */
export interface EmptyStateTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * HTML heading element. Choose a level that fits the surrounding document
   * outline.
   * @default "h3"
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Heading slot for {@link EmptyState}. Renders an actual heading element so
 * the empty state participates in the page outline.
 */
export const EmptyStateTitle = forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  function EmptyStateTitle({ as: As = 'h3', className, ...rest }, ref) {
    return <As ref={ref} className={cn(emptyStateTitle, className)} {...rest} />;
  },
);

/**
 * Props for the {@link EmptyStateDescription} body slot.
 */
export interface EmptyStateDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

/**
 * Supporting prose slot for {@link EmptyState}. Use this to explain why the
 * region is empty and how the user can populate it.
 */
export const EmptyStateDescription = forwardRef<HTMLParagraphElement, EmptyStateDescriptionProps>(
  function EmptyStateDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cn(emptyStateDescription, className)} {...rest} />;
  },
);

/**
 * Props for the {@link EmptyStateActions} slot.
 */
export interface EmptyStateActionsProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Action row slot for {@link EmptyState}. Holds the primary and secondary
 * controls that move the user out of the empty state.
 */
export const EmptyStateActions = forwardRef<HTMLDivElement, EmptyStateActionsProps>(
  function EmptyStateActions({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(emptyStateActions, className)} {...rest} />;
  },
);
