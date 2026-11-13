// @vitest-environment node
import { version } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../src/components/Button/Button";
import { Combobox } from "../../src/components/Combobox/Combobox";
import { Popover } from "../../src/components/Popover/Popover";
import { TagInput } from "../../src/components/TagInput/TagInput";
import { Tooltip } from "../../src/components/Tooltip/Tooltip";
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

  it("Tooltip, Combobox, TagInput and Popover render on the server without the useLayoutEffect warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderToString(
      <>
        <Tooltip content="Saves the file">
          <Button>Save</Button>
        </Tooltip>
        <Combobox label="Fruit" options={[{ value: "apple", label: "Apple" }]} />
        <TagInput label="Topics" />
        <Popover label="Filters" trigger={(p) => <Button {...p}>Filters</Button>}>
          Body
        </Popover>
      </>,
    );
    const warnings = error.mock.calls
      .map((args) => String(args[0]))
      .filter((m) => m.includes("useLayoutEffect"));
    expect(warnings).toEqual([]);
  });
});
