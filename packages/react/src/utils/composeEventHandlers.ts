import type { SyntheticEvent } from 'react';

/**
 * Composes two event handlers: the caller-supplied one runs first, then the
 * internal one — unless the caller calls `event.preventDefault()`, in which
 * case the internal handler is skipped. This mirrors Radix's semantics and
 * lets consumers opt out of built-in behaviour by preventing default.
 */
export function composeEventHandlers<E extends SyntheticEvent | Event>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true }: { checkForDefaultPrevented?: boolean } = {},
): (event: E) => void {
  return function composed(event) {
    theirHandler?.(event);
    if (checkForDefaultPrevented && (event as { defaultPrevented?: boolean }).defaultPrevented) {
      return;
    }
    ourHandler?.(event);
  };
}
