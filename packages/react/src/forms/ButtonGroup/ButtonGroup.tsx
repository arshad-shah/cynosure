import { type HTMLAttributes, type ReactNode, forwardRef, useMemo } from 'react';
import { cn } from '../../utils/cn.js';
import type { ButtonColorScheme, ButtonSize, ButtonVariant } from '../Button/Button.js';
import { buttonGroup, buttonGroupAttached } from './ButtonGroup.css.js';
import { ButtonGroupContext } from './context.js';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme;
  size?: ButtonSize;
  /** When `true`, buttons render as a segmented control with shared borders. */
  attached?: boolean;
  children?: ReactNode;
}

/**
 * Provides a shared `variant` / `colorScheme` / `size` context to every
 * nested `<Button>` so toolbars and segmented controls stay consistent with
 * one declaration. `attached` visually joins buttons into a single surface.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { variant, colorScheme, size, attached, children, className, role = 'group', ...rest },
  ref,
) {
  const ctx = useMemo(() => ({ variant, colorScheme, size }), [variant, colorScheme, size]);
  return (
    <ButtonGroupContext.Provider value={ctx}>
      <div
        ref={ref}
        role={role}
        className={cn(attached ? buttonGroupAttached : buttonGroup, className)}
        {...rest}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
});
