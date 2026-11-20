import { describe, expect, it } from "vitest";
import { nextSorts, sortRows, sortRowsBy } from "../../src/foundations/sort.js";

const rows = [
  { name: "Cy", age: 40, city: "London" },
  { name: "Ann", age: 31, city: "Boston" },
  { name: "Bo", age: 31, city: "London" },
  { name: "Al", age: 40, city: "Boston" },
];
const get = (row: (typeof rows)[number], key: string) => row[key as keyof typeof row];

describe("sortRowsBy", () => {
  it("sorts by the first key and breaks ties with the next", () => {
    const by = sortRowsBy(
      rows,
      [
        { key: "city", direction: "ascending" },
        { key: "name", direction: "descending" },
      ],
      get,
    );
    expect(by.map((r) => r.name)).toEqual(["Ann", "Al", "Cy", "Bo"]);
    expect(
      sortRowsBy(
        rows,
        [
          { key: "age", direction: "descending" },
          { key: "name", direction: "ascending" },
        ],
        get,
      ).map((r) => r.name),
    ).toEqual(["Al", "Cy", "Ann", "Bo"]);
  });
  it("keeps the given order without keys", () => {
    expect(sortRowsBy(rows, [], get)).toEqual(rows);
  });
});

describe("sortRows", () => {
  it("sorts dates by time, not by their text", () => {
    // 1 January 2026 is a Thursday: as text, "Fri …" < "Mon …" < "Thu …" and the weekday would decide.
    const days = [new Date(2026, 0, 5), new Date(2026, 0, 1), new Date(2026, 0, 2)];
    expect(sortRows(days, (d) => d, "ascending").map((d) => d.getDate())).toEqual([1, 2, 5]);
    expect(sortRows(days, (d) => d, "descending").map((d) => d.getDate())).toEqual([5, 2, 1]);
  });
  it("sorts booleans false first and bigints as numbers", () => {
    expect(sortRows([true, false, true], (v) => v, "ascending")).toEqual([false, true, true]);
    expect(sortRows([10n, -2n, 9007199254740993n, -10n, 3n], (v) => v, "ascending")).toEqual([
      -10n,
      -2n,
      3n,
      10n,
      9007199254740993n,
    ]);
  });
});

describe("nextSorts", () => {
  it("a plain press sorts by that column alone, cycling", () => {
    const two = [
      { key: "city", direction: "ascending" },
      { key: "name", direction: "ascending" },
    ] as const;
    expect(nextSorts(two, "name", false)).toEqual([{ key: "name", direction: "ascending" }]);
    expect(nextSorts(two, "city", false)).toEqual([{ key: "city", direction: "descending" }]);
    expect(nextSorts([{ key: "city", direction: "descending" }], "city", false)).toEqual([]);
  });
  it("Shift adds a key, turns it around, then removes it", () => {
    let s = nextSorts([{ key: "city", direction: "ascending" }], "name", true);
    expect(s).toEqual([
      { key: "city", direction: "ascending" },
      { key: "name", direction: "ascending" },
    ]);
    s = nextSorts(s, "name", true);
    expect(s[1]).toEqual({ key: "name", direction: "descending" });
    expect(nextSorts(s, "name", true)).toEqual([{ key: "city", direction: "ascending" }]);
  });
});
