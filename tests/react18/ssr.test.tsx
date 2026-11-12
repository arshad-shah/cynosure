// @vitest-environment node
import { version } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CynosureTheme } from "../../src/theme/CynosureTheme";

afterEach(() => vi.restoreAllMocks());

describe("server rendering on React 18", () => {
  it("runs against React 18 without a window", () => {
    expect(version.startsWith("18.")).toBe(true);
    expect(typeof window).toBe("undefined");
  });

  it("CynosureTheme renders on the server without the useLayoutEffect warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const html = renderToString(
      <CynosureTheme mode="dark" target="document">
        <p>Themed</p>
      </CynosureTheme>,
    );
    expect(html).toContain("Themed");
    expect(error).not.toHaveBeenCalled();
  });
});
