import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThrottledCallback } from '../useThrottledCallback.js';

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the first call immediately and throttles subsequent calls', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    result.current('a');
    result.current('b');
    result.current('c');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('a');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });
});
