import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInterval } from '../useInterval.js';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes the callback on every tick', () => {
    const cb = vi.fn();
    renderHook(() => useInterval(cb, 50));
    vi.advanceTimersByTime(150);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it('pauses when delay is null', () => {
    const cb = vi.fn();
    renderHook(() => useInterval(cb, null));
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });
});
