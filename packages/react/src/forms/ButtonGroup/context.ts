import { createContext } from 'react';
import type { ButtonColorScheme, ButtonSize, ButtonVariant } from '../Button/Button.js';

export interface ButtonGroupContextValue {
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme;
  size?: ButtonSize;
}

/**
 * Shared context so `<Button>`s inside a `<ButtonGroup>` inherit `variant`,
 * `colorScheme`, and `size` without callers having to repeat them on every
 * child. `undefined` means "no group" and each button falls back to its own
 * defaults.
 */
export const ButtonGroupContext = createContext<ButtonGroupContextValue | undefined>(undefined);
