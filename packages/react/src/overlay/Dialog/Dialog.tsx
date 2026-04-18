import * as RadixDialog from '@radix-ui/react-dialog';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn.js';
import { overlayBackdrop, overlayCloseButton } from '../shared/overlay.css.js';
import type { OverlaySize } from '../shared/types.js';
import {
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositionTop,
  dialogSize,
  dialogTitle,
} from './Dialog.css.js';

/** Dialog root — context provider that holds the open state. */
export const Dialog = RadixDialog.Root;

/** Trigger — pass `asChild` to use a `Button` or other custom element. */
export const DialogTrigger = RadixDialog.Trigger;

/** Any button that closes the dialog. Pair with `asChild`. */
export const DialogClose = RadixDialog.Close;

/**
 * Portal'd overlay container. Use `Dialog.Portal` when you need to control
 * the portal mount without rendering the rest of `DialogContent`.
 */
export const DialogPortal = RadixDialog.Portal;

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export interface DialogContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'asChild'> {
  size?: OverlaySize;
  position?: 'center' | 'top';
  /** Close when the backdrop is clicked. Default `true`. */
  closeOnOverlayClick?: boolean;
  /** Close when `Esc` is pressed. Default `true`. */
  closeOnEscape?: boolean;
  /** Render the built-in close button (top-right X). Default `true`. */
  showCloseButton?: boolean;
  /** Portal target — forwarded to Radix's `DialogPortal`. */
  container?: HTMLElement | (() => HTMLElement);
  /** ARIA label for the built-in close button. */
  closeLabel?: string;
  /** Skip rendering the backdrop (rare; use when stacking dialogs). */
  hideOverlay?: boolean;
  children?: ReactNode;
}

/**
 * Dialog content surface. Portals, paints the backdrop, traps focus,
 * manages scroll lock, and wires `role="dialog"` + `aria-modal="true"`
 * via Radix. `size` and `position` are visual-only variants.
 */
export const DialogContent = forwardRef<ElementRef<typeof RadixDialog.Content>, DialogContentProps>(
  function DialogContent(
    {
      size = 'md',
      position = 'center',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      hideOverlay = false,
      container,
      closeLabel = 'Close',
      className,
      children,
      onEscapeKeyDown,
      onInteractOutside,
      ...rest
    },
    ref,
  ) {
    const resolvedContainer = typeof container === 'function' ? container() : container;

    return (
      <RadixDialog.Portal container={resolvedContainer}>
        {!hideOverlay ? <RadixDialog.Overlay className={overlayBackdrop} /> : null}
        <RadixDialog.Content
          ref={ref}
          data-cynosure-overlay=""
          className={cn(
            dialogContent,
            dialogSize[size],
            position === 'top' ? dialogPositionTop : undefined,
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
              <button
                type="button"
                aria-label={closeLabel}
                className={overlayCloseButton}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 4,
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: 'inherit',
                }}
              >
                <CloseIcon />
              </button>
            </RadixDialog.Close>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  },
);

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(function DialogHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(dialogHeader, className)} {...rest} />;
});

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(dialogFooter, className)} {...rest} />;
});

export interface DialogTitleProps extends ComponentPropsWithoutRef<typeof RadixDialog.Title> {}
export const DialogTitle = forwardRef<ElementRef<typeof RadixDialog.Title>, DialogTitleProps>(
  function DialogTitle({ className, ...rest }, ref) {
    return <RadixDialog.Title ref={ref} className={cn(dialogTitle, className)} {...rest} />;
  },
);

export interface DialogDescriptionProps
  extends ComponentPropsWithoutRef<typeof RadixDialog.Description> {}
export const DialogDescription = forwardRef<
  ElementRef<typeof RadixDialog.Description>,
  DialogDescriptionProps
>(function DialogDescription({ className, ...rest }, ref) {
  return (
    <RadixDialog.Description ref={ref} className={cn(dialogDescription, className)} {...rest} />
  );
});
