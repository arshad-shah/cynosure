import { describe, expect, it } from "vitest";
import { parseNumber } from "../../src/components/NumberField/NumberField";

describe("parseNumber", () => {
  it("reads each locale's own separators", () => {
    expect(parseNumber("1,234.5", "en-US")).toBe(1234.5);
    expect(parseNumber("1.234,5", "de-DE")).toBe(1234.5);
    // French groups with a narrow no-break space; people also type a plain space.
    expect(parseNumber(new Intl.NumberFormat("fr-FR").format(1234.5), "fr-FR")).toBe(1234.5);
    expect(parseNumber("1 234,5", "fr-FR")).toBe(1234.5);
  });

  it("accepts typographic minus signs, currency and percent", () => {
    expect(parseNumber("−5", "en-US")).toBe(-5);
    expect(parseNumber("–3.5", "en-US")).toBe(-3.5);
    expect(parseNumber("€1,234.50", "en-US", { style: "currency", currency: "EUR" })).toBe(1234.5);
    expect(parseNumber("15%", "en-US", { style: "percent" })).toBe(0.15);
    expect(parseNumber("7.", "en-US")).toBe(7);
    expect(parseNumber(".5", "en-US")).toBe(0.5);
  });

  it("rejects what is not a number", () => {
    expect(parseNumber("", "en-US")).toBeNull();
    expect(parseNumber("abc", "en-US")).toBeNull();
    expect(parseNumber("1.2.3", "en-US")).toBeNull();
    expect(parseNumber("-", "en-US")).toBeNull();
    expect(parseNumber("1-2", "en-US")).toBeNull();
  });
});
