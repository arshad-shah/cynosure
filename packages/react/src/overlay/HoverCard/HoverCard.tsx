import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import { OverlayArrow } from '../shared/OverlayArrow.js';
import { OverlayPortal } from '../shared/OverlayPortal.js';
import { popoverArrow, popoverContent, popoverViewport } from '../shared/popover.css.js';
import { useFloatingPosition } from '../shared/useFloatingPosition.js';

// Held in a constant so biome's `useSemanticElements` doesn't suggest
// rewriting to `<dialog>` — the hover card needs to coexist alongside
// real Dialog stacking, and consumer CSS already targets the `<div>`.
const DIALOG_ROLE = 'dialog';

interface HoverCardContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  anchor: HTMLElement | null;
  setAnchor: (node: HTMLElement | null) => void;
  cancelClose: () => void;
  scheduleClose: () => void;
  scheduleOpen: () => void;
}

const HoverCardCtx = createContext<HoverCardContextValue | null>(null);
const useHoverCardCtx = (): HoverCardContextValue => {
  const ctx = useContext(HoverCardCtx);
  if (!ctx) throw new Error('HoverCard subcomponent must be used inside <HoverCard>');
  return ctx;
};

export interface HoverCardProps {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires on open-state change. */
  onOpenChange?: (open: boolean) => void;
  /** Open delay (ms) on pointer enter. Default 700. */
  openDelay?: number;
  /** Close delay (ms) on pointer leave. Default 300. */
  closeDelay?: number;
  children?: ReactNode;
}

/**
 * Hover-revealed rich preview. Opens on pointer enter with a configurable
 * open delay, positions with collision detection, and stays open while the
 * pointer is inside the trigger or the content. Not a keyboard-equivalent
 * affordance — for keyboard users it opens on focus but is purely
 * informational, so don't put primary actions inside it.
 */
export function HoverCard({
  open: openProp,
  defaultOpen,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  children,
}: HoverCardProps): ReactElement {
  const [internal, setInternal] = useState<boolean>(defaultOpen ?? false);
  const open = openProp ?? internal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);
  const cancelOpen = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);
  const scheduleOpen = useCallback(() => {
    cancelClose();
    cancelOpen();
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [cancelClose, cancelOpen, openDelay, setOpen]);
  const scheduleClose = useCallback(() => {
    cancelOpen();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [cancelOpen, closeDelay, setOpen]);

  useEffect(
    () => () => {
      cancelOpen();
      cancelClose();
    },
    [cancelOpen, cancelClose],
  );

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const value = useMemo<HoverCardContextValue>(
    () => ({ open, setOpen, anchor, setAnchor, cancelClose, scheduleClose, scheduleOpen }),
    [open, setOpen, anchor, cancelClose, scheduleClose, scheduleOpen],
  );

  return <HoverCardCtx.Provider value={value}>{children}</HoverCardCtx.Provider>;
}

type AnyProps = Record<string, unknown>;

export interface HoverCardTriggerProps extends HTMLAttributes<HTMLAnchorElement> {
  /** When true, composes the trigger props onto a single React-element child instead of rendering an `<a>`. */
  asChild?: boolean;
  /** The trigger content (text, single element with `asChild`, or arbitrary nodes when wrapping). */
  children: ReactNode;
}

/**
 * Trigger element. By default renders an `<a>` wrapping `children` (Radix
 * parity). Pass `asChild` to compose props onto a single React-element
 * child, in which case no wrapper DOM is introduced.
 */
export const HoverCardTrigger = forwardRef<HTMLElement, HoverCardTriggerProps>(
  function HoverCardTrigger({ asChild, children, ...rest }, ref) {
    const ctx = useHoverCardCtx();
    const setAnchorRef = (node: HTMLElement | null) => ctx.setAnchor(node);

    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error('HoverCardTrigger asChild expects a single React element child');
      }
      const childProps = (children as unknown as { props: AnyProps }).props;
      const existingRef =
        (childProps.ref as never) ?? (children as unknown as { ref?: unknown }).ref;
      const composedRef = composeRefs<HTMLElement>(
        ref as never,
        existingRef as never,
        setAnchorRef,
      );
      const merged: AnyProps = {
        ref: composedRef,
        onPointerEnter: chain(childProps.onPointerEnter as never, () => ctx.scheduleOpen()),
        onPointerLeave: chain(childProps.onPointerLeave as never, () => ctx.scheduleClose()),
        onFocus: chain(childProps.onFocus as never, () => ctx.scheduleOpen()),
        onBlur: chain(childProps.onBlur as never, () => ctx.scheduleClose()),
        'data-state': ctx.open ? 'open' : 'closed',
        ...rest,
      };
      return cloneElement(children, merged);
    }

    return (
      <a
        ref={composeRefs<HTMLElement>(ref as never, setAnchorRef) as never}
        data-state={ctx.open ? 'open' : 'closed'}
        onPointerEnter={chain(rest.onPointerEnter as never, () => ctx.scheduleOpen())}
        onPointerLeave={chain(rest.onPointerLeave as never, () => ctx.scheduleClose())}
        onFocus={chain(rest.onFocus as never, () => ctx.scheduleOpen())}
        onBlur={chain(rest.onBlur as never, () => ctx.scheduleClose())}
        {...rest}
      >
        {children}
      </a>
    );
  },
);

