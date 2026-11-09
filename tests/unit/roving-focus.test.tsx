// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { type RovingOptions, useRovingFocus } from "../../src/foundations/roving-focus";

function Group({
  options,
  dir,
  disabled = [],
}: {
  options?: RovingOptions;
  dir?: "rtl";
  disabled?: number[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, options);
  return (
    <div ref={ref} dir={dir} data-testid="group">
      {["One", "Two", "Three", "Four"].map((label, i) => (
        <span
          key={label}
          data-roving=""
          aria-disabled={disabled.includes(i) || undefined}
          data-testid={label}
          role="menuitem"
          tabIndex={-1}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

const key = (k: string) => act(() => void fireEvent.keyDown(document.activeElement as Element, { key: k }));
const focused = () => (document.activeElement as HTMLElement).dataset.testid;

afterEach(cleanup);

describe("useRovingFocus", () => {
  it("exposes exactly one tab stop", () => {
    const { getByTestId } = render(<Group />);
    const stops = ["One", "Two", "Three", "Four"].map((id) => getByTestId(id).tabIndex);
    expect(stops).toEqual([0, -1, -1, -1]);
  });
  it("moves with arrows, skips disabled items, loops, and supports Home and End", () => {
    const { getByTestId } = render(<Group disabled={[1]} />);
    act(() => getByTestId("One").focus());
    key("ArrowRight");
    expect(focused()).toBe("Three");
    key("End");
    expect(focused()).toBe("Four");
    key("ArrowRight");
    expect(focused()).toBe("One");
    key("Home");
    expect(focused()).toBe("One");
    expect(getByTestId("One").tabIndex).toBe(0);
    key("ArrowLeft");
    expect(focused()).toBe("Four");
    expect(getByTestId("Four").tabIndex).toBe(0);
  });
  it("stops at the ends when loop is off", () => {
    const { getByTestId } = render(<Group options={{ loop: false }} />);
    act(() => getByTestId("Four").focus());
    key("ArrowRight");
    expect(focused()).toBe("Four");
  });
  it("flips horizontal arrows in RTL and ignores the other axis", () => {
    const { getByTestId } = render(<Group dir="rtl" />);
    act(() => getByTestId("One").focus());
    key("ArrowLeft");
    expect(focused()).toBe("Two");
    key("ArrowDown");
    expect(focused()).toBe("Two");
  });
  it("uses Up and Down for vertical groups", () => {
    const { getByTestId } = render(<Group options={{ orientation: "vertical" }} />);
    act(() => getByTestId("One").focus());
    key("ArrowDown");
    expect(focused()).toBe("Two");
    key("ArrowRight");
    expect(focused()).toBe("Two");
  });
});
