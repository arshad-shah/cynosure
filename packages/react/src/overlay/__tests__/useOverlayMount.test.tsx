import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOverlayMount } from '../shared/useOverlayMount.js';

describe('useOverlayMount', () => {
  it('renders immediately when initial open=true', () => {
    const { result } = renderHook(() => useOverlayMount(true));
    expect(result.current[0]).toBe(true);
  });

  it('defers mount removal until onAnimationComplete(true) fires', () => {
    const { result, rerender } = renderHook(({ open }) => useOverlayMount(open), {
      initialProps: { open: true },
    });
    expect(result.current[0]).toBe(true);

    rerender({ open: false });
    // still mounted while exit animation runs
    expect(result.current[0]).toBe(true);

    act(() => result.current[1](true));
    expect(result.current[0]).toBe(false);
  });

  it('does nothing if onAnimationComplete fires while still open', () => {
    const { result } = renderHook(() => useOverlayMount(true));
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  it('keeps the overlay mounted if onAnimationComplete reports done=false', () => {
    const { result, rerender } = renderHook(({ open }) => useOverlayMount(open), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(true);
  });

  it('re-mounts on a subsequent open=true', () => {
    const { result, rerender } = renderHook(({ open }) => useOverlayMount(open), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(false);

    rerender({ open: true });
    expect(result.current[0]).toBe(true);
  });
});
