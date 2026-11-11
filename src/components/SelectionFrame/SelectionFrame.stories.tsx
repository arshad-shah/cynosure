import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import type { FrameBox } from "./frame-math.js";
import { SelectionFrame, type SelectionFrameProps } from "./SelectionFrame.js";

/** A page with one object on it and the frame around it, as an editor wires it. */
function Editor(props: Partial<SelectionFrameProps> & { onCommitSpy?: (b: FrameBox, r: number) => void }) {
  const [box, setBox] = useState<FrameBox>({ x: 40, y: 60, width: 120, height: 60 });
  const [rotate, setRotate] = useState(0);
  const scale = props.scale ?? 1;
  return (
    <div
      className="page"
      style={{ position: "relative", inlineSize: 500, blockSize: 320, background: "var(--cy-color-surface)" }}
    >
      <div
        style={{
          position: "absolute",
          left: box.x * scale,
          top: box.y * scale,
          width: box.width * scale,
          height: box.height * scale,
          rotate: `${rotate}deg`,
          background: "var(--cy-color-accent-soft)",
        }}
      />
      <SelectionFrame
        label="Text box: Hello"
        {...props}
        box={box}
        rotate={rotate}
        onChange={(b, r) => {
          setBox(b);
          setRotate(r);
        }}
        onCommit={(b, r) => {
          setBox(b);
          setRotate(r);
          props.onCommitSpy?.(b, r);
        }}
      />
      <output data-testid="state" hidden>
        {JSON.stringify({ ...box, rotate: Math.round(rotate) })}
      </output>
    </div>
  );
}

const meta = {
  title: "Components/SelectionFrame",
  component: SelectionFrame,
  args: { label: "Text box: Hello", box: { x: 0, y: 0, width: 1, height: 1 }, onCommit: fn() },
  render: () => <Editor resizable rotatable />,
} satisfies Meta<typeof SelectionFrame>;
export default meta;
type Story = StoryObj<typeof meta>;

const frame = (el: Element) => el.querySelector(".cy-selection-frame") as HTMLElement;
const state = (el: Element) =>
  JSON.parse((el.querySelector('[data-testid="state"]') as HTMLElement).textContent as string) as FrameBox & {
    rotate: number;
  };

/** Drags `target` by (dx, dy) CSS pixels with detent's pointer path. */
async function drag(target: Element, dx: number, dy: number, pointerType = "mouse", hold = 0, end = true) {
  const r = target.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 7,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: 1,
  };
  target.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x, clientY: y }));
  if (hold) await new Promise((res) => setTimeout(res, hold));
  for (let i = 1; i <= 4; i++)
    target.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: x + (dx * i) / 4, clientY: y + (dy * i) / 4 }),
    );
  await new Promise((res) => requestAnimationFrame(() => res(null)));
  if (end)
    target.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x + dx, clientY: y + dy }),
    );
}

export const ASelectedObject: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const group = canvas.getByRole("group", { name: "Text box: Hello" });
    await expect(group).toHaveAttribute("aria-roledescription", "selection");
    await expect(group).toHaveAttribute("tabindex", "0");
    // It sits exactly over the object.
    await expect(group.getBoundingClientRect().width).toBeCloseTo(120, 0);
  },
};

export const KeysMoveResizeAndRotate: Story = {
  render: () => {
    const spy = fn();
    (window as unknown as { commits: typeof spy }).commits = spy;
    return <Editor resizable rotatable onCommitSpy={spy} />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const commits = (window as unknown as { commits: ReturnType<typeof fn> }).commits;
    canvas.getByRole("group").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(state(canvasElement)).toMatchObject({ x: 41, y: 60 });
    // Each key press is one undo step.
    await expect(commits).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(state(canvasElement)).toMatchObject({ x: 41, y: 70 });
    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
    await expect(state(canvasElement)).toMatchObject({ x: 41, width: 121 });
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await expect(state(canvasElement)).toMatchObject({ height: 59 });
    await userEvent.keyboard("]");
    await expect(state(canvasElement).rotate).toBe(15);
    // ("[[" is user-event's escape for one "[")
    await userEvent.keyboard("[[[[");
    await expect(state(canvasElement).rotate).toBe(-15);
    await expect(commits).toHaveBeenCalledTimes(7);
  },
};

