import { useCallback, useEffect, useRef, useState } from 'react';
import { useCallbackRef } from './useCallbackRef.js';

// Don't pull in `@types/node` just to read NODE_ENV — widen `process` locally
// and guard the access with a `typeof` check so builds work outside Node.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

const isDev = (): boolean => {
  try {
    return typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';
  } catch {
    return false;
  }
};

export interface UseControllableStateParams<T> {
  /** Controlled value from props. Pass `undefined` for uncontrolled mode. */
  value?: T;
  /** Initial value when uncontrolled. */
  defaultValue?: T | (() => T);
  /** Fires in both modes whenever the value changes. */
  onChange?: (value: T) => void;
}

type Updater<T> = T | ((prev: T) => T);

const isUpdaterFn = <T>(next: Updater<T>): next is (prev: T) => T => typeof next === 'function';

/**
 * Bridge between controlled and uncontrolled modes for form-like components.
 * - In **controlled** mode the hook never updates internal state; it only
 *   calls `onChange`. The consumer must update `value` via their own state.
 * - In **uncontrolled** mode the hook owns the value and also calls
 *   `onChange` so consumers can observe changes.
 *
 * Switching modes mid-life (value goes from `undefined` to defined, or vice
 * versa) emits a dev-only warning — mixing modes usually indicates a bug.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): readonly [T, (next: Updater<T>) => void] {
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = (isControlled ? value : uncontrolled) as T;

  const onChangeRef = useCallbackRef(onChange);

  const currentRef = useRef(current);
  currentRef.current = current;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const setValue = useCallback(
    (next: Updater<T>) => {
      const resolved = isUpdaterFn(next) ? next(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!isControlledRef.current) {
        setUncontrolled(resolved);
      }
      onChangeRef(resolved);
    },
    [onChangeRef],
  );

  const wasControlledRef = useRef(isControlled);
  useEffect(() => {
    if (isDev()) {
      if (wasControlledRef.current !== isControlled) {
        const from = wasControlledRef.current ? 'controlled' : 'uncontrolled';
        const to = isControlled ? 'controlled' : 'uncontrolled';
        console.warn(
          `[cynosure] useControllableState: component is switching from ${from} to ${to}. Decide between passing \`value\` (controlled) or \`defaultValue\` (uncontrolled) for the lifetime of the component.`,
        );
      }
    }
    wasControlledRef.current = isControlled;
  }, [isControlled]);

  return [current, setValue] as const;
}
