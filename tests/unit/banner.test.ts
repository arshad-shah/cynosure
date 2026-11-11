import { describe, expect, it } from "vitest";
import { clientBanner } from "../../tools/banner";

describe("use client banner (M10)", () => {
  it("marks interactive modules as client components", () => {
    for (const id of [
      "components/Button/Button",
      "foundations/ButtonBase/ButtonBase",
      "theme/CynosureTheme",
      "theme/use-color-mode",
    ])
      expect(clientBanner(id)).toBe('"use client";');
  });
  it("leaves pure modules usable from server components", () => {
    for (const id of ["tokens/create-theme", "icons/search", "adapters/vite/index", "styles/inline", "index"])
      expect(clientBanner(id)).toBe("");
  });
});