export const EscapeCancelsAHeldKey: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    canvas.getByRole("group").focus();
    // Hold Right (repeats), then Escape before letting go: back to the start.
    await userEvent.keyboard("{ArrowRight>3}");
    await expect(state(canvasElement).x).toBe(43);
    await userEvent.keyboard("{Escape}{/ArrowRight}");
    await expect(state(canvasElement).x).toBe(40);
  },
};

export const OnlyWhatIsAllowed: Story = {
  render: () => <Editor />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Not resizable or rotatable: no handles, and Alt+arrows and [ ] do nothing.
    await expect(canvasElement.querySelectorAll("[data-handle]")).toHaveLength(0);
    canvas.getByRole("group").focus();
    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}]");
    await expect(state(canvasElement)).toMatchObject({ x: 40, width: 120, rotate: 0 });
  },
};

export const DragToMove: Story = {
  render: () => <Editor resizable scale={2} />,
  play: async ({ canvasElement }) => {
    await drag(frame(canvasElement), 40, 20);
    // At 2× zoom, 40 by 20 screen pixels is 20 by 10 units.
    await waitFor(() => expect(state(canvasElement)).toMatchObject({ x: 60, y: 70 }));
    await expect(frame(canvasElement)).toHaveFocus();
  },
};

export const DragHandlesToResizeAndRotate: Story = {
  play: async ({ canvasElement }) => {
    const handle = (name: string) => canvasElement.querySelector(`[data-handle="${name}"]`) as HTMLElement;
    await drag(handle("se"), 30, 20);
    await waitFor(() => expect(state(canvasElement)).toMatchObject({ x: 40, y: 60, width: 150, height: 80 }));
    // The west handle moves the left edge; the right edge stays.
    await drag(handle("w"), 20, 0);
    await waitFor(() => expect(state(canvasElement)).toMatchObject({ x: 60, width: 130 }));
    // The rotate handle, dragged round to the right of the centre, turns it a quarter.
    const box = frame(canvasElement).getBoundingClientRect();
    const r = handle("rotate").getBoundingClientRect();
    await drag(
      handle("rotate"),
      box.right + 40 - (r.left + r.width / 2),
      box.top + box.height / 2 - (r.top + r.height / 2),
    );
    await waitFor(() => expect(state(canvasElement).rotate).toBe(90));
  },
};

export const StaysInBoundsAndEscapeCancelsADrag: Story = {
  render: () => <Editor resizable bounds={{ width: 500, height: 320 }} />,
  play: async ({ canvasElement }) => {
    await drag(frame(canvasElement), -200, -200);
    await waitFor(() => expect(state(canvasElement)).toMatchObject({ x: 0, y: 0 }));
    // Escape mid-drag puts it back where the drag began.
    await drag(frame(canvasElement), 100, 100, "mouse", 0, false);
    await waitFor(() => expect(state(canvasElement).x).toBeGreaterThan(0));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(state(canvasElement)).toMatchObject({ x: 0, y: 0 }));
  },
};

/** A region select, as a screenshot tool wires it: no box until one is drawn. */
function Region(props: { start?: FrameBox; minSize?: number }) {
  const [box, setBox] = useState<FrameBox | null>(props.start ?? null);
  const [preview, setPreview] = useState<FrameBox | null>(null);
  return (
    <div className="page" style={{ position: "relative", inlineSize: 400, blockSize: 300 }}>
      <SelectionFrame
        label="Region"
        draw
        resizable
        box={box}
        bounds={{ width: 400, height: 300 }}
        {...(props.minSize ? { minSize: props.minSize } : {})}
        onChange={setPreview}
        onCommit={(b) => {
          setBox(b);
          setPreview(null);
        }}
      />
      <output data-testid="state" hidden>
        {JSON.stringify(box)}
      </output>
      <output data-testid="preview" hidden>
        {JSON.stringify(preview)}
      </output>
    </div>
  );
}
const regionOf = (el: Element) =>
  JSON.parse(
    (el.querySelector('[data-testid="state"]') as HTMLElement).textContent as string,
  ) as FrameBox | null;
