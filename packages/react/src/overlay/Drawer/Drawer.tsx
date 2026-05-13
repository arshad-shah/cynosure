import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { cn } from '../../utils/cn.js';
import { overlayBackdrop, overlayCloseButton } from '../shared/overlay.css.js';
import {
  drawerContent,
  drawerDescription,
  drawerFooter,
  drawerHeader,
  drawerSide,
  drawerSizeHorizontal,
  drawerSizeVertical,
  drawerTitle,
} from './Drawer.css.js';

export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Drawer is built on `@radix-ui/react-dialog` — it's general-purpose enough
 *  to cover every edge-anchored overlay pattern we need. Inherits Radix's
 *  focus trap, scroll lock, `Escape` handling, and `aria-modal="true"`
 *  semantics. */
export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;
export const DrawerClose = RadixDialog.Close;
export const DrawerPortal = RadixDialog.Portal;

/**
 * Props for the edge-anchored drawer surface. Layers side, size, and
 * dismissal controls over the Radix Dialog content primitive.
 */
export interface DrawerContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'asChild'> {
  /**
   * Edge the drawer slides in from. `right` is the default for inspector /
   * detail panels; `left` for navigation; `top` / `bottom` for sheet-style
   * surfaces (e.g. notifications, mobile actions).
   * @default "right"
   */
  side?: DrawerSide;
  /**
   * Drawer breadth. For `left`/`right` it sets the width; for `top`/
   * `bottom` it sets the height. `full` fills the matching viewport axis.
   * @default "md"
   */
  size?: DrawerSize;
  /**
   * Close when the backdrop is clicked.
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Close when `Esc` is pressed.
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Render the built-in close button (top-right X).
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Accessible label applied to the built-in close button.
   * @default "Close"
   */
  closeLabel?: string;
  /** Portal target — forwarded to Radix's `Portal`. */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Skip rendering the backdrop. Useful when stacking drawers or when the
   * parent surface already provides a scrim.
   * @default false
   */
  hideOverlay?: boolean;
  /** Drawer body. */
  children?: ReactNode;
}

/**
 * Edge-anchored drawer surface. Portals into the document, paints the
 * backdrop, traps focus, locks scroll, and renders `role="dialog"` with
 * `aria-modal="true"` via Radix. `side`/`size` are visual-only variants.
 */
export const DrawerContent = forwardRef<ElementRef<typeof RadixDialog.Content>, DrawerContentProps>(
  function DrawerContent(
    {
      side = 'right',
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      closeLabel = 'Close',
      hideOverlay = false,
      container,
      className,
      children,
      onEscapeKeyDown,
      onInteractOutside,
      ...rest
    },
    ref,
  ) {
    const isHorizontal = side === 'left' || side === 'right';
    const resolvedContainer = typeof container === 'function' ? container() : container;

    return (
      <RadixDialog.Portal container={resolvedContainer}>
        {!hideOverlay ? <RadixDialog.Overlay className={overlayBackdrop} /> : null}
        <RadixDialog.Content
          ref={ref}
          data-cynosure-overlay=""
          data-side={side}
          className={cn(
            drawerContent,
            drawerSide[side],
            isHorizontal ? drawerSizeHorizontal[size] : drawerSizeVertical[size],
            className,
          )}
          onEscapeKeyDown={(e) => {
            onEscapeKeyDown?.(e);
            if (!closeOnEscape) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            onInteractOutside?.(e);
            if (!closeOnOverlayClick) e.preventDefault();
          }}
          {...rest}
        >
          {children}
          {showCloseButton ? (
            <RadixDialog.Close asChild>
              <IconButton
                variant="bare"
                label={closeLabel}
                icon={<X />}
                className={overlayCloseButton}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 4,
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              />
            </RadixDialog.Close>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  },
);

/**
 * Layout slot for the title + description at the top of the drawer. Pure
 * presentation — place a `DrawerTitle` and (optionally) `DrawerDescription`
 * inside for the ARIA wiring.
 */
export const DrawerHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(drawerHeader, className)} {...rest} />;
  },
);

/**
 * Layout slot for the action row at the bottom of the drawer. Useful for
 * Cancel / Save pairings on form drawers.
 */
export const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(drawerFooter, className)} {...rest} />;
  },
);

/**
 * Accessible heading for the drawer. Required — Radix uses it as the
 * `aria-labelledby` target for the dialog.
 */
export const DrawerTitle = forwardRef<
  ElementRef<typeof RadixDialog.Title>,
  ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(function DrawerTitle({ className, ...rest }, ref) {
  return <RadixDialog.Title ref={ref} className={cn(drawerTitle, className)} {...rest} />;
});

/**
 * Supporting body copy beneath the title. Wires `aria-describedby` on the
 * dialog via Radix.
 */
export const DrawerDescription = forwardRef<
  ElementRef<typeof RadixDialog.Description>,
  ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(function DrawerDescription({ className, ...rest }, ref) {
  return (
    <RadixDialog.Description ref={ref} className={cn(drawerDescription, className)} {...rest} />
  );
});
