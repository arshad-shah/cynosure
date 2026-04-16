import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseClipboardOptions {
  /** How long the `hasCopied` flag stays true, in ms. Default 2000. */
  timeout?: number;
}

export interface UseClipboardReturn {
  /** Copies the text; resolves to `true` on success, `false` on failure. */
  copy: (text: string) => Promise<boolean>;
  /** The most recently copied text, or `null` if none. */
  copied: string | null;
  /** `true` for `timeout` ms after a successful copy. Reflects the latest attempt. */
  hasCopied: boolean;
  /** The error from the last failed `copy`, if any. */
  error: Error | null;
  /** Clears `copied` and `hasCopied`. */
  reset: () => void;
}

const ERROR_NOT_AVAILABLE = new Error('Clipboard API is not available in this environment.');

/**
 * `navigator.clipboard.writeText` wrapper that exposes success/error state
 * and auto-clears the "just copied" flag after `timeout` ms.
 */
export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      clearTimer();
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        setError(ERROR_NOT_AVAILABLE);
        setHasCopied(false);
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        setError(null);
        setHasCopied(true);
        timeoutRef.current = window.setTimeout(() => setHasCopied(false), timeout);
        return true;
      } catch (cause) {
        const err = cause instanceof Error ? cause : new Error(String(cause));
        setError(err);
        setHasCopied(false);
        return false;
      }
    },
    [clearTimer, timeout],
  );

  const reset = useCallback(() => {
    clearTimer();
    setCopied(null);
    setHasCopied(false);
    setError(null);
  }, [clearTimer]);

  return { copy, copied, hasCopied, error, reset };
}
