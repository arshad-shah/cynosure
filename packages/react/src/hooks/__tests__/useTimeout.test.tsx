import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimeout } from '../useTimeout.js';

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs once after the delay', () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, 100));
    vi.advanceTimersByTime(50);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('is cancelable via null delay', () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, null));
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });
});
