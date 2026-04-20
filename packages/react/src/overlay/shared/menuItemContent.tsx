import type { ReactElement, ReactNode } from 'react';
import {
  menuDescription,
  menuLabelStack,
  menuLabelText,
  menuLeadingSlot,
} from './createMenuKit.css.js';

export interface MenuItemContentProps {
  /** Leading-slot node: an icon, a Radix ItemIndicator, or null. When null, the slot is reserved but empty. */
  leading?: ReactNode;
  /** Primary label text / nodes. */
  children: ReactNode;
  /** Optional muted second line. */
  description?: ReactNode;
  /** Trailing content — keyboard shortcut, sub-menu chevron, etc. */
  trailing?: ReactNode;
}

/**
 * Shared visual layout for a menu item. Produces the DOM structure all three
 * menus share: a fixed-width leading slot, a label/description stack, and an
 * optional trailing node.
 */
export function MenuItemContent({
  leading,
  children,
  description,
  trailing,
}: MenuItemContentProps): ReactElement {
  return (
    <>
      <span className={menuLeadingSlot} aria-hidden={leading == null ? 'true' : undefined}>
        {leading}
      </span>
      <span className={menuLabelStack}>
        <span className={menuLabelText}>{children}</span>
        {description != null ? <span className={menuDescription}>{description}</span> : null}
      </span>
      {trailing}
    </>
  );
}
