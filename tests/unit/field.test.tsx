// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useField } from "../../src/foundations/field";

describe("useField", () => {
  it("wires description and error into aria-describedby and marks invalid", () => {
    const { result } = renderHook(() =>
      useField({ id: "email", description: "We never share it", error: "Required" }),
    );
    expect(result.current).toMatchObject({
      id: "email",
      labelId: "email-label",
      descriptionId: "email-description",
      errorId: "email-error",
      invalid: true,
    });
    expect(result.current.describedBy).toBe("email-description email-error");
  });
  it("generates stable ids and omits describedby when there is nothing to describe", () => {
    const { result, rerender } = renderHook(() => useField({}));
    const first = result.current.id;
    rerender();
    expect(result.current.id).toBe(first);
    expect(result.current.describedBy).toBeUndefined();
    expect(result.current.invalid).toBe(false);
  });
  it("puts a caller's describedby ids before its own", () => {
    const { result } = renderHook(() =>
      useField({ id: "email", description: "Help", error: "Bad", describedBy: " hint other " }),
    );
    expect(result.current.describedBy).toBe("hint other email-description email-error");
    const { result: alone } = renderHook(() => useField({ id: "x", describedBy: "hint" }));
    expect(alone.current.describedBy).toBe("hint");
  });
});
