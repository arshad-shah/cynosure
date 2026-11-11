// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { themeInitScript } from "../../src/theme/theme-init-script";

/** Runs the script text the way a browser would run an inline <script>. */
const run = (script: string) => new Function(script)();

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-cy-mode");
  document.body.innerHTML = "";
});

describe("themeInitScript", () => {
  it("applies the mode useColorMode saved, before React runs", () => {
    localStorage.setItem("cy-color-mode", "dark");
    run(themeInitScript());
    expect(document.documentElement.getAttribute("data-cy-mode")).toBe("dark");
  });

  it("leaves the page alone when nothing valid is saved", () => {
    run(themeInitScript());
    expect(document.documentElement.hasAttribute("data-cy-mode")).toBe(false);
    localStorage.setItem("cy-color-mode", "purple");
    run(themeInitScript());
    expect(document.documentElement.hasAttribute("data-cy-mode")).toBe(false);
  });

  it("never throws when storage is blocked", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(() => run(themeInitScript())).not.toThrow();
    } finally {
      if (original) Object.defineProperty(window, "localStorage", original);
    }
  });

  it("uses the same custom key as useColorMode", () => {
    localStorage.setItem("cy-color-mode", "dark");
    localStorage.setItem("my-app-mode", "light");
    run(themeInitScript({ key: "my-app-mode" }));
    expect(document.documentElement.getAttribute("data-cy-mode")).toBe("light");
  });

  it("can theme an app root instead of <html>", () => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.setItem("cy-color-mode", "system");
    run(themeInitScript({ selector: "#app" }));
    expect(document.getElementById("app")?.getAttribute("data-cy-mode")).toBe("system");
    expect(document.documentElement.hasAttribute("data-cy-mode")).toBe(false);
    // A selector that matches nothing is ignored.
    expect(() => run(themeInitScript({ selector: "#missing" }))).not.toThrow();
  });

  it("is safe to inline in HTML whatever the options", () => {
    const script = themeInitScript({
      key: "</script><script>alert(1)</script>",
      selector: '[data-x="</script>"]',
    });
    // No "<" at all, so the text can never close the surrounding <script> tag.
    expect(script).not.toContain("<");
    localStorage.setItem("</script><script>alert(1)</script>", "dark");
    document.body.innerHTML = '<b data-x="&lt;/script&gt;"></b>';
    run(script);
    expect(document.querySelector("b")?.getAttribute("data-cy-mode")).toBe("dark");
  });

  it("is small and self-contained", () => {
    const script = themeInitScript();
    expect(script.length).toBeLessThan(400);
    expect(script).not.toMatch(/\bimport\b|\brequire\(/);
  });
});
