import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as entry from "../../src/icons";
import { iconByName, icons } from "../../src/icons/by-name";
import type { IconData } from "../../src/icons/types";

const dir = join(__dirname, "../../src/icons");
/** The modules in src/icons that are not icons. */
const NOT_ICONS = new Set(["by-name", "facet", "index", "keywords", "to-svg", "types", "validate"]);
const iconFiles = readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && !NOT_ICONS.has(f.slice(0, -3)))
  .map((f) => f.slice(0, -3))
  .sort();
const shipped = Object.values(entry).filter(
  (v): v is IconData => typeof v === "object" && v !== null && "body" in v,
);

describe("icons by name", () => {
  it("holds every icon file, and every icon of the icons entry, under its name", () => {
    expect(Object.keys(icons).sort()).toEqual(iconFiles);
    expect(Object.keys(icons).sort()).toEqual(shipped.map((i) => i.name).sort());
    for (const [name, icon] of Object.entries(icons)) expect(icon.name).toBe(name);
  });
  it("finds an icon by its kebab-case name, the same object the icons entry exports", () => {
    expect(iconByName("arrow-up-right")).toBe(entry.arrowUpRight);
    expect(iconByName("database")).toBe(entry.database);
  });
  it("answers undefined for anything that is not an icon's name", () => {
    for (const name of ["", "nope", "arrowUpRight", "Database", "toString", "__proto__", "constructor"])
      expect(iconByName(name), name).toBeUndefined();
  });
  it("cannot be changed by a plugin", () => {
    expect(Object.isFrozen(icons)).toBe(true);
  });
  it("is its own entry: neither the main entry nor the icons entry imports it", () => {
    const main = readFileSync(join(__dirname, "../../src/index.ts"), "utf8");
    const index = readFileSync(join(dir, "index.ts"), "utf8");
    expect(main).not.toMatch(/by-name/);
    expect(index).not.toMatch(/by-name/);
    const pkg = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf8"));
    expect(pkg.exports["./icons/by-name"]).toEqual({
      types: "./dist/icons/by-name.d.ts",
      default: "./dist/icons/by-name.js",
    });
  });
});
