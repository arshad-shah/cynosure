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

export interface TooltipProps {
  /** The tip body. Plain string or arbitrary ReactNode. */
  content: ReactNode;
  /** The trigger — must be a single React element. */
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  /** Open delay in ms; default 300. */
  delayMs?: number;
  /** Disables the tooltip — renders the child unwrapped. */
  disabled?: boolean;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show the caret arrow pointing at the trigger. Default `true`. */
  withArrow?: boolean;
  /** Forward a className onto the content element. */
  className?: string;
  /** Custom portal container. */
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
          data-lumen-overlay=""
        >
          {content}
          {withArrow ? <RadixTooltip.Arrow className={tooltipArrow} width={10} height={5} /> : null}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