const surfaceOf = (el: Element) => el.querySelector(".cy-selection-frame-surface") as HTMLElement;
/** Drags from one point of `target` to another (offsets from its top left), through detent's pointer path. */
async function stroke(target: Element, from: [number, number], to: [number, number], end = true) {
  const r = target.getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: 9,
    pointerType: "mouse",
    isPrimary: true,
    button: 0,
    buttons: 1,
  };
  const at = (f: number) => ({
    clientX: r.left + from[0] + (to[0] - from[0]) * f,
    clientY: r.top + from[1] + (to[1] - from[1]) * f,
  });
  target.dispatchEvent(new PointerEvent("pointerdown", { ...init, ...at(0) }));
  for (const f of [0.25, 0.5, 0.75, 1])
    target.dispatchEvent(new PointerEvent("pointermove", { ...init, ...at(f) }));
  await new Promise((res) => requestAnimationFrame(() => res(null)));
  if (end) target.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0, ...at(1) }));
}

export const DrawANewBox: Story = {
  render: () => <Region />,
  play: async ({ canvas, canvasElement }) => {
    // Before anything is drawn, the area itself is the control.
    const area = canvas.getByRole("group", { name: "Region" });
    await expect(area).toHaveAttribute("aria-roledescription", "drawing area");
    await expect(area).toHaveAttribute("tabindex", "0");
    await expect(frame(canvasElement)).toBeNull();
    await stroke(surfaceOf(canvasElement), [200, 180], [100, 100]);
    // Drawn from either corner, the box is the same; the frame now takes over.
    await waitFor(() => expect(regionOf(canvasElement)).toEqual({ x: 100, y: 100, width: 100, height: 80 }));
    await expect(canvas.getByRole("group", { name: "Region" })).toHaveAttribute(
      "aria-roledescription",
      "selection",
    );
    await expect(surfaceOf(canvasElement)).toHaveAttribute("aria-hidden", "true");
    await expect(surfaceOf(canvasElement)).not.toHaveAttribute("tabindex");
    // A press on the frame moves it rather than drawing.
    await stroke(frame(canvasElement), [50, 40], [80, 60]);
    await waitFor(() => expect(regionOf(canvasElement)).toEqual({ x: 130, y: 120, width: 100, height: 80 }));
    // A drag elsewhere draws a new one, kept inside the bounds.
    await stroke(surfaceOf(canvasElement), [20, 20], [-50, 350]);
    await waitFor(() => expect(regionOf(canvasElement)).toEqual({ x: 0, y: 20, width: 20, height: 280 }));
  },
};

export const EscapeOrASlipDrawsNothing: Story = {
  render: () => <Region start={{ x: 10, y: 10, width: 50, height: 50 }} minSize={8} />,
  play: async ({ canvasElement }) => {
    const preview = () => (canvasElement.querySelector('[data-testid="preview"]') as HTMLElement).textContent;
    await stroke(surfaceOf(canvasElement), [200, 200], [300, 280], false);
    await waitFor(() => expect(preview()).toBe(JSON.stringify({ x: 200, y: 200, width: 100, height: 80 })));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    // Escape puts the old box back.
    await waitFor(() => expect(preview()).toBe(JSON.stringify({ x: 10, y: 10, width: 50, height: 50 })));
    await expect(regionOf(canvasElement)).toEqual({ x: 10, y: 10, width: 50, height: 50 });
    // A drag smaller than minSize is a slip, not a box.
    await stroke(surfaceOf(canvasElement), [200, 200], [205, 260]);
    await new Promise((res) => setTimeout(res, 50));
    await expect(regionOf(canvasElement)).toEqual({ x: 10, y: 10, width: 50, height: 50 });
  },
};

export const EnterPlacesABox: Story = {
  render: () => <Region />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("group", { name: "Region" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    // A box half the area's size, in its middle, focused so the arrows adjust it.
    await waitFor(() => expect(regionOf(canvasElement)).toEqual({ x: 100, y: 75, width: 200, height: 150 }));
    await waitFor(() => expect(frame(canvasElement)).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(regionOf(canvasElement)?.x).toBe(101));
  },
};

export const TouchHandlesAndDrag: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement }) => {
    const handle = canvasElement.querySelector('[data-handle="se"]') as HTMLElement;
    await expect(Number.parseFloat(getComputedStyle(handle, "::after").width)).toBeGreaterThanOrEqual(44);
    // A finger held briefly, then dragged, moves the object (a quick swipe would scroll the page instead).
    await drag(frame(canvasElement), 30, 0, "touch", 260);
    await waitFor(() => expect(state(canvasElement).x).toBe(70));
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["position", "width", "height", "outline-width", "box-sizing", "background-color"];
    for (const selector of [".cy-selection-frame", ".cy-selection-frame-handle"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
