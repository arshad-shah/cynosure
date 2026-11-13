import { describe, expect, it } from "vitest";
import { iconSizeFor } from "../../src/foundations/icon-size";

describe("iconSizeFor", () => {
  it("gives dense controls small icons and large controls large ones", () => {
    expect(iconSizeFor("xs")).toBe("sm");
    expect(iconSizeFor("sm")).toBe("md");
    expect(iconSizeFor("md")).toBe("md");
    expect(iconSizeFor("lg")).toBe("lg");
    expect(iconSizeFor(undefined)).toBe("md");
  });
});
