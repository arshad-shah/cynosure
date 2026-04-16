import { useDirectionContext } from '../DirectionProvider.js';
import type { Direction } from '../types.js';

/**
 * Returns the active layout direction. Defaults to "ltr" outside a
 * `<DirectionProvider>` so consumers don't have to mount one for LTR-only
 * apps.
 */
export function useDirection(): Direction {
  return useDirectionContext().dir;
}
