import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import {
  type CanvasScreen,
  type CanvasView,
  PanZoomCanvas,
  type PanZoomCanvasHandle,
  type PanZoomCanvasProps,
} from "./PanZoomCanvas.js";

const NODES = [
  { id: "A", x: 0, y: 0 },
  { id: "B", x: 540, y: 120 },
  { id: "C", x: 1080, y: 740 },
];
const BOUNDS = { x: 0, y: 0, width: 1200, height: 800 };
const card = (n: (typeof NODES)[number]) => (
  <div
    key={n.id}
    data-testid={`node-${n.id}`}
    style={{
      position: "absolute",
      left: n.x,
      top: n.y,
      width: 120,
      height: 60,
      display: "grid",
      placeItems: "center",
      background: "var(--cy-color-surface)",
      border: "var(--cy-border-width) solid var(--cy-color-line)",
    }}
  >
    Table {n.id}
  </div>
);

/** A diagram as a product places it: cards in canvas units, a minimap, and buttons using the handle. */
function Board({
  start,
  minimap = true,
  ...rest
}: { start?: CanvasView; minimap?: boolean } & Partial<PanZoomCanvasProps>) {
  const canvas = useRef<PanZoomCanvasHandle>(null);
  const [view, setView] = useState<CanvasView | null>(null);
  return (
    <div style={{ display: "grid", gap: 8, inlineSize: 600 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" onClick={() => canvas.current?.fit()}>
          Fit
        </Button>
        <Button size="sm" onClick={() => canvas.current?.zoomTo(100)}>
          Actual size
        </Button>
        <Button size="sm" onClick={() => canvas.current?.zoomTo(1000)}>
          Largest
        </Button>
        <Button
          size="sm"
          onClick={() => canvas.current?.centreOn({ x: 1080, y: 740, width: 120, height: 60 })}
        >
          Show table C
        </Button>
      </div>
      <div style={{ blockSize: 400 }}>
        <PanZoomCanvas
          ref={canvas}
          label="Schema"
          bounds={BOUNDS}
          minimap={minimap}
          onViewChange={setView}
          {...(start ? { defaultView: start } : {})}
          {...rest}
          renderMinimap={() =>
            NODES.map((n) => (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  width: 120,
                  height: 60,
                  background: "var(--cy-color-muted)",
                }}
              />
            ))
          }
        >
          {NODES.map(card)}
        </PanZoomCanvas>
      </div>
      <output data-testid="view">{JSON.stringify(view)}</output>
    </div>
  );
}

const meta = {
  title: "Components/PanZoomCanvas",
  component: PanZoomCanvas,
  args: { label: "Schema" },
  render: () => <Board />,
} satisfies Meta<typeof PanZoomCanvas>;
export default meta;
type Story = StoryObj<typeof meta>;

const surface = (el: HTMLElement) => el.querySelector(".cy-pan-zoom-canvas") as HTMLElement;
const viewOf = (el: HTMLElement) =>
  JSON.parse(el.querySelector('[data-testid="view"]')?.textContent as string) as CanvasView;
const box = (el: Element) => el.getBoundingClientRect();
const mouse = {
  bubbles: true,
  cancelable: true,
  pointerId: 4,
  pointerType: "mouse",
  isPrimary: true,
  button: 0,
  buttons: 1,
};
function drag(
  target: Element,
  from: { x: number; y: number },
  by: { x: number; y: number },
  init: object = mouse,
) {
  target.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: from.x, clientY: from.y }));
  for (const f of [0.5, 1])
    window.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: from.x + by.x * f, clientY: from.y + by.y * f }),
    );
  window.dispatchEvent(
    new PointerEvent("pointerup", { ...init, buttons: 0, clientX: from.x + by.x, clientY: from.y + by.y }),
  );
}

/** An engine that paints the scene itself: one square at canvas (100, 100), 20 units wide. */
function Painted({ view, width, height }: CanvasScreen) {
  const el = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = el.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(100 * view.scale + view.x, 100 * view.scale + view.y, 20 * view.scale, 20 * view.scale);
  });
  return <canvas ref={el} width={width} height={height} data-testid="painted" />;
}
const red = (el: HTMLCanvasElement, x: number, y: number) =>
  (el.getContext("2d") as CanvasRenderingContext2D).getImageData(x, y, 1, 1).data[0] === 255;

