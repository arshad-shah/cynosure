import { describe, expect, it } from "vitest";
import { matchedCharacters } from "../../src/components/HighlightedText/HighlightedText";
import { textMatchAt, textMatches, textMatchRanges } from "../../src/foundations/text-match";

describe("text matching", () => {
  it("finds the query anywhere, ignoring case and its surrounding spaces", () => {
    expect(textMatches("Customer orders", "ORDER")).toBe(true);
    expect(textMatches("Customer orders", "  order ")).toBe(true);
    expect(textMatches("Customer orders", "invoice")).toBe(false);
    expect(textMatches("anything", "  ")).toBe(true);
    expect(textMatches("a.b", "a.b")).toBe(true);
    expect(textMatches("axb", "a.b")).toBe(false);
  });

  it("says where the first match starts", () => {
    expect(textMatchAt("Open file", "open")).toBe(0);
    expect(textMatchAt("Reopen file", "open")).toBe(2);
    expect(textMatchAt("Open file", "zzz")).toBe(-1);
    expect(textMatchAt("Open file", "")).toBe(0);
  });

  it("gives every occurrence, and keeps what is kept and what is marked the same", () => {
    expect(textMatchRanges("Order orders", " order")).toEqual([
      [0, 5],
      [6, 11],
    ]);
    expect(textMatchRanges("Order", "")).toEqual([]);
    // Case folding that changes a string's length (the dotted capital I) agrees between filtering and marking.
    for (const [text, query] of [
      ["İstanbul", "i̇"],
      ["STRASSE", "straße"],
      ["Ὀδυσσεύς", "ὀδυσσεύς"],
    ] as const) {
      const marked = matchedCharacters(text, undefined, query).some(Boolean);
      expect(marked, `${text} / ${query}`).toBe(textMatches(text, query));
    }
  });
});
