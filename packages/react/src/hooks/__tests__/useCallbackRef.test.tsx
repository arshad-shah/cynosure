import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCallbackRef } from '../useCallbackRef.js';

describe('useCallbackRef', () => {
  it('returns a stable function identity across renders', () => {
    const { result, rerender } = renderHook(({ cb }: { cb: () => void }) => useCallbackRef(cb), {
      initialProps: { cb: () => {} },
    });
    const first = result.current;
    rerender({ cb: () => {} });
    expect(result.current).toBe(first);
  });

  it('always invokes the latest callback', () => {
    const a = vi.fn();
    const b = vi.fn();
    const { result, rerender } = renderHook(({ cb }: { cb: () => void }) => useCallbackRef(cb), {
      initialProps: { cb: a },
    });
    result.current();
    expect(a).toHaveBeenCalledTimes(1);
    rerender({ cb: b });
    result.current();
    expect(b).toHaveBeenCalledTimes(1);
    expect(a).toHaveBeenCalledTimes(1);
  });
});
