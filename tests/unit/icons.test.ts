import { describe, expect, it } from "vitest";
import * as icons from "../../src/icons";
import { ICON_KEYWORDS } from "../../src/icons/keywords";
import { ICON_CATEGORIES, type IconData } from "../../src/icons/types";
import { validateIcon } from "../../src/icons/validate";

const shipped = Object.values(icons).filter(
  (v): v is IconData => typeof v === "object" && v !== null && "body" in v,
);
// (`iconToSvg` is a function and so is left out above.)

describe("Facet icon set", () => {
  it("ships a broad set covering every category with unique names", () => {
    expect(shipped.length).toBeGreaterThanOrEqual(120);
    expect(new Set(shipped.map((i) => i.name)).size).toBe(shipped.length);
    expect(new Set(shipped.map((i) => i.category))).toEqual(new Set(ICON_CATEGORIES));
  });
  it.each(shipped.map((i) => [i.name, i] as const))("%s passes validateIcon", (_name, icon) => {
    expect(validateIcon(icon)).toEqual([]);
  });
});

describe("search keywords", () => {
  it("every icon has words to be found by, and no words are left for an icon that is gone", () => {
    const names = shipped.map((icon) => icon.name).sort();
    expect(Object.keys(ICON_KEYWORDS).sort()).toEqual(names);
    for (const [name, words] of Object.entries(ICON_KEYWORDS)) {
      expect(words.length, name).toBeGreaterThanOrEqual(2);
      // Lower case, and never just the name again: the name is searched anyway.
      for (const word of words) expect(word, name).toBe(word.toLowerCase());
      expect(words, name).not.toContain(name);
    }
  });
});

describe("validateIcon", () => {
  const ok: IconData = { name: "ok", category: "actions", body: [["path", { d: "M4 4h16" }]] };
  it("accepts a minimal valid icon", () => expect(validateIcon(ok)).toEqual([]));
  it("rejects an unknown category", () => {
    expect(validateIcon({ ...ok, category: "misc" as never }).join()).toMatch(/category/);
  });
  it("rejects text nodes", () => {
    expect(validateIcon({ ...ok, body: [["text" as "path", { d: "A" }]] }).join()).toMatch(/text/);
  });
  it("rejects fills (Facet icons are stroke only)", () => {
    expect(
      validateIcon({
        ...ok,
        body: [["rect", { x: 2, y: 2, width: 4, height: 4, fill: "red" } as never]],
      }).join(),
    ).toMatch(/fill/);
  });
  it("rejects rects outside the grid and invalid path data", () => {
    expect(validateIcon({ ...ok, body: [["rect", { x: 20, y: 2, width: 8, height: 4 }]] }).join()).toMatch(
      /grid/,
    );
    expect(validateIcon({ ...ok, body: [["path", { d: "M4 4 url(x)" }]] }).join()).toMatch(
      /invalid characters/,
    );
    expect(validateIcon({ ...ok, body: [] }).join()).toMatch(/empty/);
    expect(validateIcon({ ...ok, body: [["path", { d: "M1 1", stroke: "red" } as never]] }).join()).toMatch(
      /unsupported/,
    );
  });
  it("rejects coordinates outside the 24 grid and bad names", () => {
    expect(validateIcon({ ...ok, body: [["circle", { cx: 30, cy: 12, r: 2 }]] }).join()).toMatch(/grid/);
    expect(validateIcon({ ...ok, name: "Bad Name" }).join()).toMatch(/name/);
  });
});
