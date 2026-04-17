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
 *  to cover every edge-anchored overlay pattern we need. */
export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;
export const DrawerClose = RadixDialog.Close;
export const DrawerPortal = RadixDialog.Portal;

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export interface DrawerContentProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'asChild'> {
  side?: DrawerSide;
  size?: DrawerSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  container?: HTMLElement | (() => HTMLElement);
  hideOverlay?: boolean;
  children?: ReactNode;
}

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
          data-lumen-overlay=""
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

export const DrawerTitle = forwardRef<
  ElementRef<typeof RadixDialog.Title>,
  ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(function DrawerTitle({ className, ...rest }, ref) {
  return <RadixDialog.Title ref={ref} className={cn(drawerTitle, className)} {...rest} />;
});

export const DrawerDescription = forwardRef<
  ElementRef<typeof RadixDialog.Description>,
  ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(function DrawerDescription({ className, ...rest }, ref) {
  return (
    <RadixDialog.Description ref={ref} className={cn(drawerDescription, className)} {...rest} />
  );
});

// `Sheet` aliases. Same component, different name.
export {
  Drawer as Sheet,
  DrawerTrigger as SheetTrigger,
  DrawerClose as SheetClose,
  DrawerPortal as SheetPortal,
  DrawerContent as SheetContent,
  DrawerHeader as SheetHeader,
  DrawerFooter as SheetFooter,
  DrawerTitle as SheetTitle,
  DrawerDescription as SheetDescription,
};

export type {
  DrawerContentProps as SheetContentProps,
  DrawerSide as SheetSide,
  DrawerSize as SheetSize,
};