export const PaintedIntoACanvas: Story = {
  render: () => {
    const [view, setView] = useState<CanvasView>({ x: 0, y: 0, scale: 1 });
    return (
      <div style={{ blockSize: 300, inlineSize: 400 }}>
        <PanZoomCanvas
          label="Scene"
          view={view}
          onViewChange={setView}
          renderScreen={(screen) => <Painted {...screen} />}
        />
        <output data-testid="view">{JSON.stringify(view)}</output>
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole("region", { name: "Scene" });
    const painted = (await canvas.findByTestId("painted")) as HTMLCanvasElement;
    // The layer is the canvas's size, in screen pixels.
    await expect(painted.width).toBe(region.clientWidth);
    await expect(painted.height).toBe(region.clientHeight);
    await waitFor(() => expect(red(painted, 110, 110)).toBe(true));
    // Pressing the painted scene pans, like the background: the layer does not take the pointer.
    const r = box(region);
    await expect(document.elementFromPoint(r.left + 110, r.top + 110)).toBe(region);
    drag(region, { x: r.left + 110, y: r.top + 110 }, { x: 50, y: 30 });
    await waitFor(() => expect(viewOf(canvasElement)).toEqual({ x: 50, y: 30, scale: 1 }));
    // Each view change is drawn: the square moved with the pan.
    await waitFor(() => expect(red(painted, 160, 140)).toBe(true));
    await expect(red(painted, 105, 105)).toBe(false);
    // Zooming redraws at the new scale (Ctrl+= zooms around the centre).
    region.focus();
    region.dispatchEvent(
      new KeyboardEvent("keydown", { key: "=", ctrlKey: true, bubbles: true, cancelable: true }),
    );
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeGreaterThan(1));
    const v = viewOf(canvasElement);
    await waitFor(() => expect(red(painted, 110 * v.scale + v.x, 110 * v.scale + v.y)).toBe(true));
  },
};

export const FitsItsContent: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole("region", { name: "Schema" });
    await expect(region).toHaveAttribute("tabindex", "0");
    // Without a starting view, the content is fitted: every card is inside.
    await waitFor(() => expect(viewOf(canvasElement)?.scale).toBeLessThan(1));
    const r = box(region);
    for (const id of ["A", "B", "C"]) {
      const n = box(canvas.getByTestId(`node-${id}`));
      await expect(n.left).toBeGreaterThanOrEqual(r.left);
      await expect(n.right).toBeLessThanOrEqual(r.right);
      await expect(n.bottom).toBeLessThanOrEqual(r.bottom);
    }
  },
};

export const DragTheBackgroundToPan: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} />,
  play: async ({ canvas, canvasElement }) => {
    const r = box(surface(canvasElement));
    drag(surface(canvasElement), { x: r.left + 300, y: r.top + 300 }, { x: -100, y: -50 });
    await waitFor(() => expect(viewOf(canvasElement)).toEqual({ x: -100, y: -50, scale: 1 }));
    // A press on a card is the card's: it does not pan.
    const a = box(canvas.getByTestId("node-A"));
    drag(canvas.getByTestId("node-A"), { x: a.left + 10, y: a.top + 10 }, { x: 80, y: 0 });
    await expect(viewOf(canvasElement)).toEqual({ x: -100, y: -50, scale: 1 });
  },
};

export const WheelPansAndCtrlWheelZooms: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} />,
  play: async ({ canvas, canvasElement }) => {
    const el = surface(canvasElement);
    const r = box(el);
    el.dispatchEvent(new WheelEvent("wheel", { deltaX: 30, deltaY: 100, bubbles: true, cancelable: true }));
    await waitFor(() => expect(viewOf(canvasElement)).toEqual({ x: -30, y: -100, scale: 1 }));
    // Zooming keeps the point under the pointer still.
    const at = { clientX: r.left + 200, clientY: r.top + 150 };
    const b = () => box(canvas.getByTestId("node-B"));
    const before = b();
    el.dispatchEvent(
      new WheelEvent("wheel", { ...at, deltaY: -200, ctrlKey: true, bubbles: true, cancelable: true }),
    );
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeGreaterThan(1.2));
    const k = viewOf(canvasElement).scale;
    const after = b();
    await expect(after.left - at.clientX).toBeCloseTo((before.left - at.clientX) * k, 0);
  },
};

