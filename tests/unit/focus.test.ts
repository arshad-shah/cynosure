import { describe, expect, it } from "vitest";
import { deepActiveElement } from "../../src/foundations/focus";

/** An element whose shadow root's focused element is `inner` (or none). */
const host = (inner: unknown = null) => ({ shadowRoot: { activeElement: inner } });

describe("deepActiveElement", () => {
  it("is null on the server, where there is no document", () => {
    expect(deepActiveElement()).toBeNull();
    expect(deepActiveElement(null)).toBeNull();
  });

  it("is null when nothing has focus", () => {
    expect(deepActiveElement({ activeElement: null } as unknown as Document)).toBeNull();
  });

  it("is the document's focused element when it is not a shadow host", () => {
    const button = { shadowRoot: null };
    expect(deepActiveElement({ activeElement: button } as unknown as Document)).toBe(button);
  });

  it("follows focus through nested shadow roots to the control itself", () => {
    const input = { shadowRoot: null };
    const outer = host(host(input));
    expect(deepActiveElement({ activeElement: outer } as unknown as Document)).toBe(input);
  });

  it("stops at a shadow host whose root has nothing focused", () => {
    const empty = host(null);
    expect(deepActiveElement({ activeElement: empty } as unknown as Document)).toBe(empty);
  });
});
