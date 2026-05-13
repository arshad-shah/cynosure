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

/**
 * Props for the dialog content surface. Layers size, position, and
 * dismissal controls over the Radix Dialog content primitive.
 */
export interface DialogContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'asChild'> {
  /**
   * Visual size variant of the dialog. `md` works for most confirm/edit
   * flows; `lg`/`xl` are for forms; `sm` for compact confirmations.
   * @default "md"
   */
  size?: OverlaySize;
  /**
   * Vertical placement of the dialog. `center` is the standard modal feel;
   * `top` anchors near the top of the viewport for taller surfaces.
   * @default "center"
   */
  position?: 'center' | 'top';
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
   * Render the built-in close button (top-right X). Disable when you want
   * to drive dismissal exclusively from inside the dialog body.
   * @default true
   */
  showCloseButton?: boolean;
  /** Portal target — forwarded to Radix's `DialogPortal`. */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Accessible label applied to the built-in close button.
   * @default "Close"
   */
  closeLabel?: string;
  /**
   * Skip rendering the backdrop. Rare — useful when stacking dialogs or
   * when the parent surface already provides a scrim.
   * @default false
   */
  hideOverlay?: boolean;
  /** Dialog body — typically a header, content, and footer. */
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
 * Props for the dialog header layout block. Inherits all standard `<div>`
 * attributes.
 */
export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}
/**
 * Layout slot for the title + description at the top of the dialog. Pure
 * presentation — doesn't render any ARIA on its own; place a `DialogTitle`
 * and `DialogDescription` inside.
 */
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(function DialogHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(dialogHeader, className)} {...rest} />;
});

/**
 * Props for the dialog footer layout block. Inherits all standard `<div>`
 * attributes.
 */
export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}
/**
 * Layout slot for the action row (Cancel / Confirm buttons) at the bottom
 * of the dialog.
 */
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(dialogFooter, className)} {...rest} />;
});

/**
 * Props for the dialog title. Forwards to Radix's `Title`, which wires the
 * heading as the dialog's accessible name (`aria-labelledby`).
 */
export interface DialogTitleProps extends ComponentPropsWithoutRef<typeof RadixDialog.Title> {}
/**
 * Accessible heading for the dialog. Required for assistive tech — Radix
 * uses it as the `aria-labelledby` target. Provide a hidden one if the
 * design has no visible title.
 */
export const DialogTitle = forwardRef<ElementRef<typeof RadixDialog.Title>, DialogTitleProps>(
  function DialogTitle({ className, ...rest }, ref) {
    return <RadixDialog.Title ref={ref} className={cn(dialogTitle, className)} {...rest} />;
  },
);

/**
 * Props for the dialog description. Forwards to Radix's `Description`,
 * which sets `aria-describedby` on the dialog.
 */
export interface DialogDescriptionProps
  extends ComponentPropsWithoutRef<typeof RadixDialog.Description> {}
/**
 * Supporting body copy beneath the title. Read aloud after the title in
 * assistive tech.
 */
export const DialogDescription = forwardRef<
  ElementRef<typeof RadixDialog.Description>,
  DialogDescriptionProps
>(function DialogDescription({ className, ...rest }, ref) {
  return (
    <RadixDialog.Description ref={ref} className={cn(dialogDescription, className)} {...rest} />
  );
});