export const SlowTrackpadPinchZooms: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} />,
  play: async ({ canvasElement }) => {
    const el = surface(canvasElement);
    const r = box(el);
    // A slow trackpad pinch: many Ctrl+wheel events of a tiny delta, each well under a whole percent.
    const pinch = (deltaY: number) =>
      el.dispatchEvent(
        new WheelEvent("wheel", {
          clientX: r.left + 200,
          clientY: r.top + 150,
          deltaY,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    for (let i = 0; i < 40; i++) {
      pinch(-2);
      await new Promise((done) => requestAnimationFrame(done));
    }
    // 40 steps of 0.3% add up to about 13%.
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeGreaterThanOrEqual(1.1));
    await expect(viewOf(canvasElement).scale).toBeLessThanOrEqual(1.15);
    for (let i = 0; i < 40; i++) {
      pinch(2);
      await new Promise((done) => requestAnimationFrame(done));
    }
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeCloseTo(1, 1));
  },
};

export const KeysPanZoomAndFit: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} />,
  play: async ({ canvasElement, userEvent }) => {
    surface(canvasElement).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(viewOf(canvasElement)).toEqual({ x: -40, y: 0, scale: 1 });
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(viewOf(canvasElement)).toEqual({ x: -40, y: -200, scale: 1 });
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}");
    await expect(viewOf(canvasElement)).toEqual({ x: 0, y: -160, scale: 1 });
    await userEvent.keyboard("{Control>}={/Control}");
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeCloseTo(1.1, 5));
    await expect(canvasElement.querySelector('[role="status"]')).toHaveTextContent("Zoom 110%");
    await userEvent.keyboard("{Shift>}!{/Shift}");
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeLessThan(1));
  },
};

/** Two fingers, each pressed at (x, 200) and moved to its own place, then lifted. */
function pinch(el: HTMLElement, [a, b]: [number, number], [toA, toB]: [number, number]) {
  const r = box(el);
  const touch = (type: string, id: number, x: number, target: EventTarget = window) =>
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        pointerId: 20 + id,
        pointerType: "touch",
        isPrimary: id === 1,
        clientX: r.left + x,
        clientY: r.top + 200,
      }),
    );
  return {
    down: () => {
      touch("pointerdown", 1, a, el);
      touch("pointerdown", 2, b, el);
    },
    move: () => {
      touch("pointermove", 1, toA);
      touch("pointermove", 2, toB);
    },
    up: () => {
      touch("pointerup", 1, toA);
      touch("pointerup", 2, toB);
    },
  };
}

