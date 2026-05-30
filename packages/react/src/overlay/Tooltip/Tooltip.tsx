import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { composeRefs } from '../../utils/composeRefs.js';
import { OverlayPortal } from '../shared/OverlayPortal.js';
import { useFloatingPosition } from '../shared/useFloatingPosition.js';
import { tooltipArrow, tooltipContent } from './Tooltip.css.js';

interface TooltipProviderContextValue {
  delayDuration: number;
  skipDelayDuration: number;
  /** Tracks the last time a tooltip closed, so the next opens instantly. */
  recentlyShownRef: { current: number };
}

const TooltipProviderCtx = createContext<TooltipProviderContextValue | null>(null);

export interface TooltipProviderProps {
  /** Default delay (ms) before any tooltip opens on hover/focus. */
  delayDuration?: number;
  /**
   * Window (ms) during which subsequent tooltips open instantly after one
   * closes. Mirrors the Radix `skipDelayDuration` API.
   */
  skipDelayDuration?: number;
  children?: ReactNode;
}

/**
 * Application-level provider. Place once near the app root so every
 * `Tooltip` inside shares delay + skipDelay timing. Individual `Tooltip`s
 * also work without a provider — they fall back to defaults.
 */
export function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 300,
  children,
}: TooltipProviderProps): ReactElement {
  const recentlyShownRef = useRef<number>(0);
  const value = useMemo(
    () => ({ delayDuration, skipDelayDuration, recentlyShownRef }),
    [delayDuration, skipDelayDuration],
  );
  return <TooltipProviderCtx.Provider value={value}>{children}</TooltipProviderCtx.Provider>;
}

