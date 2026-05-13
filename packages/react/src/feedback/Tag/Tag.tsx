import { X } from 'lucide-react';
import { type HTMLAttributes, type KeyboardEvent, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { badgeIcon, badgeRoot, badgeShape, badgeSize } from '../Badge/Badge.css.js';
import { badgeVariantClass } from '../Badge/variants.js';
import type { FeedbackColorScheme, FeedbackVariant } from '../shared/types.js';
import { tagGroupTrigger, tagInteractive, tagRemoveButton } from './Tag.css.js';

export type TagVariant = FeedbackVariant;
export type TagColorScheme = FeedbackColorScheme;
export type TagSize = 'xs' | 'sm' | 'md';
export type TagShape = 'default' | 'pill' | 'square';

/**
 * Props for the {@link Tag} component.
 */
export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  /**
   * Visual style. One of `soft`, `solid`, `outline`, `ghost`.
   * @default "soft"
   */
  variant?: TagVariant;
  /**
   * Semantic palette. One of `neutral`, `accent`, `success`, `warning`,
   * `danger`, `info`.
   * @default "neutral"
   */
  colorScheme?: TagColorScheme;
  /**
   * Pixel scale. One of `xs`, `sm`, `md`.
   * @default "md"
   */
  size?: TagSize;
  /**
   * Outline shape. `default` is gently rounded; `pill` is fully rounded;
   * `square` has no corner rounding.
   * @default "pill"
   */
  shape?: TagShape;
  /** Leading icon rendered before the children. */
  icon?: ReactNode;
  /** Invoked when the user activates the trailing remove button. */
  onRemove?: () => void;
  /** Invoked when the tag itself is activated (click or keyboard). */
  onClick?: () => void;
  /**
   * Accessible label for the remove button. Defaults to `Remove {children}`
   * when `children` is a string, otherwise `Remove`.
   */
  removeLabel?: string;
  /** Disables the tag and its remove button, removing it from tab order. */
  disabled?: boolean;
  /** Tag label content. */
  children?: ReactNode;
}

/**
 * Compact inline label, optionally interactive or removable. Tag is well
 * suited for entity chips inside text fields, filter pills, and metadata
 * lists. With `onRemove` it becomes a focusable group that responds to
 * `Backspace` / `Delete` for keyboard dismissal; the remove button has its
 * own accessible label so screen readers can target it directly.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    variant = 'soft',
    colorScheme = 'neutral',
    size = 'md',
    shape = 'pill',
    icon,
    onRemove,
    onClick,
    removeLabel,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  const variantCls = badgeVariantClass[variant][colorScheme];
  const rootClasses = cn(
    badgeRoot,
    badgeSize[size],
    badgeShape[shape],
    variantCls,
    onClick || onRemove ? tagInteractive : undefined,
    className,
  );

  const iconNode = icon ? (
    <span aria-hidden="true" className={badgeIcon}>
      {icon}
    </span>
  ) : null;

  const derivedRemoveLabel =
    removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove');

  const removeButton = onRemove ? (
    <button
      type="button"
      aria-label={derivedRemoveLabel}
      disabled={disabled}
      className={tagRemoveButton}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onRemove();
      }}
    >
      <X />
    </button>
  ) : null;

  // `onClick` only: whole tag becomes a button.
  if (onClick && !onRemove) {
    return (
      <button
        type="button"
        ref={ref as never}
        disabled={disabled}
        className={rootClasses}
        onClick={() => {
          if (!disabled) onClick();
        }}
        {...(rest as Record<string, unknown>)}
      >
        {iconNode}
        {children}
      </button>
    );
  }

  // `onRemove` only: the root is a group; the remove button is focusable.
  // `onRemove` + `onClick`: same as above plus a main button on the label.
  if (onRemove) {
    const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onRemove();
      }
    };
    return (
      <span
        ref={ref}
        // biome-ignore lint/a11y/useSemanticElements: Tag is inline-level; <fieldset> is block and would break flow.
        role="group"
        aria-label={typeof children === 'string' ? children : undefined}
        className={rootClasses}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        {...rest}
      >
        {iconNode}
        {onClick ? (
          <button
            type="button"
            className={tagGroupTrigger}
            disabled={disabled}
            onClick={() => {
              if (!disabled) onClick();
            }}
          >
            {children}
          </button>
        ) : (
          children
        )}
        {removeButton}
      </span>
    );
  }

  return (
    <span ref={ref} className={rootClasses} {...rest}>
      {iconNode}
      {children}
    </span>
  );
});
