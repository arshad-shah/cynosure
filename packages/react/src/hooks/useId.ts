import { useId as useReactId } from 'react';

/**
 * SSR-safe stable ID. Thin wrapper over React 19's built-in `useId` that
 * accepts an optional caller-supplied ID — when provided, that value wins, so
 * consumers can pass a stable string without juggling conditionals.
 */
export function useId(providedId?: string): string {
  const generated = useReactId();
  return providedId ?? generated;
}
