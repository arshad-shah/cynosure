import { describe, expect, it } from "vitest";
import { clamp, decimals, plainNumber, roundLike } from "../../src/foundations/math";

describe("clamp", () => {
  it("keeps a value inside its bounds and settles on lo when hi is below it", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1)).toBe(0);
    expect(clamp(2, 4, 1)).toBe(4);
  });
});

describe("decimals", () => {
  it("counts the decimal places of plain numbers", () => {
    expect(decimals(1)).toBe(0);
    expect(decimals(0.5)).toBe(1);
    expect(decimals(0.05)).toBe(2);
    expect(decimals(-2.125)).toBe(3);
  });

  it("counts exponent notation", () => {
    expect(decimals(1e-7)).toBe(7);
    expect(decimals(1.5e-7)).toBe(8);
    expect(decimals(2e21)).toBe(0);
    expect(decimals(Number.NaN)).toBe(0);
  });
});

describe("plainNumber", () => {
  it("writes numbers without exponent notation", () => {
    expect(plainNumber(1e-7)).toBe("0.0000001");
    expect(plainNumber(-2.5e-8)).toBe("-0.000000025");
    expect(plainNumber(42)).toBe("42");
    expect(plainNumber(0.65)).toBe("0.65");
  });

  it("keeps String(n) for numbers it cannot write out", () => {
    expect(plainNumber(1e21)).toBe("1e+21");
    expect(plainNumber(Number.POSITIVE_INFINITY)).toBe("Infinity");
    expect(plainNumber(Number.NaN)).toBe("NaN");
  });
});

describe("roundLike", () => {
  it("rounds to the most decimals among the numbers it came from", () => {
    // min 0.5 with step 1: the result keeps min's half.
    expect(roundLike(0.5, 1, 0.5)).toBe(0.5);
    expect(roundLike(3.5000000000000004, 1, 0.5)).toBe(3.5);
    expect(roundLike(0.1 + 0.2, 0.1)).toBe(0.3);
  });

  it("keeps exponent steps", () => {
    expect(roundLike(1e-7, 1e-7, 0)).toBe(1e-7);
    expect(roundLike(3 * 1e-7, 1e-7)).toBe(3e-7);
  });
});
