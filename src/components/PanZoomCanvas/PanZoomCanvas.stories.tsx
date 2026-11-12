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

/** Paints through the screen's helpers: its canvas sized in device pixels, drawn in canvas units. */
function Crisp(screen: CanvasScreen) {
  const el = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = el.current?.getContext("2d");
    if (!ctx) return;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(...screen.transform);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(100, 100, 20, 20);
  });
  return <canvas ref={el} {...screen.canvasProps} data-testid="painted" data-dpr={screen.dpr} />;
}
/** Pretends the screen has `ratio` device pixels per CSS pixel. */
const setRatio = (ratio: number) =>
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: ratio });

export const CrispOnHighDensityScreens: Story = {
  beforeEach: () => {
    // The window's own property (or the prototype's, in some engines) is put back afterwards.
    const own = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
    setRatio(2);
    return () => {
      if (own) Object.defineProperty(window, "devicePixelRatio", own);
      else Reflect.deleteProperty(window, "devicePixelRatio");
    };
  },
  render: () => {
    const [view, setView] = useState<CanvasView>({ x: 10, y: 20, scale: 1.5 });
    const [tall, setTall] = useState(false);
    return (
      <div style={{ inlineSize: 400 }}>
        <Button size="sm" onClick={() => setTall(true)}>
          Taller
        </Button>
        <div style={{ blockSize: tall ? 320 : 300 }}>
          <PanZoomCanvas
            label="Scene"
            view={view}
            onViewChange={setView}
            renderScreen={(screen) => <Crisp {...screen} />}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Scene" });
    const painted = (await canvas.findByTestId("painted")) as HTMLCanvasElement;
    // On a screen of two device pixels per CSS pixel, the canvas holds twice the pixels and shows at the CSS size.
    await expect(painted).toHaveAttribute("data-dpr", "2");
    await expect(painted.width).toBe(region.clientWidth * 2);
    await expect(painted.height).toBe(region.clientHeight * 2);
    await expect(painted.getBoundingClientRect().width).toBe(region.clientWidth);
    await expect(painted.getBoundingClientRect().height).toBe(region.clientHeight);
    // `transform` draws in canvas units: the square at (100, 100) is at screen (160, 170), device (320, 340).
    await waitFor(() => expect(red(painted, 2 * 165, 2 * 175)).toBe(true));
    await expect(red(painted, 2 * 155, 2 * 175)).toBe(false);
    // Moving to a denser screen (or the browser zooming) is picked up on the next measure.
    setRatio(3);
    await userEvent.click(canvas.getByRole("button", { name: "Taller" }));
    await waitFor(() => expect(painted.height).toBe(320 * 3));
    await expect(painted).toHaveAttribute("data-dpr", "3");
    await expect(painted.width).toBe(region.clientWidth * 3);
    await waitFor(() => expect(red(painted, 3 * 165, 3 * 175)).toBe(true));
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

type Spot = { x: number; y: number };
const textOf = (el: HTMLElement, id: string) =>
  el.querySelector(`[data-testid="${id}"]`)?.textContent as string;

/** Cards the person moves: a press on a card is claimed, so dragging it moves the card, not the view. */
function Movable({ start = { x: 0, y: 0, scale: 1 } }: { start?: CanvasView }) {
  const [at, setAt] = useState<Record<string, Spot>>({ A: { x: 0, y: 0 }, B: { x: 540, y: 120 } });
  const [view, setView] = useState<CanvasView>(start);
  const [log, setLog] = useState("");
  return (
    <div style={{ inlineSize: 600 }}>
      <div style={{ blockSize: 400 }}>
        <PanZoomCanvas
          label="Schema"
          view={view}
          onViewChange={setView}
          claimPress={(press) => {
            const id = press.target.closest("[data-node]")?.getAttribute("data-node");
            if (!id) return false;
            const { x, y } = press.point;
            setLog(`pressed ${id} at ${Math.round(x)},${Math.round(y)} by ${press.pointerType}`);
            const from = at[id] as Spot;
            const put = (by: Spot) =>
              setAt((all) => ({ ...all, [id]: { x: from.x + by.x, y: from.y + by.y } }));
            return {
              onMove: ({ delta }) => put(delta),
              onEnd: ({ delta }, cancelled) => {
                if (cancelled) put({ x: 0, y: 0 });
                else if (delta.x === 0 && delta.y === 0) setLog(`selected ${id}`);
              },
            };
          }}
        >
          {Object.entries(at).map(([id, p]) => (
            <div
              key={id}
              data-node={id}
              data-testid={`node-${id}`}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: 120,
                height: 60,
                background: "var(--cy-color-surface)",
                border: "var(--cy-border-width) solid var(--cy-color-line)",
              }}
            >
              Table {id}
            </div>
          ))}
        </PanZoomCanvas>
      </div>
      <output data-testid="view">{JSON.stringify(view)}</output>
      <output data-testid="at">{JSON.stringify(at)}</output>
      <output data-testid="log">{log}</output>
    </div>
  );
}
const atOf = (el: HTMLElement) => JSON.parse(textOf(el, "at")) as Record<string, Spot>;

export const DragANodeNotTheView: Story = {
  render: () => <Movable />,
  play: async ({ canvas, canvasElement }) => {
    const el = surface(canvasElement);
    const node = (id: string) => canvas.getByTestId(`node-${id}`);
    // Dragging a claimed card moves the card; the view stays where it is.
    const a = box(node("A"));
    drag(node("A"), { x: a.left + 10, y: a.top + 20 }, { x: 80, y: 30 });
    await waitFor(() => expect(atOf(canvasElement).A).toEqual({ x: 80, y: 30 }));
    await expect(viewOf(canvasElement)).toEqual({ x: 0, y: 0, scale: 1 });
    await expect(textOf(canvasElement, "log")).toBe("pressed A at 10,20 by mouse");
    // The background still pans.
    const r = box(el);
    drag(el, { x: r.left + 400, y: r.top + 350 }, { x: -50, y: -20 });
    await waitFor(() => expect(viewOf(canvasElement)).toEqual({ x: -50, y: -20, scale: 1 }));
    // A press that does not move is a tap: here it selects.
    const b = box(node("B"));
    drag(node("B"), { x: b.left + 5, y: b.top + 5 }, { x: 0, y: 0 });
    await waitFor(() => expect(textOf(canvasElement, "log")).toBe("selected B"));
    // Escape cancels a drag: the card goes back.
    const a2 = box(node("A"));
    node("A").dispatchEvent(
      new PointerEvent("pointerdown", { ...mouse, clientX: a2.left + 5, clientY: a2.top + 5 }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", { ...mouse, clientX: a2.left + 45, clientY: a2.top + 5 }),
    );
    await waitFor(() => expect(atOf(canvasElement).A).toEqual({ x: 120, y: 30 }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(atOf(canvasElement).A).toEqual({ x: 80, y: 30 }));
    window.dispatchEvent(new PointerEvent("pointerup", { ...mouse, buttons: 0 }));
    // With Space held, a drag anywhere pans, even on a card.
    el.focus();
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    await waitFor(() => expect(el).toHaveAttribute("data-panning"));
    const a3 = box(node("A"));
    drag(node("A"), { x: a3.left + 5, y: a3.top + 5 }, { x: 30, y: 0 });
    await waitFor(() => expect(viewOf(canvasElement)).toEqual({ x: -20, y: -20, scale: 1 }));
    await expect(atOf(canvasElement).A).toEqual({ x: 80, y: 30 });
    el.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
  },
};

export const DragANodeAtAnyZoom: Story = {
  render: () => <Movable start={{ x: 20, y: 10, scale: 2 }} />,
  play: async ({ canvas, canvasElement }) => {
    // The press and the drag come in canvas units: 80 by 40 screen pixels at 200% is 40 by 20.
    const a = box(canvas.getByTestId("node-A"));
    drag(canvas.getByTestId("node-A"), { x: a.left + 30, y: a.top + 50 }, { x: 80, y: 40 });
    await waitFor(() => expect(atOf(canvasElement).A).toEqual({ x: 40, y: 20 }));
    await expect(textOf(canvasElement, "log")).toBe("pressed A at 15,25 by mouse");
    await expect(viewOf(canvasElement)).toEqual({ x: 20, y: 10, scale: 2 });
  },
};

/** Painted squares: red moves, blue is claimed but stays (locked), green is picked with a tap; the app hit-tests. */
function Squares(screen: CanvasScreen & { red: Spot }) {
  const el = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = el.current?.getContext("2d");
    if (!ctx) return;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(...screen.transform);
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(screen.red.x, screen.red.y, 20, 20);
    ctx.fillStyle = "rgb(0, 0, 255)";
    ctx.fillRect(200, 100, 20, 20);
    ctx.fillStyle = "rgb(0, 128, 0)";
    ctx.fillRect(150, 40, 20, 20);
  });
  return <canvas ref={el} {...screen.canvasProps} data-testid="painted" />;
}

export const DragAPaintedNode: Story = {
  render: () => {
    const [view, setView] = useState<CanvasView>({ x: 10, y: 20, scale: 2 });
    const [red, setRed] = useState<Spot>({ x: 100, y: 100 });
    const [picked, setPicked] = useState("");
    const inside = (p: Spot, s: Spot) => p.x >= s.x && p.x <= s.x + 20 && p.y >= s.y && p.y <= s.y + 20;
    return (
      <div style={{ blockSize: 300, inlineSize: 500 }}>
        <PanZoomCanvas
          label="Scene"
          view={view}
          onViewChange={setView}
          renderScreen={(screen) => <Squares {...screen} red={red} />}
          claimPress={({ point }) => {
            if (inside(point, red)) {
              const from = red;
              return { onMove: ({ delta }) => setRed({ x: from.x + delta.x, y: from.y + delta.y }) };
            }
            if (inside(point, { x: 150, y: 40 }))
              return { onEnd: ({ delta }) => setPicked(delta.x || delta.y ? "dragged green" : "green") };
            return inside(point, { x: 200, y: 100 });
          }}
        />
        <output data-testid="view">{JSON.stringify(view)}</output>
        <output data-testid="red">{JSON.stringify(red)}</output>
        <output data-testid="picked">{picked}</output>
      </div>
    );
  },
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole("region", { name: "Scene" });
    await canvas.findByTestId("painted");
    const r = box(region);
    // The red square is at canvas (100, 100): screen (210, 220) at 200%. Dragging it moves it, in canvas units.
    drag(region, { x: r.left + 215, y: r.top + 225 }, { x: 40, y: 20 });
    await waitFor(() => expect(JSON.parse(textOf(canvasElement, "red"))).toEqual({ x: 120, y: 110 }));
    await expect(viewOf(canvasElement)).toEqual({ x: 10, y: 20, scale: 2 });
    // The blue square is claimed and left where it is: pressing it does not pan.
    drag(region, { x: r.left + 420, y: r.top + 230 }, { x: -40, y: 0 });
    await expect(viewOf(canvasElement)).toEqual({ x: 10, y: 20, scale: 2 });
    // The green square only listens for the end: a drag off it does not pan, and a tap picks it.
    drag(region, { x: r.left + 315, y: r.top + 105 }, { x: 30, y: 30 });
    await waitFor(() => expect(textOf(canvasElement, "picked")).toBe("dragged green"));
    drag(region, { x: r.left + 315, y: r.top + 105 }, { x: 0, y: 0 });
    await waitFor(() => expect(textOf(canvasElement, "picked")).toBe("green"));
    await expect(viewOf(canvasElement)).toEqual({ x: 10, y: 20, scale: 2 });
    // Anywhere else pans.
    drag(region, { x: r.left + 60, y: r.top + 60 }, { x: -40, y: 0 });
    await waitFor(() => expect(viewOf(canvasElement)).toEqual({ x: -30, y: 20, scale: 2 }));
  },
};

