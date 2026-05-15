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
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import {
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogHeader,
  dialogPositionTop,
  dialogSize,
  dialogTitle,
} from '../Dialog/Dialog.css.js';
import { OverlayPortal } from '../shared/OverlayPortal.js';
import { overlayBackdrop } from '../shared/overlay.css.js';
import type { OverlaySize } from '../shared/types.js';
import { type DialogState, useDialogState, useFocusTrap } from '../shared/useDialog.js';

// Distinct role from `Dialog`: AT-software announces an "alertdialog" with
// the same urgency as a live-region alert. Held in a constant so biome's
// `useSemanticElements` doesn't suggest rewriting to `<dialog>`.
const ALERTDIALOG_ROLE = 'alertdialog';

const AlertDialogCtx = createContext<DialogState | null>(null);
const useAlertDialogCtx = (): DialogState => {
  const ctx = useContext(AlertDialogCtx);
  if (!ctx) throw new Error('AlertDialog subcomponent must be used inside <AlertDialog>');
  return ctx;
};

export interface AlertDialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires on open-state change. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Destructive-action confirmation root. Same visual surface as `Dialog`
 * but:
 * - cannot be dismissed by clicking outside or pressing `Esc` (no
 *   escape hatches — the only exits are `AlertDialogAction` /
 *   `AlertDialogCancel`),
 * - uses `role="alertdialog"` so AT-software announces it with the
 *   urgency of a live-region alert,
 * - requires explicit action / cancel buttons.
 */
export function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: AlertDialogProps): ReactElement {
  const state = useDialogState({ open, defaultOpen, onOpenChange });
  return <AlertDialogCtx.Provider value={state}>{children}</AlertDialogCtx.Provider>;
}

type AnyProps = Record<string, unknown>;

export interface AlertDialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const AlertDialogTrigger = forwardRef<HTMLElement, AlertDialogTriggerProps>(
  function AlertDialogTrigger({ asChild, children, onClick, type = 'button', ...rest }, ref) {
    const ctx = useAlertDialogCtx();
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
        throw new Error('AlertDialogTrigger asChild expects a single React element child');
      }
      const childProps = (children as unknown as { props: AnyProps }).props;
      const existingRef =
        (childProps.ref as never) ?? (children as unknown as { ref?: unknown }).ref;
      const composed = composeRefs<HTMLElement>(ref as never, existingRef as never, setRef);
      return cloneElement(children, {
        ref: composed,
        ...shared,
        ...rest,
        onClick: chain(childProps.onClick as never, handleClick as never),
      } as AnyProps);
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
  },
);

/** Confirm/affirmative action — closes the dialog on click. Pair with `asChild`. */
export interface AlertDialogActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}
export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction({ asChild, children, onClick, type = 'button', ...rest }, ref) {
    const ctx = useAlertDialogCtx();
    const handle = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      ctx.setOpen(false);
    };
    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error('AlertDialogAction asChild expects a single React element child');
      }
      const childProps = (children as unknown as { props: AnyProps }).props;
      return cloneElement(children, {
        ref,
        ...rest,
        onClick: chain(childProps.onClick as never, handle as never),
      } as AnyProps);
    }
    return (
      <button ref={ref} type={type} onClick={handle} {...rest}>
        {children}
      </button>
    );
  },
);

/** Cancel/dismissive action — closes the dialog on click. Pair with `asChild`. */
export interface AlertDialogCancelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}
export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel({ asChild, children, onClick, type = 'button', ...rest }, ref) {
    const ctx = useAlertDialogCtx();
    const handle = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      ctx.setOpen(false);
    };
    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error('AlertDialogCancel asChild expects a single React element child');
      }
      const childProps = (children as unknown as { props: AnyProps }).props;
      return cloneElement(children, {
        ref,
        ...rest,
        onClick: chain(childProps.onClick as never, handle as never),
      } as AnyProps);
    }
    return (
      <button ref={ref} type={type} onClick={handle} {...rest}>
        {children}
      </button>
    );
  },
);

export interface AlertDialogPortalProps {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}
export function AlertDialogPortal({ container, children }: AlertDialogPortalProps): ReactElement {
  return <OverlayPortal container={container}>{children}</OverlayPortal>;
}

export interface AlertDialogContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** @default "sm" */
  size?: OverlaySize;
  /** @default "center" */
  position?: 'center' | 'top';
  container?: HTMLElement | (() => HTMLElement);
  /** @default false */
  hideOverlay?: boolean;
  children?: ReactNode;
}

/**
 * Alert dialog content surface. Portals into the document, paints the
 * backdrop, and traps focus. Suppresses outside-click and `Escape`
 * dismissal so destructive flows require an explicit choice via
 * `AlertDialogAction` / `AlertDialogCancel`.
 */
export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent(
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
    const ctx = useAlertDialogCtx();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const composedRef = composeRefs<HTMLDivElement>(ref as never, (node) => {
      contentRef.current = node;
    });
    useFocusTrap({
      active: ctx.open,
      containerRef: contentRef,
      returnFocusRef: ctx.triggerRef,
    });
    if (!ctx.open) return null;
    return (
      <OverlayPortal container={container}>
        {!hideOverlay ? (
          <button type="button" aria-hidden="true" tabIndex={-1} className={overlayBackdrop} />
        ) : null}
        <div
          ref={composedRef}
          role={ALERTDIALOG_ROLE}
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
        </div>
      </OverlayPortal>
    );
  },
);

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

export interface AlertDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle({ className, ...rest }, ref) {
    const ctx = useAlertDialogCtx();
    return <h2 ref={ref} id={ctx.titleId} className={cn(dialogTitle, className)} {...rest} />;
  },
);

export interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription({ className, ...rest }, ref) {
    const ctx = useAlertDialogCtx();
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
