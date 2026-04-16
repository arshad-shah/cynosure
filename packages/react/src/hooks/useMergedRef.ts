import { type Ref, type RefCallback, useCallback } from 'react';
import { composeRefs } from '../utils/composeRefs.js';

/**
 * Returns a stable ref-callback that forwards the node to all supplied refs.
 * Thin hook wrapper around {@link composeRefs} so callers don't need to
 * memoize the combined callback themselves.
 */
export function useMergedRef<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  // Depending on `refs` (the spread) ties the memoised callback to the
  // identities of each ref — matching them across renders is what keeps the
  // composed callback stable for consumers.
  return useCallback(composeRefs(...refs), refs);
}
