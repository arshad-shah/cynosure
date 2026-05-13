import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode, forwardRef } from 'react';
import { Button, type ButtonProps, type ButtonVariant } from '../Button/Button.js';

export type IconButtonVariant = ButtonVariant | 'bare';

type StyledProps = Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children' | 'variant'> & {
  variant?: ButtonVariant;
};

type BareProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant: 'bare';
  className?: string;
  style?: CSSProperties;
};

/**
 * Props for `IconButton`. Discriminated by `variant`:
 * - `variant !== "bare"` (default): all `<Button>` props are available; `shape` defaults to `"square"`.
 * - `variant === "bare"`: skip Cynosure styling and render a minimal `<button>` (used for clear/close affordances inside other controls).
 */
export type IconButtonProps = (StyledProps | BareProps) & {
  /** The icon element — typically a Cynosure icon or an inline SVG. */
  icon: ReactNode;
  /** Accessible label — announced in place of textual content. Required. */
  label: string;
};

/**
 * Square, icon-only button. Default mode wraps `<Button>` with `shape="square"`.
 * `variant="bare"` renders a plain `<button>` with no Button recipe — for cases
 * where a parent component's CSS recipe owns all the styling (close buttons on
 * dialogs, clear buttons inside inputs, etc.). Either way, `label` and
 * `type="button"` are enforced.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    const { icon, label } = props;

    if (props.variant === 'bare') {
      const { icon: _icon, label: _label, variant: _variant, type, ...rest } = props;
      return (
        <button ref={ref} type={type ?? 'button'} aria-label={label} {...rest}>
          {icon}
        </button>
      );
    }

    const { icon: _icon, label: _label, shape = 'square', ...rest } = props;
    return (
      <Button ref={ref} shape={shape} aria-label={label} {...rest}>
        {icon}
      </Button>
    );
  },
);
