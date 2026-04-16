import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { useMediaQuery } from '../useMediaQuery.js';

describe('useMediaQuery', () => {
  let mm: ReturnType<typeof installMatchMediaMock>;
  beforeEach(() => {
    mm = installMatchMediaMock({ '(min-width: 640px)': false });
  });
  afterEach(() => {
    mm.reset();
  });

  it('reflects the initial match state', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'));
    expect(result.current).toBe(false);
  });

  it('updates when the media query flips', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'));
    act(() => mm.set('(min-width: 640px)', true));
    expect(result.current).toBe(true);
  });
});
