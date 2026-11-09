// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useColorMode } from "../../src/theme/use-color-mode";

describe("useColorMode", () => {
  it("falls back to system when storage throws", () => {
    const storage = {
      get: () => {
        throw new Error("denied");
      },
      set: () => {
        throw new Error("denied");
      },
    };
    const { result } = renderHook(() => useColorMode({ storage }));
    expect(result.current.mode).toBe("system");
    expect(() => act(() => result.current.setMode("dark"))).not.toThrow();
    expect(result.current.mode).toBe("dark");
  });

  it("persists through the provided storage and restores it", async () => {
    const data = new Map<string, string>();
    const storage = {
      get: (k: string) => data.get(k) ?? null,
      set: (k: string, v: string) => void data.set(k, v),
    };
    const first = renderHook(() => useColorMode({ storage, key: "mode" }));
    act(() => first.result.current.setMode("dark"));
    expect(data.get("mode")).toBe("dark");
    const second = renderHook(() => useColorMode({ storage, key: "mode" }));
    expect(second.result.current.mode).toBe("dark");
    expect(second.result.current.resolved).toBe("dark");
  });

  it("supports async storage such as chrome.storage", async () => {
    const storage = { get: async () => "light", set: async () => {} };
    const { result } = renderHook(() => useColorMode({ storage }));
    await act(async () => {});
    expect(result.current.mode).toBe("light");
  });

  it("uses localStorage by default", () => {
    localStorage.setItem("cy-color-mode", "dark");
    const { result } = renderHook(() => useColorMode());
    expect(result.current.mode).toBe("dark");
    act(() => result.current.setMode("light"));
    expect(localStorage.getItem("cy-color-mode")).toBe("light");
    localStorage.clear();
  });

  it("resolves system mode from the OS and follows changes", () => {
    let listener: (() => void) | undefined;
    let dark = true;
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      get matches() {
        return query.includes("dark") && dark;
      },
      addEventListener: (_: string, fn: () => void) => {
        listener = fn;
      },
      removeEventListener: () => {},
    })) as never;
    try {
      const storage = { get: () => null, set: () => {} };
      const { result, unmount } = renderHook(() => useColorMode({ storage }));
      expect(result.current.resolved).toBe("dark");
      dark = false;
      act(() => listener?.());
      expect(result.current.resolved).toBe("light");
      unmount();
    } finally {
      window.matchMedia = original;
    }
  });

  it("falls back to system when async storage rejects", async () => {
    const storage = {
      get: () => Promise.reject(new Error("nope")),
      set: () => Promise.reject(new Error("nope")),
    };
    const { result } = renderHook(() => useColorMode({ storage }));
    await act(async () => {});
    expect(result.current.mode).toBe("system");
    await act(async () => result.current.setMode("dark"));
    expect(result.current.mode).toBe("dark");
  });

  it("does not update state when unmounted before async storage resolves", async () => {
    let resolve: (v: string) => void = () => {};
    const storage = { get: () => new Promise<string>((r) => (resolve = r)), set: () => {} };
    const { result, unmount } = renderHook(() => useColorMode({ storage }));
    unmount();
    await act(async () => resolve("dark"));
    expect(result.current.mode).toBe("system");
  });

  it("M6: a slow storage read never overwrites a newer user choice", async () => {
    let resolve: (v: string) => void = () => {};
    const storage = { get: () => new Promise<string>((r) => (resolve = r)), set: () => {} };
    const { result } = renderHook(() => useColorMode({ storage }));
    act(() => result.current.setMode("dark"));
    await act(async () => resolve("light"));
    expect(result.current.mode).toBe("dark");
  });

  it("M6: an inline storage object does not re-read on every render", () => {
    let reads = 0;
    const { rerender } = renderHook(() =>
      useColorMode({ storage: { get: () => (reads++, "dark"), set: () => {} } }),
    );
    rerender();
    rerender();
    expect(reads).toBeLessThanOrEqual(2);
  });

  it("ignores stored garbage", () => {
    const storage = { get: () => "purple", set: () => {} };
    const { result } = renderHook(() => useColorMode({ storage }));
    expect(result.current.mode).toBe("system");
  });
});
