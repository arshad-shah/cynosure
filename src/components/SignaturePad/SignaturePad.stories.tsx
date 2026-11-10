import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Button } from "../Button/Button.js";
import { Inline } from "../Inline/Inline.js";
import { Stack } from "../Stack/Stack.js";
import type { InkStroke } from "./ink.js";
import { SignaturePad, type SignaturePadProps } from "./SignaturePad.js";

/** A pad with its strokes in state, plus Undo and Clear, as products wire it. */
function Signing(props: Partial<SignaturePadProps> & { onChangeSpy?: (s: InkStroke[]) => void }) {
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  return (
    <Stack gap="4">
      <SignaturePad
        label="Draw your signature"
        {...props}
        value={strokes}
        onChange={(next) => {
          setStrokes(next);
          props.onChangeSpy?.(next);
        }}
      />
      <Inline gap="2">
        <Button onClick={() => setStrokes((s) => s.slice(0, -1))}>Undo</Button>
        <Button onClick={() => setStrokes([])}>Clear</Button>
        <output data-testid="count">{strokes.length}</output>
        <output data-testid="points" hidden>
          {strokes[0]?.length ?? 0}
        </output>
        <output data-testid="first" hidden>
          {strokes[0] ? JSON.stringify(strokes[0][0]) : ""}
        </output>
      </Inline>
    </Stack>
  );
}

const meta = {
  title: "Components/SignaturePad",
  component: SignaturePad,
  args: { label: "Draw your signature", value: [], onChange: fn() },
  render: () => <Signing />,
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof SignaturePad>;
export default meta;
type Story = StoryObj<typeof meta>;

const pad = (el: Element) => el.querySelector("canvas") as HTMLCanvasElement;

/** Draws a zig-zag with `pointerType`, from (x, y) offsets in the pad (0..1). */
function draw(
  canvas: HTMLCanvasElement,
  points: [number, number][],
  pointerType = "mouse",
  options: { id?: number; button?: number; pressure?: number } = {},
) {
  const box = canvas.getBoundingClientRect();
  const at = ([x, y]: [number, number]) => ({
    clientX: box.left + x * box.width,
    clientY: box.top + y * box.height,
  });
  const init = {
    bubbles: true,
    cancelable: true,
    pointerId: options.id ?? 1,
    pointerType,
    isPrimary: true,
    button: options.button ?? 0,
    buttons: 1,
    pressure: options.pressure ?? (pointerType === "pen" ? 0.6 : 0.5),
  };
  const [first, ...rest] = points;
  canvas.dispatchEvent(new PointerEvent("pointerdown", { ...init, ...at(first as [number, number]) }));
  for (const p of rest) canvas.dispatchEvent(new PointerEvent("pointermove", { ...init, ...at(p) }));
  return () => canvas.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
}

/** How many pixels of the canvas have ink on them. */
function inked(canvas: HTMLCanvasElement) {
  const data = (canvas.getContext("2d") as CanvasRenderingContext2D).getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  ).data;
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if ((data[i] as number) > 0) n++;
  return n;
}

const ZIGZAG: [number, number][] = [
  [0.1, 0.6],
  [0.2, 0.3],
  [0.3, 0.6],
  [0.4, 0.3],
  [0.5, 0.6],
  [0.6, 0.3],
];

export const DrawingAStroke: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const c = pad(canvasElement);
    await expect(canvas.getByRole("img", { name: "Draw your signature" })).toBe(c);
    await expect(inked(c)).toBe(0);
    draw(c, ZIGZAG)();
    // One finished stroke, drawn in ink.
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("1"));
    await waitFor(() => expect(inked(c)).toBeGreaterThan(200));
    draw(c, [
      [0.7, 0.4],
      [0.9, 0.5],
    ])();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("2"));
  },
};

export const UndoAndClearAreYours: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const c = pad(canvasElement);
    draw(c, ZIGZAG)();
    draw(c, [
      [0.7, 0.4],
      [0.9, 0.5],
    ])();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("2"));
    const both = inked(c);
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(inked(c)).toBeLessThan(both));
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await waitFor(() => expect(inked(c)).toBe(0));
  },
};

