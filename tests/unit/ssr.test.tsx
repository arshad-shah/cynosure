import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeToggle } from "../../src/components/ThemeToggle/ThemeToggle";

describe("server rendering (Important 6)", () => {
  it("renders the system mode on the server without reading storage, so hydration matches", () => {
    let reads = 0;
    const storage = { get: () => (reads++, "dark"), set: () => {} };
    const html = renderToString(<ThemeToggle storage={storage} />);
    expect(reads).toBe(0);
    expect(html).toMatch(/value="system"[^>]*checked|checked[^>]*value="system"/);
  });
});
