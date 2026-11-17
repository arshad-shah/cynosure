import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as brands from "../../src/brands";
import * as icons from "../../src/icons";
import { ICON_KEYWORDS } from "../../src/icons/keywords";
import { ICON_CATEGORIES, type IconData } from "../../src/icons/types";
import { validateIcon } from "../../src/icons/validate";
import { drawingKey, duplicateDrawings } from "../../tools/icon-drawing";

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
  it("is counted right where the documentation states a count (the README and the Icons guide)", () => {
    const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
    expect(read("README.md")).toContain(
      `${shipped.length} Facet stroke icons in ${ICON_CATEGORIES.length} categories`,
    );
    expect(read("docs/icons.md")).toContain(
      `${shipped.length} icons in ${ICON_CATEGORIES.length} categories`,
    );
    const marks = Object.values(brands).filter(
      (v) => typeof v === "object" && v !== null && "body" in v,
    ).length;
    expect(read("README.md")).toContain(`${marks} official brand marks`);
    expect(read("docs/icons.md")).toContain(`the official logos of ${marks} companies and projects`);
  });
  it("covers commerce, nature, travel, health, development, charts, home and social", () => {
    const byName = Object.fromEntries(shipped.map((i) => [i.name, i.category]));
    const members: Record<string, string[]> = {
      commerce: ["shopping-cart", "credit-card", "wallet", "receipt", "shopping-bag"],
      nature: ["cloud-rain", "snowflake", "thermometer", "sprout", "leaf"],
      travel: ["plane", "car", "train", "luggage", "map-pin", "route", "compass", "anchor"],
      health: ["heart-pulse", "pill", "stethoscope", "accessibility", "brain", "dumbbell"],
      development: ["git-commit", "git-merge", "git-pull-request", "git-branch", "code", "terminal", "bug"],
      charts: ["chart-pie", "chart-area", "trending-up", "chart-bar", "chart-line"],
      home: ["utensils", "chef-hat", "sofa", "washing-machine", "coffee"],
      social: ["thumbs-up", "smile", "trophy", "medal", "hand", "heart", "award", "party-popper"],
    };
    for (const [category, names] of Object.entries(members)) {
      expect(ICON_CATEGORIES, category).toContain(category);
      for (const name of names) expect(byName[name], name).toBe(category);
    }
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

describe("Facet drawings", () => {
  it("has no two icons with the same drawing", () => {
    expect(duplicateDrawings(shipped)).toEqual([]);
  });
  it("compares drawings, not how they are written", () => {
    const close = shipped.find((i) => i.name === "close") as IconData;
    // The same drawing with animate dropped, elements reordered and a number off by float noise.
    const rect: IconData["body"][number] = ["rect", { x: 3.5, y: 4.5, width: 17, height: 15, rx: 3 }];
    const a = { body: [rect, ["path", { d: "M9.5 4.5v15", animate: true }]] } as Pick<IconData, "body">;
    const b = {
      body: [
        ["path", { d: "M9.5 4.5v15" }],
        ["rect", { x: 3.5000001, y: 4.5, width: 17, height: 15, rx: 3 }],
      ],
    } as Pick<IconData, "body">;
    expect(drawingKey(a)).toBe(drawingKey(b));
    expect(duplicateDrawings([{ ...close, name: "x" }, close])).toEqual([["x", "close"]]);
    // A filled shape is a different drawing from its outline.
    expect(drawingKey(close)).not.toBe(drawingKey({ ...close, fill: true }));
  });
});
