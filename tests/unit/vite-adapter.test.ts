import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cynosure } from "../../src/adapters/vite";
import { CynosureThemeError } from "../../src/tokens";

const call = <T>(hook: unknown, ...args: unknown[]) => (hook as (...a: unknown[]) => T)(...args);

describe("cynosure() Vite adapter", () => {
  it("serves the product theme as a virtual stylesheet", () => {
    const plugin = cynosure({ theme: { accent: "#14b8a6", scale: "compact" } });
    const id = call<string>(plugin.resolveId, "virtual:cynosure/theme.css");
    expect(id).toBe("\0virtual:cynosure/theme.css");
    const css = call<string>(plugin.load, id);
    expect(css).toContain("--cy-color-accent:#14b8a6");
    expect(css).toContain("--cy-control-height-md:28px");
  });

  it("scopes the theme to a custom selector", () => {
    const plugin = cynosure({ selector: ":host" });
    expect(call<string>(plugin.load, "\0virtual:cynosure/theme.css").startsWith(":host{")).toBe(true);
  });

  it("serves all CSS plus the theme as a string module for shadow roots", () => {
    const dir = mkdtempSync(join(tmpdir(), "cy-vite-"));
    writeFileSync(join(dir, "styles.css"), ".cy-button{color:red}");
    const plugin = cynosure({ theme: { accent: "#e8462e" }, stylesheet: join(dir, "styles.css") });
    const code = call<string>(plugin.load, call<string>(plugin.resolveId, "virtual:cynosure/inline"));
    expect(code.startsWith("export default ")).toBe(true);
    const css = JSON.parse(code.slice("export default ".length).replace(/;$/, ""));
    expect(css).toContain(".cy-button{color:red}");
    expect(css).toContain("--cy-color-accent:#e8462e");
  });

  it("ignores ids it does not own", () => {
    const plugin = cynosure();
    expect(call(plugin.resolveId, "react")).toBeUndefined();
    expect(call(plugin.load, "/src/main.tsx")).toBeUndefined();
  });

  it("fails the build on an invalid theme", () => {
    expect(() => cynosure({ theme: { accent: "nope" } })).toThrow(CynosureThemeError);
  });
});