export const OnePointerAtATime: Story = {
  play: async ({ canvas, canvasElement }) => {
    const c = pad(canvasElement);
    const release = draw(c, ZIGZAG.slice(0, 3), "touch", { id: 1 });
    // A second finger, and a right-click, do not start or replace the stroke.
    draw(
      c,
      [
        [0.8, 0.2],
        [0.9, 0.8],
      ],
      "touch",
      { id: 2 },
    )();
    draw(
      c,
      [
        [0.8, 0.2],
        [0.9, 0.8],
      ],
      "mouse",
      { id: 3, button: 2 },
    )();
    await expect(canvas.getByTestId("count")).toHaveTextContent("0");
    release();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("1"));
  },
};

export const PalmRejection: Story = {
  play: async ({ canvas, canvasElement }) => {
    const c = pad(canvasElement);
    // A pen stroke; then a resting palm (touch) right after is ignored.
    draw(c, ZIGZAG, "pen", { id: 4 })();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("1"));
    draw(
      c,
      [
        [0.2, 0.2],
        [0.4, 0.4],
      ],
      "touch",
      { id: 5 },
    )();
    await expect(canvas.getByTestId("count")).toHaveTextContent("1");
    // The pen's pressure shaped the stroke (a mouse would record a steady 0.5).
    const first = JSON.parse(canvas.getByTestId("first").textContent as string);
    await expect(first.pressure).not.toBe(0.5);
  },
};

export const KeepsItsShapeAtAnySize: Story = {
  render: () => <Signing space={{ width: 600, height: 200 }} width={300} height={100} />,
  play: async ({ canvas, canvasElement }) => {
    const c = pad(canvasElement);
    draw(c, [
      [0.5, 0.5],
      [0.6, 0.5],
    ])();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("1"));
    // Shown at 300×100, recorded in a 600×200 space: the middle is (300, 100).
    const first = JSON.parse(canvas.getByTestId("first").textContent as string);
    await expect(Math.round(first.x)).toBe(300);
    await expect(Math.round(first.y)).toBe(100);
  },
};

export const IgnoresOtherButtonsAndTinyMoves: Story = {
  render: () => <Signing className="host-pad" />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector(".host-pad")).not.toBeNull();
    const c = pad(canvasElement);
    // A right-click on its own draws nothing.
    draw(
      c,
      [
        [0.2, 0.2],
        [0.6, 0.6],
      ],
      "mouse",
      { button: 2 },
    )();
    await expect(canvas.getByTestId("count")).toHaveTextContent("0");
    // Samples closer than a pixel to the last add nothing: a tap is one point.
    draw(c, [
      [0.5, 0.5],
      [0.5, 0.5],
      [0.5, 0.5],
    ])();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("1"));
    await expect(canvas.getByTestId("points")).toHaveTextContent("1");
  },
};

export const Disabled: Story = {
  render: () => <Signing disabled />,
  play: async ({ canvas, canvasElement }) => {
    const c = pad(canvasElement);
    await expect(c).toHaveAttribute("aria-disabled", "true");
    draw(c, ZIGZAG)();
    await expect(canvas.getByTestId("count")).toHaveTextContent("0");
  },
};

export const LongPressKeepsDrawing: Story = {
  play: async ({ canvasElement }) => {
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    // The context menu a long press would open (and which would cancel the stroke) is suppressed.
    await expect(pad(canvasElement).dispatchEvent(event)).toBe(false);
  },
};

export const TouchDraws: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement }) => {
    const c = pad(canvasElement);
    // The pad keeps the finger's gestures for drawing, not scrolling.
    await expect(getComputedStyle(c).touchAction).toBe("none");
    draw(c, ZIGZAG, "touch")();
    await waitFor(() => expect(canvas.getByTestId("count")).toHaveTextContent("1"));
  },
};

export const InkFollowsTheMode: Story = {
  render: () => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className={mode}>
            <Signing label={`${mode} pad`} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const ink = (mode: string) =>
      getComputedStyle(pad(canvasElement.querySelector(`.${mode}`) as Element)).color;
    // Without an `ink` colour the ink token is used: dark ink on light, light ink on dark.
    await expect(ink("light")).not.toBe(ink("dark"));
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "height",
      "width",
      "border-top-width",
      "background-color",
      "box-sizing",
      "touch-action",
    ];
    for (const selector of [".cy-signature-pad", ".cy-signature-pad-canvas"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
