import { act, renderHook } from '@testing-library/react';
import { type RefObject, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIntersection } from '../useIntersection.js';

interface FakeObserverInstance {
  observed: Element[];
  trigger: (entry: Partial<IntersectionObserverEntry>) => void;
}

describe('useIntersection', () => {
  let instances: FakeObserverInstance[];
  const original = globalThis.IntersectionObserver;

  beforeEach(() => {
    instances = [];
    class FakeIO {
      callback: IntersectionObserverCallback;
      observed: Element[] = [];
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
      root: Element | null = null;
      rootMargin = '';
      thresholds: number[] = [];

      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
        instances.push({
          observed: this.observed,
          trigger: (entry) =>
            this.callback(
              [entry as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            ),
        });
      }
      observe(el: Element) {
        this.observed.push(el);
      }
    }
    globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = original;
  });

  it('updates when the observer reports an entry', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const { result } = renderHook(() => {
      const ref = useRef(el) as RefObject<HTMLDivElement | null>;
      return useIntersection(ref);
    });
    expect(result.current).toBeNull();
    const inst = instances[0];
    expect(inst).toBeDefined();
    act(() => {
      inst?.trigger({ isIntersecting: true, intersectionRatio: 1 });
    });
    expect(result.current?.isIntersecting).toBe(true);
    document.body.removeChild(el);
  });

  it('returns null when the ref is unset', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useIntersection(ref);
    });
    expect(result.current).toBeNull();
    expect(instances).toHaveLength(0);
  });

  it('disconnects after the first hit when once is true', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    renderHook(() => {
      const ref = useRef(el) as RefObject<HTMLDivElement | null>;
      return useIntersection(ref, { once: true });
    });
    const inst = instances[0];
    act(() => inst?.trigger({ isIntersecting: true, intersectionRatio: 1 }));
    document.body.removeChild(el);
  });

  it('skips entries that are missing', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const { result } = renderHook(() => {
      const ref = useRef(el) as RefObject<HTMLDivElement | null>;
      return useIntersection(ref);
    });
    act(() => instances[0]?.trigger(undefined as unknown as IntersectionObserverEntry));
    expect(result.current).toBeNull();
    document.body.removeChild(el);
  });
});
