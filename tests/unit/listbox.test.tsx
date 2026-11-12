// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { seekEnabled, useTypeahead } from "../../src/foundations/listbox";

const usable = (off: number[]) => (i: number) => !off.includes(i);

describe("seeking", () => {
  it("skips unusable items and stops at the ends", () => {
    expect(seekEnabled(5, 0, 1, usable([1]))).toBe(2);
    expect(seekEnabled(5, 4, 1, usable([]))).toBe(4);
    expect(seekEnabled(5, -1, 1, usable([0]))).toBe(1);
    expect(seekEnabled(5, 5, -1, usable([4]))).toBe(3);
    expect(seekEnabled(3, 1, 1, usable([1, 2]))).toBe(-1);
  });
  it("wraps when asked", () => {
    expect(seekEnabled(5, 4, 1, usable([0]), true)).toBe(1);
    expect(seekEnabled(5, 0, -1, usable([]), true)).toBe(4);
  });
});

describe("type-ahead", () => {
  const labels = ["Apple", "Banana", null, "Blueberry", "Cherry"];
  it("builds a word from quick keys and cycles on one letter", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTypeahead());
    const type = result.current;
    expect(type("b", labels, 0)).toBe(1);
    expect(type("l", labels, 1)).toBe(3);
    vi.advanceTimersByTime(600);
    expect(type("b", labels, 1)).toBe(3);
    vi.advanceTimersByTime(600);
    // "bb" matches nothing: the last key cycles instead.
    expect(type("b", labels, 3)).toBe(1);
    expect(type("b", labels, 1)).toBe(3);
    vi.advanceTimersByTime(600);
    expect(type("z", labels, 0)).toBe(-1);
    vi.useRealTimers();
  });
  it("starts at the first item when nothing is active", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTypeahead());
    expect(result.current("a", labels, -1)).toBe(0);
    vi.advanceTimersByTime(600);
    expect(result.current("b", labels, -1)).toBe(1);
    vi.advanceTimersByTime(600);
    expect(result.current("a", ["Apple", "Avocado"], -1)).toBe(0);
    vi.useRealTimers();
  });
});

describe("moving items", () => {
  it("takes the moved items out and puts them back together", async () => {
    const { moveItems } = await import("../../src/components/VirtualList/VirtualList");
    const id = (s: string) => s;
    expect(moveItems(["a", "b", "c", "d", "e"], ["b", "d"], 0, id)).toEqual(["b", "d", "a", "c", "e"]);
    expect(moveItems(["a", "b", "c", "d", "e"], ["b", "d"], 3, id)).toEqual(["a", "c", "e", "b", "d"]);
    expect(moveItems(["a", "b", "c"], ["c"], 1, id)).toEqual(["a", "c", "b"]);
  });
});
