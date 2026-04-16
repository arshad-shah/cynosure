import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useId } from '../useId.js';

describe('useId', () => {
  it('generates a non-empty stable id across renders', () => {
    const { result, rerender } = renderHook(() => useId());
    const first = result.current;
    expect(first).toBeTruthy();
    rerender();
    expect(result.current).toBe(first);
  });

  it('returns the provided id when one is given', () => {
    const { result } = renderHook(() => useId('custom-id'));
    expect(result.current).toBe('custom-id');
  });
});
