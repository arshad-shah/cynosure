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

function Native({ extra = false }: { extra?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, { selector: "button, input" });
  return (
    <div ref={ref}>
      <button type="button">A</button>
      <button type="button" disabled>
        B
      </button>
      <input aria-label="Text" />
      {extra && <button type="button">C</button>}
    </div>
  );
}

describe("useRovingFocus with native controls", () => {
  it("skips natively disabled controls", () => {
    const { getByRole } = render(<Native />);
    act(() => getByRole("button", { name: "A" }).focus());
    key("ArrowRight");
    expect(document.activeElement).toBe(getByRole("textbox"));
  });
  it("leaves arrow, Home and End keys to text inputs", () => {
    const { getByRole } = render(<Native />);
    act(() => getByRole("textbox").focus());
    key("ArrowRight");
    key("Home");
    expect(document.activeElement).toBe(getByRole("textbox"));
  });
  it("gives items added later a tabIndex of -1", async () => {
    const { getByRole, rerender } = render(<Native />);
    rerender(<Native extra />);
    await act(async () => {});
    expect(getByRole("button", { name: "C" }).tabIndex).toBe(-1);
    expect(getByRole("button", { name: "A" }).tabIndex).toBe(0);
  });
});

function Selected({ selected }: { selected: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, { selector: '[role="tab"]' });
  return (
    <div ref={ref}>
      {["A", "B", "C"].map((label, i) => (
        <span key={label} role="tab" tabIndex={-1} aria-selected={i === selected}>
          {label}
        </span>
      ))}
    </div>
  );
}

describe("useRovingFocus follows the selection", () => {
  it("moves the tab stop to a newly selected item while focus is outside the group", async () => {
    const { getByText, rerender } = render(<Selected selected={0} />);
    expect(getByText("A").tabIndex).toBe(0);
    rerender(<Selected selected={2} />);
    await act(async () => {});
    expect(getByText("C").tabIndex).toBe(0);
    expect(getByText("A").tabIndex).toBe(-1);
  });
});

function Current({ current, follow }: { current: number; follow: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useRovingFocus(ref, { selector: "button", orientation: "vertical", current: follow });
  return (
    <div ref={ref}>
      {["A", "B", "C"].map((label, i) => (
        // The first has no aria-current at all; the others say "false" when they are not the current one.
        <button
          key={label}
          type="button"
          aria-current={i === current ? "true" : i === 0 ? undefined : "false"}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

describe("useRovingFocus with current", () => {
  it("starts on, and follows, the item marked aria-current when asked to", async () => {
    const { getByText, rerender } = render(<Current current={1} follow />);
    expect(getByText("B").tabIndex).toBe(0);
    rerender(<Current current={2} follow />);
    await act(async () => {});
    expect(getByText("C").tabIndex).toBe(0);
    expect(getByText("B").tabIndex).toBe(-1);
  });
  it("ignores aria-current otherwise", () => {
    const { getByText } = render(<Current current={1} follow={false} />);
    expect(getByText("A").tabIndex).toBe(0);
  });
});
