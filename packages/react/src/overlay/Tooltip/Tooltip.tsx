import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { tooltipArrow, tooltipContent } from './Tooltip.css.js';

/**
 * Application-level provider. Place once near the app root so every Tooltip
 * inside shares delay / skipDelay timing. Individual `Tooltip`s also work
 * without a provider — they mount their own.
 */
export const TooltipProvider = RadixTooltip.Provider;

/**
 * Props for the thin `Tooltip` wrapper around Radix's tooltip primitive.
 */
export interface TooltipProps {
  /** The tip body. Plain string or arbitrary `ReactNode`. */
  content: ReactNode;
  /** The trigger — must be a single React element. Wrapped with `asChild`. */
  children: ReactElement;
  /**
   * Preferred placement relative to the trigger. Radix flips to the
   * opposite side if there's not enough room.
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
   * the tooltip appears.
   * @default 300
   */
  delayMs?: number;
  /**
   * Disable the tooltip and render the child unwrapped (no Radix wiring,
   * no portal).
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
  /** Portal target — forwarded to Radix's `Portal`. */
  container?: HTMLElement | (() => HTMLElement);
}

/**
 * Thin tooltip API — one `content` prop, one child.
 *
 * **Tooltips are not a replacement for accessible labels.** Icon-only
 * buttons should use `IconButton label="…"`; the tooltip is for secondary,
 * non-essential context. See the spec doc for details.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  alignOffset,
  delayMs = 300,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  withArrow = true,
  className,
  container,
}: TooltipProps): ReactElement {
  if (disabled) return children;

  const resolvedContainer = typeof container === 'function' ? container() : container;

  return (
    <RadixTooltip.Root
      delayDuration={delayMs}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal container={resolvedContainer}>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn(tooltipContent, className)}
          data-cynosure-overlay=""
        >
          {content}
          {withArrow ? <RadixTooltip.Arrow className={tooltipArrow} width={10} height={5} /> : null}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
