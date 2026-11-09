// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDismiss } from "../../src/overlay/dismiss";

afterEach(cleanup);

function Layer({
  name,
  onClose,
  open = true,
  children,
}: {
  name: string;
  onClose: (r: string) => void;
  open?: boolean;
  children?: React.ReactNode;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useDismiss({ open, onClose, inside: [trigger, panel], returnFocus: trigger });
  return (
    <div>
      <button type="button" ref={trigger}>
        {name} trigger
      </button>
      {open && (
        <div ref={panel} data-testid={`${name}-panel`}>
          <button type="button">{name} inner</button>
          {children}
        </div>
      )}
    </div>
  );
}

describe("useDismiss", () => {
  it("Escape closes only the topmost open layer", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Layer name="outer" onClose={outer}>
        <Layer name="inner" onClose={inner} />
      </Layer>,
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(inner).toHaveBeenCalledWith("escape");
    expect(outer).not.toHaveBeenCalled();
  });

  it("the next Escape reaches the layer underneath once the top one closes", () => {
    const outer = vi.fn();
    function Nested() {
      const [innerOpen, setInnerOpen] = useState(true);
      return (
        <Layer name="outer" onClose={outer}>
          <Layer name="inner" open={innerOpen} onClose={() => setInnerOpen(false)} />
        </Layer>
      );
    }
    render(<Nested />);
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(outer).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(outer).toHaveBeenCalledWith("escape");
  });

  it("ignores an Escape a component already handled", () => {
    const close = vi.fn();
    const { getByText } = render(<Layer name="one" onClose={close} />);
    const inner = getByText("one inner");
    inner.addEventListener("keydown", (e) => e.preventDefault());
    fireEvent.keyDown(inner, { key: "Escape" });
    expect(close).not.toHaveBeenCalled();
  });

  it("closes on a pointer down outside, not inside or on the trigger", () => {
    const close = vi.fn();
    const { getByText } = render(
      <>
        <Layer name="one" onClose={close} />
        <span>elsewhere</span>
      </>,
    );
    fireEvent.pointerDown(getByText("one inner"));
    fireEvent.pointerDown(getByText("one trigger"));
    expect(close).not.toHaveBeenCalled();
    fireEvent.pointerDown(getByText("elsewhere"));
    expect(close).toHaveBeenCalledWith("outside");
  });

  it("returns focus to the trigger when closing with focus inside", async () => {
    function Toggle() {
      const [open, setOpen] = useState(true);
      return <Layer name="one" open={open} onClose={() => setOpen(false)} />;
    }
    const { getByText } = render(<Toggle />);
    act(() => getByText("one inner").focus());
    fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
    await act(async () => {});
    expect(document.activeElement).toBe(getByText("one trigger"));
  });

  it("does not steal focus that moved elsewhere on purpose", async () => {
    function Toggle() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Layer name="one" open={open} onClose={() => setOpen(false)} />
          <button type="button">other</button>
        </>
      );
    }
    const { getByText } = render(<Toggle />);
    act(() => getByText("other").focus());
    fireEvent.pointerDown(getByText("other"));
    await act(async () => {});
    expect(document.activeElement).toBe(getByText("other"));
  });

  it("stops listening when closed", () => {
    const close = vi.fn();
    render(<Layer name="one" open={false} onClose={close} />);
    fireEvent.keyDown(document.body, { key: "Escape" });
    fireEvent.pointerDown(document.body);
    expect(close).not.toHaveBeenCalled();
  });
});
