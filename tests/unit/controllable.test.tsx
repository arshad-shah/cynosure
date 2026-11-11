// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "../../src/foundations/controllable";

describe("controllable state", () => {
  it("keeps its own value when uncontrolled, and reports changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<number>(undefined, 1, onChange));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenLastCalledWith(2);
    // A form reset goes back quietly.
    act(() => result.current[2](1));
    expect(result.current[0]).toBe(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  it("follows the parent when controlled", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ v }) => useControllableState<number>(v, 1, onChange), {
      initialProps: { v: 5 as number | undefined },
    });
    const set = result.current[1];
    act(() => set(9));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenLastCalledWith(9);
    act(() => result.current[2](1));
    expect(result.current[0]).toBe(5);
    rerender({ v: 9 });
    expect(result.current[0]).toBe(9);
    // `set` is stable across renders, so effects can depend on it.
    expect(result.current[1]).toBe(set);
  });
});
