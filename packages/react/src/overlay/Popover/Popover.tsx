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
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import { OverlayPortal } from '../shared/OverlayPortal.js';
import { popoverArrow, popoverContent } from '../shared/popover.css.js';
import { useFloatingPosition } from '../shared/useFloatingPosition.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to `<dialog>`. Popovers are non-modal; consumer CSS already
// targets the `<div role="dialog">` element. Native `<dialog>` carries
// focus-trap + ::backdrop semantics we explicitly don't want here.
const DIALOG_ROLE = 'dialog';

interface PopoverContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  anchor: HTMLElement | null;
  setAnchor: (node: HTMLElement | null) => void;
  triggerRef: { current: HTMLElement | null };
  modal: boolean;
}

const PopoverCtx = createContext<PopoverContextValue | null>(null);
const usePopoverCtx = (): PopoverContextValue => {
  const ctx = useContext(PopoverCtx);
  if (!ctx) throw new Error('Popover subcomponent must be used inside <Popover>');
  return ctx;
};

export interface PopoverProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires on open-state change. */
  onOpenChange?: (open: boolean) => void;
  /**
   * When true, the popover behaves modally — outside clicks blur but the
   * popover holds focus until dismissed. Default false (non-modal).
   */
  modal?: boolean;
  children?: ReactNode;
}

/**
 * Trigger-anchored floating surface. Collision-aware positioning, focus
 * moves inside on open, focus returns to the trigger on close,
 * `Escape` and outside-click dismiss by default. Use for rich,
 * interactive content (forms, filter panels, color pickers). For
 * passive, hover-revealed content use `HoverCard`; for short labels use
 * `Tooltip`.
 */
export function Popover({
  open: openProp,
  defaultOpen,
  onOpenChange,
  modal = false,
  children,
}: PopoverProps): ReactElement {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const value = useMemo<PopoverContextValue>(
    () => ({ open, setOpen, anchor, setAnchor, triggerRef, modal }),
    [open, setOpen, anchor, modal],
  );
  return <PopoverCtx.Provider value={value}>{children}</PopoverCtx.Provider>;
}

type AnyProps = Record<string, unknown>;

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Compose onto a single React-element child instead of rendering a `<button>`. */
  asChild?: boolean;
  children: ReactNode;
}

/**
 * Trigger element. Default renders a `<button>` that toggles the popover
 * on click; `asChild` composes the trigger props onto a single React
 * element child.
 */
export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(function PopoverTrigger(
  { asChild, children, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = usePopoverCtx();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(!ctx.open);
  };
  const setAnchorRef = (node: HTMLElement | null) => {
    ctx.setAnchor(node);
    ctx.triggerRef.current = node;
  };
  const sharedProps: AnyProps = {
    'aria-expanded': ctx.open,
    'aria-haspopup': 'dialog',
    'data-state': ctx.open ? 'open' : 'closed',
  };
  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('PopoverTrigger asChild expects a single React element child');
    }
    const childProps = (children as unknown as { props: AnyProps }).props;
    const existingRef = (childProps.ref as never) ?? (children as unknown as { ref?: unknown }).ref;
    const composedRef = composeRefs<HTMLElement>(ref as never, existingRef as never, setAnchorRef);
    const merged: AnyProps = {
      ref: composedRef,
      ...sharedProps,
      ...rest,
      onClick: chain(childProps.onClick as never, handleClick as never),
    };
    return cloneElement(children, merged);
  }
  return (
    <button
      ref={composeRefs<HTMLElement>(ref as never, setAnchorRef) as never}
      type={type}
      {...sharedProps}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
});

/**
 * Optional explicit anchor element. When provided, positioning is
 * relative to this element rather than the trigger button (useful when
 * the visual anchor is somewhere other than the trigger).
 */
export const PopoverAnchor = forwardRef<HTMLElement, { children: ReactElement }>(
  function PopoverAnchor({ children }, ref) {
    const ctx = usePopoverCtx();
    if (!isValidElement(children)) {
      throw new Error('PopoverAnchor expects a single React element child');
    }
    const childProps = (children as unknown as { props: AnyProps }).props;
    const existingRef = (childProps.ref as never) ?? (children as unknown as { ref?: unknown }).ref;
    const composedRef = composeRefs<HTMLElement>(ref as never, existingRef as never, (node) =>
      ctx.setAnchor(node),
    );
    return cloneElement(children, { ref: composedRef } as AnyProps);
  },
);

/**
 * Closes the popover when activated. Default renders a `<button>`;
 * `asChild` composes onto a single child element.
 */