/**
 * Pass-through portal target — preserved for API parity with the Radix
 * surface. Defaults to `document.body`.
 */
export interface HoverCardPortalProps {
  container?: HTMLElement | (() => HTMLElement);
  children?: ReactNode;
}
export function HoverCardPortal({ container, children }: HoverCardPortalProps): ReactElement {
  return <OverlayPortal container={container}>{children}</OverlayPortal>;
}

/** Props for the {@link HoverCardContent}. */
export interface HoverCardContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Preferred placement. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment along the side. */
  align?: 'start' | 'center' | 'end';
  /** Distance (px) from the trigger. */
  sideOffset?: number;
  /** Offset (px) along the alignment axis. */
  alignOffset?: number;
  /** Viewport padding for collision detection. */
  collisionPadding?: number;
  /** Portal target — defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Render a caret pointing at the trigger. The caret is side-aware and stays
   * aimed at the trigger when the card flips or shifts.
   * @default true
   */
  withArrow?: boolean;
  /** Card body. */
  children?: ReactNode;
}

/**
 * Floating hover-card surface. Portals into the document and positions
 * relative to the trigger with collision detection. The card stays open
 * while the pointer is inside its own bounds so consumers can hover onto
 * links inside it without it dismissing.
 */
export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    {
      className,
      sideOffset = 8,
      align = 'center',
      side = 'bottom',
      alignOffset = 0,
      collisionPadding = 8,
      container,
      withArrow = true,
      children,
      style,
      ...rest
    },
    ref,
  ) {
    const ctx = useHoverCardCtx();
    const positioning = useFloatingPosition({
      anchor: ctx.anchor,
      open: ctx.open,
      side,
      align,
      sideOffset,
      alignOffset,
      collisionPadding,
    });
    if (!ctx.open) return null;
    const composedRef = composeRefs<HTMLDivElement>(ref as never, positioning.ref as never);
    return (
      <OverlayPortal container={container}>
        <div
          ref={composedRef}
          role={DIALOG_ROLE}
          data-state="open"
          data-side={positioning.side}
          data-align={positioning.align}
          data-cynosure-overlay=""
          className={cn(popoverContent, className)}
          style={{
            position: 'fixed',
            // Position via top/left, not `transform: translate3d`: the shared
            // `popoverContent` entrance keyframe animates `transform`, which
            // overrides an inline translate for the animation's duration and
            // would paint the card at the (0,0) origin before snapping to the
            // anchor. top/left aren't animated, so the position stays put.
            top: positioning.y,
            left: positioning.x,
            visibility: positioning.ready ? 'visible' : 'hidden',
            ...style,
          }}
          onPointerEnter={() => ctx.cancelClose()}
          onPointerLeave={() => ctx.scheduleClose()}
          {...rest}
        >
          <div className={popoverViewport}>{children}</div>
          {withArrow ? (
            <OverlayArrow
              side={positioning.side}
              offset={positioning.arrowOffset}
              className={popoverArrow}
            />
          ) : null}
        </div>
      </OverlayPortal>
    );
  },
);

/**
 * @deprecated The caret is now rendered by `HoverCardContent` itself (enabled
 * by default via its `withArrow` prop) so it can sit outside the scroll
 * viewport and reorient/aim itself like the Tooltip caret. This component
 * renders nothing and is retained only so existing imports keep type-checking;
 * remove it from your `HoverCardContent` and use `withArrow={false}` to opt
 * out.
 */
export function HoverCardArrow(_props: {
  className?: string;
  width?: number;
  height?: number;
}): ReactElement | null {
  return null;
}

function chain<E>(...fns: Array<((event: E) => unknown) | undefined>): (event: E) => void {
  return (event: E) => {
    for (const fn of fns) {
      if (typeof fn === 'function') fn(event);
    }
  };
}
