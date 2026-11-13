// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  type ActiveOptionOptions,
  seekEnabled,
  useActiveOption,
  useTypeahead,
} from "../../src/foundations/listbox";

describe("the active option", () => {
  const listOf = (count: number) => {
    const list = document.createElement("div");
    for (let i = 0; i < count; i++) {
      const option = list.appendChild(document.createElement("div"));
      option.id = `l-${i}`;
      option.scrollIntoView = vi.fn();
    }
    return list;
  };
  const setup = (props: Omit<ActiveOptionOptions, "id" | "list">, list = listOf(props.count + 1)) =>
    renderHook(
      (p: Omit<ActiveOptionOptions, "id" | "list">) =>
        useActiveOption({ id: "l", list: { current: list }, ...p }),
      {
        initialProps: props,
      },
    );

  it("starts on the first usable option and stops at the ends", () => {
    const { result } = setup({ open: true, count: 4, usable: (i) => i !== 0 });
    expect(result.current.active).toBe(1);
    expect(result.current.activeId).toBe("l-1");
    act(() => result.current.move(-1));
    expect(result.current.active).toBe(1);
    act(() => result.current.setActive(result.current.last()));
    act(() => result.current.move(1));
    expect(result.current.active).toBe(3);
  });

  it("wraps when asked, and names nothing while closed or empty", () => {
    const { result, rerender } = setup({ open: true, count: 3, wrap: true });
    act(() => result.current.move(-1));
    expect(result.current.active).toBe(2);
    act(() => result.current.move(1));
    expect(result.current.active).toBe(0);
    rerender({ open: false, count: 3, wrap: true });
    expect(result.current.activeId).toBeUndefined();
    rerender({ open: true, count: 0 });
    expect(result.current.active).toBe(-1);
    expect(result.current.activeId).toBeUndefined();
    act(() => result.current.move(1));
    expect(result.current.active).toBe(-1);
  });

  it("follows the active option by key when the list changes, else gives way to the first", () => {
    let items = ["a", "b", "c"];
    const { result, rerender } = setup({ open: true, count: 3, keyOf: (i) => items[i] });
    act(() => result.current.setActive(2));
    items = ["x", "c"];
    rerender({ open: true, count: 2, keyOf: (i) => items[i] });
    expect(result.current.active).toBe(1);
    items = ["x", "y"];
    rerender({ open: true, count: 2, keyOf: (i) => items[i] });
    expect(result.current.active).toBe(0);
    // The option given way to is forgotten: it does not take over when it comes back.
    items = ["x", "c"];
    rerender({ open: true, count: 2, keyOf: (i) => items[i] });
    expect(result.current.active).toBe(0);
  });

  it("takes a footer as the last stop, never on its own", () => {
    const { result, rerender } = setup({ open: true, count: 2, footer: true });
    expect(result.current.first()).toBe(0);
    expect(result.current.last()).toBe(2);
    act(() => result.current.move(1));
    act(() => result.current.move(1));
    expect(result.current.active).toBe(2);
    act(() => result.current.move(1));
    expect(result.current.active).toBe(2);
    // An active footer stays active when the options go.
    rerender({ open: true, count: 0, footer: true });
    expect(result.current.active).toBe(0);
    const empty = setup({ open: true, count: 0, footer: true }).result;
    expect(empty.current.active).toBe(-1);
    act(() => empty.current.move(-1));
    expect(empty.current.active).toBe(0);
  });

  it("scrolls the active option into view while open", () => {
    const list = listOf(3);
    const { result } = setup({ open: true, count: 3 }, list);
    act(() => result.current.setActive(2));
    expect(list.children[2]?.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    act(() => result.current.setActive(-1));
    expect(result.current.active).toBe(0);
  });
});

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