export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { asChild, children, onClick, type = 'button', ...rest },
  ref,
) {
  const ctx = usePopoverCtx();
  const handle = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(false);
  };
  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('PopoverClose asChild expects a single React element child');
    }
    const childProps = (children as unknown as { props: AnyProps }).props;
    const merged: AnyProps = {
      ...rest,
      onClick: chain(childProps.onClick as never, handle as never),
      ref,
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
 * Portal target — preserved for API parity. Defaults to `document.body`.
 */
export interface PopoverPortalProps {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}
export function PopoverPortal({ container, children }: PopoverPortalProps): ReactElement {
  return <OverlayPortal container={container}>{children}</OverlayPortal>;
}

/** Props for the {@link PopoverContent}. */
export interface PopoverContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Preferred placement. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment along the side. */
  align?: 'start' | 'center' | 'end';
  /** Distance (px) from the anchor. */
  sideOffset?: number;
  /** Offset (px) along the alignment axis. */
  alignOffset?: number;
  /** Viewport padding for collision detection. */
  collisionPadding?: number;
  /** Portal target — defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement);
  /** When `false`, disable focus auto-trap into the popover on open. */
  trapFocus?: boolean;
  /** Element to focus when the popover opens. Defaults to the first focusable descendant. */
  initialFocus?: 'first' | 'none';
  /** Whether `Escape` closes the popover. */
  closeOnEscape?: boolean;
  /** Whether outside clicks close the popover. */
  closeOnOutsideClick?: boolean;
  /** Body content. */
  children?: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Floating popover surface. Portals into the document and positions
 * relative to the trigger (or `PopoverAnchor`) with collision detection.
 * On open, focus moves to the first focusable descendant; on close,
 * focus returns to the trigger. `Escape` and outside-click dismiss by
 * default.
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      className,
      sideOffset = 8,
      align = 'center',
      side = 'bottom',
      alignOffset = 0,
      collisionPadding = 8,
      container,
      closeOnEscape = true,
      closeOnOutsideClick = true,
      initialFocus = 'first',
      trapFocus = true,
      children,
      style,
      onKeyDown,
      ...rest
    },
    ref,
  ) {
    const ctx = usePopoverCtx();
    const positioning = useFloatingPosition({
      anchor: ctx.anchor,
      open: ctx.open,
      side,
      align,
      sideOffset,
      alignOffset,
      collisionPadding,
    });
    const contentRef = useRef<HTMLDivElement | null>(null);

    // Focus the first focusable on open; return to trigger on close.
    useEffect(() => {
      if (!ctx.open) return undefined;
      const node = contentRef.current;
      if (!node) return undefined;
      const trigger = ctx.triggerRef.current;
      if (initialFocus === 'first') {
        const first = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? node).focus();
      }
      return () => {
        if (trigger && document.contains(trigger)) trigger.focus();
      };
    }, [ctx.open, initialFocus, ctx.triggerRef]);

    // Escape closes. Trap tab focus inside when trapFocus is on.
    useEffect(() => {
      if (!ctx.open) return undefined;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape) {
          event.preventDefault();
          ctx.setOpen(false);
          return;
        }
        if (event.key !== 'Tab' || !trapFocus) return;
        const node = contentRef.current;
        if (!node) return;
        const focusables = Array.from(
          node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey) {
          if (active === first || !node.contains(active)) {
            event.preventDefault();
            last?.focus();
          }
        } else if (active === last) {
          event.preventDefault();
          first?.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [ctx.open, closeOnEscape, trapFocus, ctx]);

    // Outside-click dismisses.
    useEffect(() => {
      if (!ctx.open || !closeOnOutsideClick) return undefined;
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (contentRef.current?.contains(target)) return;
        if (ctx.triggerRef.current?.contains(target)) return;
        ctx.setOpen(false);
      };
      // Listen on capture so we beat any descendant `stopPropagation`.
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [ctx.open, closeOnOutsideClick, ctx]);

    if (!ctx.open) return null;
    const composedRef = composeRefs<HTMLDivElement>(
      ref as never,
      positioning.ref as never,
      (node) => {
        contentRef.current = node;
      },
    );
    return (
      <OverlayPortal container={container}>
        <div
          ref={composedRef}
          role={DIALOG_ROLE}
          aria-modal={ctx.modal || undefined}
          tabIndex={-1}
          data-state="open"
          data-side={positioning.side}
          data-align={positioning.align}
          data-cynosure-overlay=""
          className={cn(popoverContent, className)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            transform: `translate3d(${positioning.x}px, ${positioning.y}px, 0)`,
            // Stay in the a11y tree even before the first measurement —
            // `visibility: hidden` would hide the popover from screen
            // readers and testing-library's getByRole. Position computes
            // in the first useLayoutEffect, so the (0,0) "flash" is
            // at most one paint frame and not user-visible.
            opacity: positioning.ready ? undefined : 0,
            ...style,
          }}
          onKeyDown={onKeyDown}
          {...rest}
        >
          {children}
        </div>
      </OverlayPortal>
    );
  },
);

/** Optional caret pointing at the trigger. */
export const PopoverArrow = forwardRef<
  SVGSVGElement,
  HTMLAttributes<SVGSVGElement> & { width?: number; height?: number }
>(function PopoverArrow({ className, width = 12, height = 6, ...rest }, ref) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn(popoverArrow, className)}
      {...rest}
    >
      <path d={`M0 0 L${width / 2} ${height} L${width} 0 Z`} />
    </svg>
  );
});

function chain<E>(...fns: Array<((event: E) => unknown) | undefined>): (event: E) => void {
  return (event: E) => {
    for (const fn of fns) {
      if (typeof fn === 'function') fn(event);
    }
  };
}
