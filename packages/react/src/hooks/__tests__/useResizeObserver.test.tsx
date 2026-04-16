import { act, renderHook } from '@testing-library/react';
import { type RefObject, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResizeObserver } from '../useResizeObserver.js';

describe('useResizeObserver', () => {
  const original = globalThis.ResizeObserver;
  let trigger: ((entry: Partial<ResizeObserverEntry>) => void) | undefined;

  beforeEach(() => {
    class FakeRO {
      callback: ResizeObserverCallback;
      disconnect = vi.fn();
      unobserve = vi.fn();
      constructor(cb: ResizeObserverCallback) {
        this.callback = cb;
        trigger = (entry) => cb([entry as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      observe() {}
    }
    globalThis.ResizeObserver = FakeRO as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = original;
  });

  it('returns the latest entry', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const { result } = renderHook(() => {
      const ref = useRef(el) as RefObject<HTMLDivElement | null>;
      return useResizeObserver(ref);
    });
    expect(result.current).toBeNull();
    act(() => {
      trigger?.({ contentRect: { width: 42 } as DOMRectReadOnly });
    });
    expect(result.current?.contentRect.width).toBe(42);
    document.body.removeChild(el);
  });
});
