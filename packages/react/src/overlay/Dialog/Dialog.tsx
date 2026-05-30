import { X } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useRef,
} from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import { OverlayPortal } from '../shared/OverlayPortal.js';
import { overlayBackdrop, overlayCloseButton } from '../shared/overlay.css.js';
import type { OverlaySize } from '../shared/types.js';
import {
  type DialogState,
  useDialogState,
  useEscapeToClose,
  useFocusTrap,
} from '../shared/useDialog.js';
import {
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositionTop,
  dialogSize,
  dialogTitle,
} from './Dialog.css.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to the native `<dialog>` element. Native `<dialog>` has
// browser-driven focus + ::backdrop semantics we explicitly customise
// (animated backdrop, configurable dismissal); consumer CSS already
// targets `<div role="dialog">`.
const DIALOG_ROLE = 'dialog';

const DialogCtx = createContext<DialogState | null>(null);
const useDialogCtx = (): DialogState => {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error('Dialog subcomponent must be used inside <Dialog>');
  return ctx;
};

export interface DialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires on open-state change. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Modal dialog root. Owns the open state, the shared title/description
 * IDs that subcomponents wire into `aria-labelledby`/`aria-describedby`,
 * and ref-counted body scroll lock while open.
 */
export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps): ReactElement {
  const state = useDialogState({ open, defaultOpen, onOpenChange });
  return <DialogCtx.Provider value={state}>{children}</DialogCtx.Provider>;
}

type AnyProps = Record<string, unknown>;

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Compose onto a single React-element child. */
  asChild?: boolean;
  children: ReactNode;
}

export const DialogTrigger = forwardRef<HTMLElement, DialogTriggerProps>(function DialogTrigger(
  { asChild, children, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = useDialogCtx();
  const setRef = (node: HTMLElement | null) => {
    ctx.triggerRef.current = node;
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(true);
  };
  const shared = {
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': ctx.open,
    'data-state': ctx.open ? 'open' : 'closed',
  };
  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('DialogTrigger asChild expects a single React element child');
    }
    const childProps = (children as unknown as { props: AnyProps }).props;
    const existingRef = (childProps.ref as never) ?? (children as unknown as { ref?: unknown }).ref;
    const composed = composeRefs<HTMLElement>(ref as never, existingRef as never, setRef);
    const merged: AnyProps = {
      ref: composed,
      ...shared,
      ...rest,
      onClick: chain(childProps.onClick as never, handleClick as never),
    };
    return cloneElement(children, merged);
  }
  return (
    <button
      ref={composeRefs<HTMLElement>(ref as never, setRef) as never}
      type={type}
      {...shared}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { asChild, children, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = useDialogCtx();
  const handle = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(false);
  };
  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('DialogClose asChild expects a single React element child');
    }
    const childProps = (children as unknown as { props: AnyProps }).props;
    const merged: AnyProps = {
      ref,
      ...rest,
      onClick: chain(childProps.onClick as never, handle as never),
    };
    return cloneElement(children, merged);
  }
  return (
    <button ref={ref} type={type} onClick={handle} {...rest}>
      {children}
    </button>
  );
});

/**
 * Portal target. Preserved for API parity — defaults to `document.body`.
 */
export interface DialogPortalProps {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}
export function DialogPortal({ container, children }: DialogPortalProps): ReactElement {
  return <OverlayPortal container={container}>{children}</OverlayPortal>;
}

/** Props for the dialog content surface. */
export interface DialogContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Visual size variant. `md` works for most confirm/edit flows;
   * `lg`/`xl` are for forms; `sm` for compact confirmations.
   * @default "md"
   */
  size?: OverlaySize;
  /**
   * Vertical placement. `center` for the standard modal feel; `top`
   * anchors near the top of the viewport.
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
   * Render the built-in close button (top-right X).
   * @default true
   */
  showCloseButton?: boolean;
  /** Portal target. */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Accessible label applied to the built-in close button.
   * @default "Close"
   */
  closeLabel?: string;
  /**
   * Skip rendering the backdrop. Useful when stacking dialogs or when
   * the parent already provides a scrim.
   * @default false
   */
  hideOverlay?: boolean;
  children?: ReactNode;
}

/**
 * Dialog content surface. Portals, paints the backdrop, traps focus,
 * activates body scroll lock, and wires `role="dialog"` +
 * `aria-modal="true"`. `size` and `position` are visual-only variants.
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
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
    ...rest
  },
  ref,
) {
  const ctx = useDialogCtx();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const composedRef = composeRefs<HTMLDivElement>(ref as never, (node) => {
    contentRef.current = node;
  });

  useFocusTrap({
    active: ctx.open,
    containerRef: contentRef,
    returnFocusRef: ctx.triggerRef,
  });
  useEscapeToClose(ctx.open && closeOnEscape, () => ctx.setOpen(false));

  if (!ctx.open) return null;

  return (
    <OverlayPortal container={container}>
      {!hideOverlay ? (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          // The backdrop is a button to satisfy the click target and pointer
          // affordance contract without needing custom event composition.
          // It sits behind the content via CSS z-index. Disabling its own
          // outline keeps focus visible only on real content focusables.
          className={overlayBackdrop}
          onClick={() => {
            if (closeOnOverlayClick) ctx.setOpen(false);
          }}
        />
      ) : null}
      <div
        ref={composedRef}
        role={DIALOG_ROLE}
        aria-modal="true"
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.descriptionId}
        data-state="open"
        data-cynosure-overlay=""
        tabIndex={-1}
        className={cn(
          dialogContent,
          dialogSize[size],
          position === 'top' ? dialogPositionTop : undefined,
          className,
        )}
        {...rest}
      >
        {children}
        {showCloseButton ? (
          <IconButton
            variant="bare"
            label={closeLabel}
            icon={<X />}
            className={overlayCloseButton}
            onClick={() => ctx.setOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 4,
              borderRadius: 6,
              cursor: 'pointer',
              color: 'inherit',
            }}
          />
        ) : null}
      </div>
    </OverlayPortal>
  );
});

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

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

/**
 * Accessible heading for the dialog. Wired automatically as the
 * `aria-labelledby` target via the shared `titleId` from `useDialogState`.
 */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { className, ...rest },
  ref,
) {
  const ctx = useDialogCtx();
  return <h2 ref={ref} id={ctx.titleId} className={cn(dialogTitle, className)} {...rest} />;
});

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

/**
 * Supporting body copy beneath the title. Wired automatically as the
 * `aria-describedby` target.
 */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...rest }, ref) {
    const ctx = useDialogCtx();
    return (
      <p ref={ref} id={ctx.descriptionId} className={cn(dialogDescription, className)} {...rest} />
    );
  },
);

function chain<E>(...fns: Array<((event: E) => unknown) | undefined>): (event: E) => void {
  return (event: E) => {
    for (const fn of fns) {
      if (typeof fn === 'function') fn(event);
    }
  };
}
