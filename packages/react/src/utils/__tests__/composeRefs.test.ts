import type { RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { composeRefs } from '../composeRefs.js';

describe('composeRefs', () => {
  it('assigns to object refs', () => {
    const a: RefObject<string | null> = { current: null };
    const b: RefObject<string | null> = { current: null };
    composeRefs(a, b)('value');
    expect(a.current).toBe('value');
    expect(b.current).toBe('value');
  });

  it('invokes function refs', () => {
    const fn = vi.fn();
    composeRefs(fn)('x');
    expect(fn).toHaveBeenCalledWith('x');
  });

  it('tolerates null/undefined refs', () => {
    const fn = vi.fn();
    expect(() => composeRefs(null, undefined, fn)('v')).not.toThrow();
    expect(fn).toHaveBeenCalledWith('v');
  });

  it('mixes function and object refs in one composition', () => {
    const obj: RefObject<string | null> = { current: null };
    const fn = vi.fn();
    composeRefs(fn, obj)('both');
    expect(fn).toHaveBeenCalledWith('both');
    expect(obj.current).toBe('both');
  });

  it('returns a cleanup that nulls object refs and invokes teardown callbacks', () => {
    const obj: RefObject<string | null> = { current: null };
    const teardown = vi.fn();
    const fn = vi.fn(() => teardown);
    const cleanup = composeRefs(obj, fn)('value');
    expect(obj.current).toBe('value');
    cleanup?.();
    expect(obj.current).toBe(null);
    expect(teardown).toHaveBeenCalledTimes(1);
  });
});