export const FingersDragNodes: Story = {
  tags: ["touch", "!dev"],
  render: () => <Movable />,
  play: async ({ canvas, canvasElement }) => {
    const el = surface(canvasElement);
    const finger = { ...mouse, pointerType: "touch", pointerId: 31 };
    const a = box(canvas.getByTestId("node-A"));
    drag(canvas.getByTestId("node-A"), { x: a.left + 10, y: a.top + 10 }, { x: 60, y: 0 }, finger);
    await waitFor(() => expect(atOf(canvasElement).A).toEqual({ x: 60, y: 0 }));
    await expect(textOf(canvasElement, "log")).toBe("pressed A at 10,10 by touch");
    await expect(viewOf(canvasElement)).toEqual({ x: 0, y: 0, scale: 1 });
    // A pinch that starts with a finger on a card zooms; the card does not move meanwhile.
    const r = box(el);
    const touch = (type: string, id: number, x: number, y: number, target: EventTarget = window) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: id,
          pointerType: "touch",
          isPrimary: id === 41,
          clientX: r.left + x,
          clientY: r.top + y,
        }),
      );
    touch("pointerdown", 41, 80, 20, canvas.getByTestId("node-A"));
    touch("pointerdown", 42, 300, 20, el);
    touch("pointermove", 41, 20, 20);
    touch("pointermove", 42, 400, 20);
    await waitFor(() => expect(viewOf(canvasElement).scale).toBeGreaterThan(1.3));
    await expect(atOf(canvasElement).A).toEqual({ x: 60, y: 0 });
    touch("pointerup", 41, 20, 20);
    touch("pointerup", 42, 400, 20);
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
