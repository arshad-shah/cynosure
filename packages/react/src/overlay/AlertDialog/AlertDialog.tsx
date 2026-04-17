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

export interface AlertDialogContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixAlertDialog.Content>, 'asChild'> {
  size?: OverlaySize;
  position?: 'center' | 'top';
  container?: HTMLElement | (() => HTMLElement);
  hideOverlay?: boolean;
  children?: ReactNode;
}

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
        data-lumen-overlay=""
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

export interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  function AlertDialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(dialogHeader, className)} {...rest} />;
  },
);

export interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  function AlertDialogFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(dialogFooter, className)} {...rest} />;
  },
);

export interface AlertDialogTitleProps
  extends ComponentPropsWithoutRef<typeof RadixAlertDialog.Title> {}
export const AlertDialogTitle = forwardRef<
  ElementRef<typeof RadixAlertDialog.Title>,
  AlertDialogTitleProps
>(function AlertDialogTitle({ className, ...rest }, ref) {
  return <RadixAlertDialog.Title ref={ref} className={cn(dialogTitle, className)} {...rest} />;
});

export interface AlertDialogDescriptionProps
  extends ComponentPropsWithoutRef<typeof RadixAlertDialog.Description> {}
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
