import { describe, expect, it } from "vitest";
import { optimizePath, PRECISION } from "../../tools/icon-optimize";

describe("icon path optimization", () => {
  it("shortens path data", () => {
    expect(optimizePath("M 4 12 L 20 12 L 20 12")).toBe("M4 12h16");
  });
  it("keeps a zero-length segment, which a round cap draws as a dot", () => {
    expect(optimizePath("M12 7.75h.01")).toContain("h.01");
  });
  it(`rounds to ${PRECISION} decimals and never lengthens a path`, () => {
    expect(optimizePath("M1.23456 2.34567L5 5")).toBe("M1.235 2.346 5 5");
    const tight = "M4 12h16";
    expect(optimizePath(tight)).toBe(tight);
  });
});
