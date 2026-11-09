import { describe, expect, it } from "vitest";
import * as icons from "../../src/icons";
import type { IconData } from "../../src/icons/types";
import { validateIcon } from "../../src/icons/validate";

const shipped = Object.values(icons).filter(
  (v): v is IconData => typeof v === "object" && v !== null && "body" in v,
);

describe("Facet icon set", () => {
  it("ships the starting set", () => {
    expect(shipped.map((i) => i.name).sort()).toEqual(
      [
        "arrow-down",
        "arrow-up",
        "check",
        "chevron-down",
        "chevron-right",
        "close",
        "code",
        "collapse",
        "copy",
        "download",
        "expand",
        "external",
        "folder",
        "info",
        "menu",
        "moon",
        "plus",
        "retry",
        "search",
        "sliders",
        "sun",
        "trash",
        "tree",
        "warning",
      ].sort(),
    );
  });
  it.each(shipped.map((i) => [i.name, i] as const))("%s passes validateIcon", (_name, icon) => {
    expect(validateIcon(icon)).toEqual([]);
  });
});

describe("validateIcon", () => {
  const ok: IconData = { name: "ok", body: [["path", { d: "M4 4h16" }]], star: { x: 3, y: 3 } };
  it("accepts a minimal valid icon", () => expect(validateIcon(ok)).toEqual([]));
  it("rejects text nodes", () => {
    expect(validateIcon({ ...ok, body: [["text" as "path", { d: "A" }]] }).join()).toMatch(/text/);
  });
  it("rejects fills other than the star", () => {
    expect(
      validateIcon({
        ...ok,
        body: [["rect", { x: 2, y: 2, width: 4, height: 4, fill: "red" } as never]],
      }).join(),
    ).toMatch(/fill/);
  });
  it("rejects an off-grid or wrongly sized star", () => {
    expect(validateIcon({ ...ok, star: { x: 23, y: 3 } }).join()).toMatch(/star/);
    expect(validateIcon({ ...ok, star: { x: 3, y: 3, size: 6 } }).join()).toMatch(/star/);
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
