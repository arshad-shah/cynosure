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

  it("reads back what the field writes, in any locale and style", () => {
    const cases: [string, Intl.NumberFormatOptions][] = [
      ["en-US", {}],
      ["de-DE", {}],
      ["ar-EG", {}],
      ["fa-IR", {}],
      ["hi-IN-u-nu-deva", {}],
      ["sv-SE", {}],
      ["th-TH-u-nu-thai", {}],
      ["bn-BD", {}],
      ["de-CH", {}],
      ["da-DK", { style: "currency", currency: "DKK" }],
      ["nb-NO", { style: "currency", currency: "NOK" }],
      ["de-CH", { style: "currency", currency: "CHF" }],
      ["ar-EG", { style: "currency", currency: "EGP" }],
      ["ja-JP", { style: "currency", currency: "JPY" }],
      ["en-US", { style: "currency", currency: "USD", currencySign: "accounting" }],
      ["en-US", { style: "currency", currency: "DKK", currencyDisplay: "name" }],
      ["de-DE", { style: "percent" }],
      ["ar-EG", { style: "percent" }],
      ["en-US", { style: "unit", unit: "kilometer-per-hour" }],
    ];
    for (const [locale, options] of cases)
      for (const n of [-1234.5, 1234.5, 0.25, 7]) {
        // The field writes with up to 20 fraction digits, as NumberField does.
        const written = new Intl.NumberFormat(locale, { maximumFractionDigits: 20, ...options }).format(n);
        expect({ locale, written, read: parseNumber(written, locale, options) }).toEqual({
          locale,
          written,
          read: n,
        });
      }
  });

  it("reads Danish kroner with the trailing dot", () => {
    expect(parseNumber("1.234,50 kr.", "da-DK", { style: "currency", currency: "DKK" })).toBe(1234.5);
    expect(parseNumber("١٬٢٣٤٫٥", "ar-EG")).toBe(1234.5);
    // A plain apostrophe works where the locale groups with a typographic one.
    expect(parseNumber("1'234.5", "de-CH")).toBe(1234.5);
  });

  it("rejects what is not a number", () => {
    expect(parseNumber("", "en-US")).toBeNull();
    expect(parseNumber("abc", "en-US")).toBeNull();
    expect(parseNumber("1.2.3", "en-US")).toBeNull();
    expect(parseNumber("-", "en-US")).toBeNull();
    expect(parseNumber("1-2", "en-US")).toBeNull();
  });
});
