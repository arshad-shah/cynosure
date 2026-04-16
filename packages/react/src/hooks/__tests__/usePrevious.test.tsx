import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePrevious } from '../usePrevious.js';

describe('usePrevious', () => {
  it('returns undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('a'));
    expect(result.current).toBeUndefined();
  });

  it('returns the value from the previous render', () => {
    const { result, rerender } = renderHook(({ v }: { v: string }) => usePrevious(v), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    rerender({ v: 'c' });
    expect(result.current).toBe('b');
  });
});
