import { ChevronDown } from 'lucide-react';
import { type ElementRef, type ReactElement, forwardRef } from 'react';
import { Button, type ButtonProps } from '../../forms/Button/Button.js';
import { triggerChevron } from './createMenuKit.css.js';
import { ButtonTrigger } from './menuEngine.js';

export interface MenuTriggerButtonProps extends Omit<ButtonProps, 'asChild' | 'rightIcon'> {}

/**
 * Ergonomic DropdownMenu trigger: a Button with an animated chevron that
 * rotates 180° when the menu is open. Uses the engine's `data-state` on the
 * trigger element for the rotation — no additional wiring.
 */
export const MenuTriggerButton = forwardRef<ElementRef<typeof Button>, MenuTriggerButtonProps>(
  function MenuTriggerButton({ children, ...rest }, ref): ReactElement {
    return (
      <ButtonTrigger asChild>
        <Button
          ref={ref}
          {...rest}
          rightIcon={
            <span className={triggerChevron} aria-hidden="true">
              <ChevronDown size={14} />
            </span>
          }
        >
          {children}
        </Button>
      </ButtonTrigger>
    );
  },
);
