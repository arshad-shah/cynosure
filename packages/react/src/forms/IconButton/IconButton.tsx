import { type ReactNode, forwardRef } from 'react';
import { Button, type ButtonProps } from '../Button/Button.js';

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** The icon element — typically a Cynosure icon or an inline SVG. */
  icon: ReactNode;
  /** Accessible label — announced in place of textual content. Required. */
  label: string;
}

/**
 * Square, icon-only button. Thin wrapper around `<Button>` that enforces
 * `shape="square"` and `aria-label` — the two things icon-only triggers
 * always get wrong when rolled by hand.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, shape = 'square', ...rest },
  ref,
) {
  return (
    <Button ref={ref} shape={shape} aria-label={label} {...rest}>
      {icon}
    </Button>
  );
});
