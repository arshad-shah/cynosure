import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClipboard } from '../useClipboard.js';

describe('useClipboard', () => {
  let writeText: ReturnType<typeof vi.fn>;
  const original = navigator.clipboard;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (original) {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: original });
    }
  });

  it('copies text and flips hasCopied', async () => {
    const { result } = renderHook(() => useClipboard({ timeout: 50 }));
    await act(async () => {
      await result.current.copy('hello');
    });
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.hasCopied).toBe(true);
    expect(result.current.copied).toBe('hello');
  });

  it('resets hasCopied after the timeout', async () => {
    const { result } = renderHook(() => useClipboard({ timeout: 50 }));
    await act(async () => {
      await result.current.copy('hello');
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.hasCopied).toBe(false);
  });

  it('reports errors and keeps hasCopied false on failure', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      const ok = await result.current.copy('nope');
      expect(ok).toBe(false);
    });
    expect(result.current.error?.message).toBe('denied');
    expect(result.current.hasCopied).toBe(false);
  });
});
