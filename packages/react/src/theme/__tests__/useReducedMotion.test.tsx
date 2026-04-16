import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installMatchMediaMock } from '../../test/matchMedia.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

let media: ReturnType<typeof installMatchMediaMock>;

beforeEach(() => {
  media = installMatchMediaMock({ '(prefers-reduced-motion: reduce)': false });
});

afterEach(() => {
  media.reset();
});

describe('useReducedMotion', () => {
  it('reads the initial preference', () => {
    media.set('(prefers-reduced-motion: reduce)', true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when the preference changes', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => media.set('(prefers-reduced-motion: reduce)', true));
    expect(result.current).toBe(true);
  });
});
