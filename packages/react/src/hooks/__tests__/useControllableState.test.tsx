import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from '../useControllableState.js';

describe('useControllableState', () => {
  it('uncontrolled: tracks internal state and calls onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 0, onChange }),
    );
    expect(result.current[0]).toBe(0);
    act(() => result.current[1](1));
    expect(result.current[0]).toBe(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('controlled: never mutates internal state; only calls onChange', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useControllableState({ value, onChange }),
      { initialProps: { value: 2 } },
    );
    expect(result.current[0]).toBe(2);
    act(() => result.current[1](9));
    expect(onChange).toHaveBeenCalledWith(9);
    expect(result.current[0]).toBe(2); // parent hasn't re-rendered yet
    rerender({ value: 9 });
    expect(result.current[0]).toBe(9);
  });

  it('warns in dev when switching from uncontrolled to controlled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = renderHook(
      ({ value }: { value?: number }) => useControllableState({ value, defaultValue: 0 }),
      { initialProps: { value: undefined as number | undefined } },
    );
    rerender({ value: 5 });
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls[0]?.[0]).toMatch(/uncontrolled to controlled/);
    warn.mockRestore();
  });

  it('warns when switching from controlled to uncontrolled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = renderHook(
      ({ value }: { value?: number }) => useControllableState({ value, defaultValue: 0 }),
      { initialProps: { value: 3 as number | undefined } },
    );
    rerender({ value: undefined });
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls[0]?.[0]).toMatch(/controlled to uncontrolled/);
    warn.mockRestore();
  });

  it('supports updater functions', () => {
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 10 }));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(11);
  });

  it('skips onChange when resolved value equals current', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 1, onChange }),
    );
    act(() => result.current[1](1));
    expect(onChange).not.toHaveBeenCalled();
  });
});
