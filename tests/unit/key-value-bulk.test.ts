import { describe, expect, it } from "vitest";
import { fromBulkText, pairName, toBulkText } from "../../src/components/KeyValueEditor/bulk";

const pairs = [
  { id: "a", key: "Accept", value: "*/*" },
  { id: "b", key: "Token", value: "x: y", secret: true },
  { id: "c", key: "Debug", value: "1", enabled: false },
];

describe("key and value text", () => {
  it("writes one line per pair, # for pairs switched off", () => {
    expect(toBulkText(pairs)).toBe("Accept: */*\nToken: x: y\n# Debug: 1");
  });
  it("reads lines back, keeping ids by position and secrets by key", () => {
    const back = fromBulkText("Accept: */*\n  Token :x: y \n#Debug:1\n\nBare\n", pairs, new Set(["Token"]));
    expect(back).toEqual([
      { id: "a", key: "Accept", value: "*/*" },
      { id: "b", key: "Token", value: "x: y", secret: true },
      { id: "c", key: "Debug", value: "1", enabled: false },
      { id: expect.stringMatching(/^kv-/), key: "Bare", value: "" },
    ]);
    expect(fromBulkText("Token: z", pairs)[0]).toEqual({ id: "a", key: "Token", value: "z" });
  });
  it("names a pair by its key or its position", () => {
    expect(pairName({ id: "q", key: "  ", value: "" }, 2, (n) => `Row ${n}`)).toBe("Row 3");
    expect(pairName(pairs[0] as never, 0, (n) => `Row ${n}`)).toBe("Accept");
  });
});
