import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositionTop,
  dialogSize,
  dialogTitle,
} from '../Dialog/Dialog.css.js';
import { overlayBackdrop } from '../shared/overlay.css.js';
import type { OverlaySize } from '../shared/types.js';

/**
 * AlertDialog — destructive-action confirmation. Same visual surface as
 * `Dialog` but:
 * - cannot be dismissed by clicking outside or pressing `Esc` (Radix
 *   enforces this at the primitive level — no escape hatches),
 * - uses `role="alertdialog"`,
 * - requires explicit `AlertDialogAction` and `AlertDialogCancel` buttons.
 */
export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;
export const AlertDialogPortal = RadixAlertDialog.Portal;
export const AlertDialogAction = RadixAlertDialog.Action;
export const AlertDialogCancel = RadixAlertDialog.Cancel;

/**
 * Props for the alert dialog content surface — sizing, placement, and portal
 * controls layered over the Radix AlertDialog content primitive.
 */
export interface AlertDialogContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixAlertDialog.Content>, 'asChild'> {
  /**
   * Visual size variant of the alert dialog. Alert dialogs are typically
   * short confirmations, so the default leans compact; bump to `md` for
   * dialogs that include longer body copy or a list of consequences.
   * @default "sm"
   */
  size?: OverlaySize;
  /**
   * Vertical placement of the dialog. `center` is the default modal feel;
   * `top` anchors near the top of the viewport so the trigger context stays
   * visible (useful on tall pages).
   * @default "center"
   */
  position?: 'center' | 'top';
  /**
   * Portal target. Forwarded to Radix's `Portal` so the content can be
   * mounted into a specific shadow root, scroll container, or custom element.
   */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Suppress the backdrop. Rare — useful when stacking dialogs or when the
   * parent surface already provides scrim-style chrome.
   * @default false
   */
  hideOverlay?: boolean;
  /** Dialog body — typically a header, description, and footer with actions. */
  children?: ReactNode;
}

/**
 * Alert dialog content surface. Portals into the document, paints the
 * backdrop, and traps focus via Radix. Suppresses both outside-click and
 * `Escape` dismissal so destructive flows require an explicit choice from
 * the user via `AlertDialogAction` or `AlertDialogCancel`. Announces with
 * `role="alertdialog"`.
 */
export const AlertDialogContent = forwardRef<
  ElementRef<typeof RadixAlertDialog.Content>,
  AlertDialogContentProps
>(function AlertDialogContent(
  {
    size = 'sm',
    position = 'center',
    hideOverlay = false,
    container,
    className,
    children,
    ...rest
  },
  ref,
) {
  const resolvedContainer = typeof container === 'function' ? container() : container;

  return (
    <RadixAlertDialog.Portal container={resolvedContainer}>
      {!hideOverlay ? <RadixAlertDialog.Overlay className={overlayBackdrop} /> : null}
      <RadixAlertDialog.Content
        ref={ref}
        data-cynosure-overlay=""
        className={cn(
          dialogContent,
          dialogSize[size],
          position === 'top' ? dialogPositionTop : undefined,
          className,
        )}
        // Destructive-action confirmation must be an explicit choice. Radix
        // already omits `onInteractOutside` / `onPointerDownOutside` on the
        // AlertDialog primitive (backdrop clicks never dismiss). We also
        // suppress Escape so the only exits are AlertDialogAction /
        // AlertDialogCancel.
        onEscapeKeyDown={(e) => e.preventDefault()}
        {...rest}
      >
        {children}
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  );
});

/**
 * Props for the alert dialog header layout block. Inherits all standard
 * `<div>` attributes.
 */
export interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
/**
 * Layout slot for the title + description at the top of the alert dialog.
 */
export const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  function AlertDialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(dialogHeader, className)} {...rest} />;
  },
);

/**
 * Props for the alert dialog footer layout block. Inherits all standard
 * `<div>` attributes.
 */
export interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {}
/**
 * Layout slot for the action row (`AlertDialogCancel` + `AlertDialogAction`)
 * at the bottom of the alert dialog.
 */
export const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  function AlertDialogFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(dialogFooter, className)} {...rest} />;
  },
);

/**
 * Props for the alert dialog title. Forwards to the Radix `Title` primitive,
 * which wires the heading as the dialog's accessible name.
 */
export interface AlertDialogTitleProps
  extends ComponentPropsWithoutRef<typeof RadixAlertDialog.Title> {}
/**
 * Accessible heading for the alert dialog. Required — Radix wires it as the
 * dialog's `aria-labelledby` target.
 */
export const AlertDialogTitle = forwardRef<
  ElementRef<typeof RadixAlertDialog.Title>,
  AlertDialogTitleProps
>(function AlertDialogTitle({ className, ...rest }, ref) {
  return <RadixAlertDialog.Title ref={ref} className={cn(dialogTitle, className)} {...rest} />;
});

/**
 * Props for the alert dialog description. Forwards to the Radix
 * `Description` primitive, which sets `aria-describedby` on the dialog.
 */
export interface AlertDialogDescriptionProps
  extends ComponentPropsWithoutRef<typeof RadixAlertDialog.Description> {}
/**
 * Supporting body copy under the title. Read aloud after the title in
 * assistive tech, so use it to explain the consequence of the action.
 */
export const AlertDialogDescription = forwardRef<
  ElementRef<typeof RadixAlertDialog.Description>,
  AlertDialogDescriptionProps
>(function AlertDialogDescription({ className, ...rest }, ref) {
  return (
    <RadixAlertDialog.Description
      ref={ref}
      className={cn(dialogDescription, className)}
      {...rest}
    />
  );
});
