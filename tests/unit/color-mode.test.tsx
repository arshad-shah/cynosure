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

  it("ignores stored garbage", () => {
    const storage = { get: () => "purple", set: () => {} };
    const { result } = renderHook(() => useColorMode({ storage }));
    expect(result.current.mode).toBe("system");
  });
});
