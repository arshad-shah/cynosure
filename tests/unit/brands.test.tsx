import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as brands from "../../src/brands";
import { Icon } from "../../src/foundations/Icon/Icon";
import * as icons from "../../src/icons";
import type { IconData } from "../../src/icons/types";
import { validateIcon } from "../../src/icons/validate";

const marks = Object.values(brands) as IconData[];

describe("brand marks", () => {
  it("are filled, sourced and coloured as their owners publish them", () => {
    expect(marks.length).toBeGreaterThanOrEqual(90);
    for (const m of marks) {
      expect(m.category).toBe("brands");
      expect(m.fill).toBe(true);
      expect(m.brand?.hex).toMatch(/^[0-9A-F]{6}$/);
      expect(m.brand?.source).toMatch(/^https?:\/\//);
      expect(m.body).toHaveLength(1);
    }
    expect(brands.github.brand?.guidelines).toBe("https://github.com/logos");
  });
  it("are not Facet icons", () => {
    expect(validateIcon(brands.github)[0]).toMatch(/not Facet icons/);
  });
  it("never reuse a Facet icon's name", () => {
    const facet = new Set(
      Object.values(icons).flatMap((v) => (typeof v === "object" && v && "name" in v ? [v.name] : [])),
    );
    expect(marks.filter((m) => facet.has(m.name)).map((m) => m.name)).toEqual([]);
  });
});

describe("iconToSvg", () => {
  const react = (icon: IconData, props: Record<string, unknown> = {}) =>
    renderToStaticMarkup(createElement(Icon, { icon, ...props }));
  it("draws the same markup as the React Icon", () => {
    expect(icons.iconToSvg(icons.search)).toBe(react(icons.search));
    expect(icons.iconToSvg(icons.download, { size: "lg", label: "Download" })).toBe(
      react(icons.download, { size: "lg", label: "Download" }),
    );
    expect(icons.iconToSvg(brands.github, { color: "brand", size: 20 })).toBe(
      react(brands.github, { color: "brand", size: 20 }),
    );
    expect(icons.iconToSvg(icons.check, { className: "x", color: "red" })).toBe(
      react(icons.check, { className: "x", color: "red" }),
    );
  });
  it("escapes what it is given", () => {
    expect(icons.iconToSvg(icons.check, { label: '"><script>' })).toContain(
      'aria-label="&quot;&gt;&lt;script&gt;"',
    );
  });
});
