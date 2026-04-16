import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock();
});

afterEach(() => media.reset());

describe('useBreakpoint', () => {
  it('returns "base" when no breakpoints match', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('base');
  });

  it('reports the largest matching breakpoint', () => {
    media.set('(min-width: 40em)', true);
    media.set('(min-width: 48em)', true);
    media.set('(min-width: 64em)', true);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('lg');
  });

  it('updates when a query starts matching', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('base');
    act(() => {
      media.set('(min-width: 40em)', true);
      media.set('(min-width: 48em)', true);
    });
    expect(result.current).toBe('md');
  });
});
