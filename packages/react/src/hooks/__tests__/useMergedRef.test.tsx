import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useMergedRef } from '../useMergedRef.js';

describe('useMergedRef', () => {
  it('assigns to every supplied ref', () => {
    const obj: RefObject<string | null> = { current: null };
    const fn = vi.fn();
    const { result } = renderHook(() => useMergedRef<string>(obj, fn));
    result.current('v');
    expect(obj.current).toBe('v');
    expect(fn).toHaveBeenCalledWith('v');
  });
});