export const ZoomLimits: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} minScale={0.2} maxScale={3} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const el = surface(canvasElement);
    const r = box(el);
    const wheel = (deltaY: number) =>
      el.dispatchEvent(
        new WheelEvent("wheel", {
          clientX: r.left + 200,
          clientY: r.top + 150,
          deltaY,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    // The wheel stops at the largest and smallest scale the product allows (300% and 20% here).
    wheel(-2000);
    await waitFor(() => expect(viewOf(canvasElement).scale).toBe(3));
    el.focus();
    await userEvent.keyboard("{Control>}={/Control}");
    await expect(viewOf(canvasElement).scale).toBe(3);
    wheel(4000);
    await waitFor(() => expect(viewOf(canvasElement).scale).toBe(0.2));
    await userEvent.keyboard("{Control>}-{/Control}");
    await expect(viewOf(canvasElement).scale).toBe(0.2);
    // The keys step from the limit through the usual steps.
    await userEvent.keyboard("{Control>}={/Control}");
    await waitFor(() => expect(viewOf(canvasElement).scale).toBe(0.25));
    await expect(canvasElement.querySelector('[role="status"]')).toHaveTextContent("Zoom 25%");
    await userEvent.keyboard("{Control>}0{/Control}");
    await waitFor(() => expect(viewOf(canvasElement).scale).toBe(1));
    // The app's zoomTo and a pinch keep to them too.
    await userEvent.click(canvas.getByRole("button", { name: "Largest" }));
    await expect(viewOf(canvasElement).scale).toBe(3);
    await userEvent.click(canvas.getByRole("button", { name: "Actual size" }));
    await expect(viewOf(canvasElement).scale).toBe(1);
    const fingers = pinch(el, [290, 310], [100, 500]);
    fingers.down();
    fingers.move();
    await waitFor(() => expect(viewOf(canvasElement).scale).toBe(3));
    fingers.up();
  },
};

export const FitKeepsToTheLimits: Story = {
  render: () => <Board minScale={0.6} maxScale={3} />,
  play: async ({ canvasElement }) => {
    // Fitting 1200 by 800 into this canvas needs under 50%; this canvas stops at 60%.
    await waitFor(() => expect(viewOf(canvasElement)?.scale).toBe(0.6));
  },
};

export const FitZoomAndCentreFromTheApp: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 0.5 }} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actual size" }));
    await expect(viewOf(canvasElement).scale).toBe(1);
    await userEvent.click(canvas.getByRole("button", { name: "Show table C" }));
    const r = box(surface(canvasElement));
    const c = box(canvas.getByTestId("node-C"));
    await expect(Math.abs(c.left + c.width / 2 - (r.left + r.width / 2))).toBeLessThan(2);
    await userEvent.click(canvas.getByRole("button", { name: "Fit" }));
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeLessThan(0.5));
  },
};

export const TheMinimapMovesTheView: Story = {
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} />,
  play: async ({ canvasElement }) => {
    const map = canvasElement.querySelector(".cy-pan-zoom-canvas-minimap") as HTMLElement;
    const view = canvasElement.querySelector(".cy-pan-zoom-canvas-minimap-view") as HTMLElement;
    await expect(box(view).left).toBeCloseTo(box(map).left + 1, 0);
    // Pressing the bottom right of the minimap looks there; dragging follows.
    const m = box(map);
    drag(map, { x: m.right - 4, y: m.bottom - 4 }, { x: -20, y: 0 });
    await waitFor(() => expect(viewOf(canvasElement).x).toBeLessThan(-400));
    await expect(viewOf(canvasElement).y).toBeLessThan(-300);
  },
};

export const WithoutAMinimap: Story = {
  render: () => <Board minimap={false} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-pan-zoom-canvas-minimap")).toBeNull();
  },
};

export const FingersPanAndPinch: Story = {
  tags: ["touch", "!dev"],
  render: () => <Board start={{ x: 0, y: 0, scale: 1 }} />,
  play: async ({ canvasElement }) => {
    const el = surface(canvasElement);
    await expect(getComputedStyle(el).touchAction).toBe("none");
    const r = box(el);
    drag(
      el,
      { x: r.left + 300, y: r.top + 300 },
      { x: -60, y: 0 },
      { ...mouse, pointerType: "touch", pointerId: 11 },
    );
    await waitFor(() => expect(viewOf(canvasElement).x).toBe(-60));
    const touch = (type: string, id: number, x: number) =>
      (type === "pointerdown" ? el : window).dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: id,
          pointerType: "touch",
          isPrimary: id === 1,
          clientX: r.left + x,
          clientY: r.top + 200,
        }),
      );
    touch("pointerdown", 1, 300);
    touch("pointerdown", 2, 340);
    touch("pointermove", 1, 260);
    touch("pointermove", 2, 380);
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeGreaterThan(2));
    touch("pointerup", 1, 260);
    touch("pointerup", 2, 380);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "overflow-x", "box-sizing", "position", "font-size", "touch-action"];
    for (const selector of [".cy-pan-zoom-canvas", ".cy-pan-zoom-canvas-minimap"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
