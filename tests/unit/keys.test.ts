import { describe, expect, it } from "vitest";
import { isComposing, stepKey } from "../../src/foundations/keys";

const k = (key: string, shiftKey = false) => ({ key, shiftKey });
const base = { value: 50, min: 0, max: 100, step: 1 };

describe("slider keys", () => {
  it("steps with arrows, Shift, Page, Home and End", () => {
    expect(stepKey(k("ArrowRight"), base)).toBe(51);
    expect(stepKey(k("ArrowUp"), base)).toBe(51);
    expect(stepKey(k("ArrowLeft"), base)).toBe(49);
    expect(stepKey(k("ArrowDown", true), base)).toBe(40);
    expect(stepKey(k("PageUp"), { ...base, big: 5 })).toBe(55);
    expect(stepKey(k("PageDown"), base)).toBe(40);
    expect(stepKey(k("Home"), base)).toBe(0);
    expect(stepKey(k("End"), base)).toBe(100);
    expect(stepKey(k("Enter"), base)).toBeUndefined();
  });
  it("stays inside its range", () => {
    expect(stepKey(k("ArrowRight", true), { ...base, value: 95 })).toBe(100);
    expect(stepKey(k("PageDown"), { ...base, value: 3 })).toBe(0);
  });
  it("follows the reading direction and the axis", () => {
    expect(stepKey(k("ArrowRight"), { ...base, rtl: true })).toBe(49);
    expect(stepKey(k("ArrowLeft"), { ...base, rtl: true })).toBe(51);
    expect(stepKey(k("ArrowUp"), { ...base, axis: "x" })).toBeUndefined();
    expect(stepKey(k("ArrowRight"), { ...base, axis: "y" })).toBeUndefined();
    expect(stepKey(k("ArrowDown"), { ...base, axis: "y", downAdds: true })).toBe(51);
  });
  it("leaves Page, Home and End alone for one axis of an area", () => {
    expect(stepKey(k("Home"), { ...base, arrowsOnly: true })).toBeUndefined();
    expect(stepKey(k("PageUp"), { ...base, arrowsOnly: true })).toBeUndefined();
  });
});

describe("composition", () => {
  it("reads the flag and Safari's 229", () => {
    expect(isComposing({ isComposing: true, keyCode: 0 } as KeyboardEvent)).toBe(true);
    expect(isComposing({ isComposing: false, keyCode: 229 } as KeyboardEvent)).toBe(true);
    expect(isComposing({ nativeEvent: { isComposing: false, keyCode: 13 } } as never)).toBe(false);
  });
});
