import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` warns during SSR. Fall back to `useEffect` in non-browser
 * environments so server renders stay quiet — components do all DOM work in
 * effects anyway.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
