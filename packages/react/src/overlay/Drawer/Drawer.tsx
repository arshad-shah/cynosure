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
import {
  type DialogState,
  useDialogState,
  useEscapeToClose,
  useFocusTrap,
} from '../shared/useDialog.js';
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

// See Dialog.tsx for why we hold the role in a constant.
const DIALOG_ROLE = 'dialog';

const DrawerCtx = createContext<DialogState | null>(null);
const useDrawerCtx = (): DialogState => {
  const ctx = useContext(DrawerCtx);
  if (!ctx) throw new Error('Drawer subcomponent must be used inside <Drawer>');
  return ctx;
};

export interface DrawerProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires on open-state change. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * Edge-anchored drawer root. Same contract as `Dialog` — owns open
 * state, ARIA wiring IDs, and ref-counted body scroll lock — with a
 * different visual shell for sheet / panel / tray patterns.
 */
export function Drawer({ open, defaultOpen, onOpenChange, children }: DrawerProps): ReactElement {
  const state = useDialogState({ open, defaultOpen, onOpenChange });
  return <DrawerCtx.Provider value={state}>{children}</DrawerCtx.Provider>;
}

type AnyProps = Record<string, unknown>;

export interface DrawerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

export const DrawerTrigger = forwardRef<HTMLElement, DrawerTriggerProps>(function DrawerTrigger(
  { asChild, children, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = useDrawerCtx();
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
      throw new Error('DrawerTrigger asChild expects a single React element child');
    }
    const childProps = (children as unknown as { props: AnyProps }).props;
    const existingRef = (childProps.ref as never) ?? (children as unknown as { ref?: unknown }).ref;
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
});

export interface DrawerCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(function DrawerClose(
  { asChild, children, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = useDrawerCtx();
  const handle = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(false);
  };
  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('DrawerClose asChild expects a single React element child');
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
});

export interface DrawerPortalProps {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}
export function DrawerPortal({ container, children }: DrawerPortalProps): ReactElement {
  return <OverlayPortal container={container}>{children}</OverlayPortal>;
}

export interface DrawerContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Edge the drawer slides in from. @default "right" */
  side?: DrawerSide;
  /** Drawer breadth. @default "md" */
  size?: DrawerSize;
  /** @default true */
  closeOnOverlayClick?: boolean;
  /** @default true */
  closeOnEscape?: boolean;
  /** @default true */
  showCloseButton?: boolean;
  /** @default "Close" */
  closeLabel?: string;
  container?: HTMLElement | (() => HTMLElement);
  /** @default false */
  hideOverlay?: boolean;
  children?: ReactNode;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
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
    ...rest
  },
  ref,
) {
  const ctx = useDrawerCtx();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const composedRef = composeRefs<HTMLDivElement>(ref as never, (node) => {
    contentRef.current = node;
  });
  const isHorizontal = side === 'left' || side === 'right';

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
        data-side={side}
        data-cynosure-overlay=""
        tabIndex={-1}
        className={cn(
          drawerContent,
          drawerSide[side],
          isHorizontal ? drawerSizeHorizontal[size] : drawerSizeVertical[size],
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

export const DrawerHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(drawerHeader, className)} {...rest} />;
  },
);

export const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(drawerFooter, className)} {...rest} />;
  },
);

export const DrawerTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function DrawerTitle({ className, ...rest }, ref) {
    const ctx = useDrawerCtx();
    return <h2 ref={ref} id={ctx.titleId} className={cn(drawerTitle, className)} {...rest} />;
  },
);

export const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function DrawerDescription({ className, ...rest }, ref) {
  const ctx = useDrawerCtx();
  return (
    <p ref={ref} id={ctx.descriptionId} className={cn(drawerDescription, className)} {...rest} />
  );
});

function chain<E>(...fns: Array<((event: E) => unknown) | undefined>): (event: E) => void {
  return (event: E) => {
    for (const fn of fns) {
      if (typeof fn === 'function') fn(event);
    }
  };
}