/** Props for the {@link Tooltip} component. */
export interface TooltipProps {
  /** The tip body. Plain string or arbitrary `ReactNode`. */
  content: ReactNode;
  /** The trigger — must be a single React element. The Tooltip composes onto it. */
  children: ReactElement;
  /**
   * Preferred placement relative to the trigger. Flips to the opposite
   * side when there isn't room on the preferred side.
   * @default "top"
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Alignment along the chosen side.
   * @default "center"
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Distance (in px) between the trigger and the tooltip surface.
   * @default 6
   */
  sideOffset?: number;
  /** Offset (in px) along the alignment axis. */
  alignOffset?: number;
  /**
   * Open delay in ms — time the pointer must rest on the trigger before
   * the tooltip appears. Falls back to the provider's `delayDuration`.
   */
  delayMs?: number;
  /**
   * Disable the tooltip and render the child unwrapped (no portal, no
   * listeners).
   * @default false
   */
  disabled?: boolean;
  /** Controlled open state; pair with `onOpenChange`. */
  open?: boolean;
  /** Initial open state in uncontrolled mode. */
  defaultOpen?: boolean;
  /** Change handler for the open state. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Render the caret arrow pointing at the trigger.
   * @default true
   */
  withArrow?: boolean;
  /** Forward a `className` onto the content element. */
  className?: string;
  /** Portal target — defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement);
}

type AnyProps = Record<string, unknown>;

/**
 * Thin tooltip — one `content` prop, one child. Composes onto the child
 * element (no extra wrapper DOM) and portals the surface into
 * `document.body`. Wires `aria-describedby` from the trigger to the
 * tooltip body so assistive tech reads the tip alongside the trigger.
 *
 * **Tooltips are not a replacement for accessible labels.** Icon-only
 * buttons should use `IconButton label="…"`; the tooltip is for
 * secondary, non-essential context.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  alignOffset = 0,
  delayMs,
  disabled = false,
  open: openProp,
  defaultOpen,
  onOpenChange,
  withArrow = true,
  className,
  container,
}: TooltipProps): ReactElement {
  const provider = useContext(TooltipProviderCtx);
  const delay = delayMs ?? provider?.delayDuration ?? 300;
  const skipDelay = provider?.skipDelayDuration ?? 300;

  const [openState, setOpenState] = useState<boolean>(defaultOpen ?? false);
  const open = openProp ?? openState;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
      if (!next && provider) provider.recentlyShownRef.current = Date.now();
    },
    [openProp, onOpenChange, provider],
  );

  const tooltipId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const openTimerRef = useRef<number | null>(null);

  const cancelTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const requestOpen = useCallback(() => {
    cancelTimers();
    if (disabled) return;
    // Skip the delay if a sibling tooltip closed recently (rapid-hover UX).
    const recentlyShown =
      provider !== null && Date.now() - provider.recentlyShownRef.current <= skipDelay;
    if (recentlyShown || delay === 0) {
      setOpen(true);
      return;
    }
    openTimerRef.current = window.setTimeout(() => setOpen(true), delay);
  }, [cancelTimers, disabled, provider, skipDelay, delay, setOpen]);

  const requestClose = useCallback(() => {
    cancelTimers();
    setOpen(false);
  }, [cancelTimers, setOpen]);

  useEffect(() => () => cancelTimers(), [cancelTimers]);

  // Close on Escape — only when open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, requestClose]);

  const positioning = useFloatingPosition({
    anchor,
    open,
    side,
    align,
    sideOffset,
    alignOffset,
  });

  if (disabled || !isValidElement(children)) return children;

  const childProps = (children as unknown as { props: AnyProps }).props;
  // biome-ignore lint/suspicious/noExplicitAny: refs aren't part of childProps in React 18 but are in React 19; fall back to element.ref for both.
  const existingRef = (childProps as any).ref ?? (children as unknown as { ref?: unknown }).ref;
  const composedRef = composeRefs<HTMLElement>(existingRef as never, (node) => setAnchor(node));

  const mergedTriggerProps: AnyProps = {
    ref: composedRef,
    onPointerEnter: chain(childProps.onPointerEnter as never, () => requestOpen()),
    onPointerLeave: chain(childProps.onPointerLeave as never, () => requestClose()),
    onFocus: chain(childProps.onFocus as never, () => requestOpen()),
    onBlur: chain(childProps.onBlur as never, () => requestClose()),
    // Mirror the Radix trigger contract — `data-state` flips between
    // `"closed"` and `"delayed-open"`/`"instant-open"` so CSS can drive
    // open-state styles on the trigger itself (e.g. press-state). The
    // attribute is unconditionally set while the Tooltip is mounted so
    // tests can assert it.
    'data-state': open ? 'instant-open' : 'closed',
    'aria-describedby': open
      ? joinAria(childProps['aria-describedby'] as string | undefined, tooltipId)
      : childProps['aria-describedby'],
  };

  return (
    <>
      {cloneElement(children, mergedTriggerProps as AnyProps)}
      {open ? (
        <OverlayPortal container={container}>
          {/* The `role="tooltip"` element is referenced via aria-describedby. */}
          <div
            id={tooltipId}
            role="tooltip"
            ref={positioning.ref as never}
            data-state={open ? 'instant-open' : 'closed'}
            data-side={positioning.side}
            data-align={positioning.align}
            data-cynosure-overlay=""
            className={cn(tooltipContent, className)}
            // Position via top/left rather than `transform` — the entrance
            // keyframe animates `transform: scale()`, which would otherwise
            // override a translate-based offset and snap the tooltip from the
            // top-left origin to its anchor once the animation ends.
            style={{
              position: 'fixed',
              top: positioning.y,
              left: positioning.x,
              visibility: positioning.ready ? 'visible' : 'hidden',
              pointerEvents: 'none',
            }}
          >
            {content}
            {withArrow ? <TooltipArrowSvg side={positioning.side} /> : null}
          </div>
        </OverlayPortal>
      ) : null}
    </>
  );
}

function joinAria(existing: string | undefined, id: string): string {
  if (!existing) return id;
  return existing.split(' ').includes(id) ? existing : `${existing} ${id}`;
}

function chain<E>(...fns: Array<((event: E) => unknown) | undefined>): (event: E) => void {
  return (event: E) => {
    for (const fn of fns) {
      if (typeof fn === 'function') fn(event);
    }
  };
}

// 10×5 caret matching the original Radix arrow geometry, positioned along
// the active side via the parent's data-side attribute.
function TooltipArrowSvg({ side }: { side: 'top' | 'right' | 'bottom' | 'left' }) {
  const flip = side === 'top' ? 1 : -1;
  // For left/right placement, the caret rotates 90 degrees.
  const sideline =
    side === 'top'
      ? { bottom: -5, left: '50%', transform: 'translateX(-50%)' }
      : side === 'bottom'
        ? { top: -5, left: '50%', transform: 'translateX(-50%) scaleY(-1)' }
        : side === 'left'
          ? { right: -5, top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }
          : { left: -5, top: '50%', transform: 'translateY(-50%) rotate(90deg)' };
  void flip;
  return (
    <svg
      aria-hidden="true"
      width={10}
      height={5}
      viewBox="0 0 10 5"
      className={tooltipArrow}
      style={{ position: 'absolute', ...sideline }}
    >
      <path d="M0 0 L5 5 L10 0 Z" />
    </svg>
  );
}
