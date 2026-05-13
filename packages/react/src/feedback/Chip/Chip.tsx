import { XCircle } from 'lucide-react';
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { badgeIcon, badgeRoot, badgeShape, badgeSize } from '../Badge/Badge.css.js';
import { badgeVariantClass } from '../Badge/variants.js';
import { tagRemoveButton } from '../Tag/Tag.css.js';
import type { FeedbackColorScheme, FeedbackVariant } from '../shared/types.js';
import { chipRoot } from './Chip.css.js';

export type ChipVariant = FeedbackVariant;
export type ChipColorScheme = FeedbackColorScheme;
export type ChipSize = 'xs' | 'sm' | 'md';
export type ChipShape = 'default' | 'pill' | 'square';

/**
 * Props for the {@link Chip} component.
 */
export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  /**
   * Visual style. One of `soft`, `solid`, `outline`, `ghost`.
   * @default "soft"
   */
  variant?: ChipVariant;
  /**
   * Semantic palette. One of `neutral`, `accent`, `success`, `warning`,
   * `danger`, `info`.
   * @default "neutral"
   */
  colorScheme?: ChipColorScheme;
  /**
   * Pixel scale. One of `xs`, `sm`, `md`.
   * @default "md"
   */
  size?: ChipSize;
  /**
   * Outline shape. `default` is gently rounded; `pill` is fully rounded;
   * `square` has no corner rounding.
   * @default "pill"
   */
  shape?: ChipShape;
  /**
   * Toggled / pressed state. Reflected on the button as `aria-pressed`.
   * @default false
   */
  selected?: boolean;
  /** Invoked with the next selected value when the chip is activated. */
  onSelectedChange?: (selected: boolean) => void;
  /** Icon rendered before the label. */
  leftIcon?: ReactNode;
  /** Icon rendered after the label. */
  rightIcon?: ReactNode;
  /** Invoked when the trailing remove button is activated. */
  onRemove?: () => void;
  /**
   * Accessible label for the remove button. Defaults to `Remove {children}`
   * when `children` is a string, otherwise `Remove`.
   */
  removeLabel?: string;
  /** Chip label content. */
  children?: ReactNode;
}

/**
 * Toggleable, optionally-removable inline control. Chip behaves like a
 * two-state button — useful for filter pills, selectable tags, and quick
 * actions in toolbars. When `onRemove` is supplied, the remove button is
 * separately focusable so keyboard users can dismiss without firing the main
 * toggle.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    variant = 'soft',
    colorScheme = 'neutral',
    size = 'md',
    shape = 'pill',
    selected = false,
    onSelectedChange,
    leftIcon,
    rightIcon,
    onRemove,
    removeLabel,
    disabled,
    className,
    children,
    onClick,
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
    chipRoot,
    className,
  );

  const derivedRemoveLabel =
    removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove');

  const body = (
    <>
      {leftIcon ? (
        <span aria-hidden="true" className={badgeIcon}>
          {leftIcon}
        </span>
      ) : null}
      {children}
      {rightIcon ? (
        <span aria-hidden="true" className={badgeIcon}>
          {rightIcon}
        </span>
      ) : null}
    </>
  );

  if (onRemove) {
    return (
      <span className={rootClasses} aria-disabled={disabled || undefined}>
        <button
          ref={ref}
          type="button"
          aria-pressed={selected}
          disabled={disabled}
          onClick={(e) => {
            onClick?.(e);
            if (!disabled) onSelectedChange?.(!selected);
          }}
          style={{
            all: 'unset',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        >
          {body}
        </button>
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
          <XCircle />
        </button>
      </span>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={rootClasses}
      onClick={(e) => {
        onClick?.(e);
        if (!disabled) onSelectedChange?.(!selected);
      }}
      {...rest}
    >
      {body}
    </button>
  );
});
