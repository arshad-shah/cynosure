import { describe, expect, it, vi } from "vitest";
import { mergeRefs, setRef } from "../../src/foundations/refs";

describe("setRef", () => {
  it("calls a callback ref, sets an object ref and skips a missing one", () => {
    const callback = vi.fn();
    const object: { current: string | null } = { current: null };
    setRef(callback, "a");
    setRef(object, "b");
    setRef(undefined, "c");
    setRef(null, "d");
    expect(callback).toHaveBeenCalledWith("a");
    expect(object.current).toBe("b");
  });
});

describe("mergeRefs", () => {
  it("points every ref at the value, and clears them all with null", () => {
    const callback = vi.fn();
    const object: { current: number | null } = { current: null };
    const merged = mergeRefs<number>(callback, object, undefined);
    merged(1);
    expect(callback).toHaveBeenLastCalledWith(1);
    expect(object.current).toBe(1);
    merged(null);
    expect(callback).toHaveBeenLastCalledWith(null);
    expect(object.current).toBeNull();
  });
});
