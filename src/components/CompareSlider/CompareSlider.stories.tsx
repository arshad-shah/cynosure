import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Image } from "../Image/Image.js";
import { ZoomControls } from "../ZoomControls/ZoomControls.js";
import { CompareSlider, type ZoomSetting } from "./CompareSlider.js";

const side = (name: string, background: string) => (
  <div
    data-testid={name}
    style={{
      blockSize: 220,
      background,
      display: "grid",
      placeItems: "center",
      color: "var(--cy-color-ink)",
    }}
  >
    {name}
  </div>
);

const meta = {
  title: "Components/Controls/CompareSlider",
  component: CompareSlider,
  args: {
    before: side("original", "var(--cy-color-soft)"),
    after: side("edited", "var(--cy-color-accent-soft)"),
    onChange: fn(),
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    defaultValue: { control: { type: "range", min: 0, max: 100 } },
    showTags: { control: "boolean" },
    zoomable: { control: "boolean" },
    beforeSrc: { control: "text" },
    beforeAlt: { control: "text" },
    afterSrc: { control: "text" },
    afterAlt: { control: "text" },
    zoom: { control: "object" },
    defaultZoom: { control: "object" },
    before: { control: false },
    after: { control: false },
  },
  decorators: [(Story) => <div style={{ inlineSize: 400 }}>{Story()}</div>],
} satisfies Meta<typeof CompareSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

const root = (el: Element) => el.querySelector(".cy-compare-slider") as HTMLElement;
/** What is shown at a fraction of the width, half-way down. */
const shownAt = (el: Element, fraction: number) => {
  const box = root(el).getBoundingClientRect();
  return document
    .elementFromPoint(box.left + box.width * fraction, box.top + box.height / 2)
    ?.closest("[data-testid]")
    ?.getAttribute("data-testid");
};

export const BeforeAndAfterSplitByADivider: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const divider = canvas.getByRole("slider", { name: "Comparison" });
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await expect(divider).toHaveAttribute("aria-valuetext", "50% before");
    // The original on the left of the divider, the edit on the right.
    await expect(shownAt(canvasElement, 0.25)).toBe("original");
    await expect(shownAt(canvasElement, 0.75)).toBe("edited");
  },
};

export const KeyboardMovesTheDivider: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    await userEvent.tab();
    await expect(divider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "51");
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    await expect(divider).toHaveAttribute("aria-valuenow", "41");
    await userEvent.keyboard("{PageUp}");
    await expect(args.onChange).toHaveBeenLastCalledWith(51);
    await userEvent.keyboard("{End}");
    await expect(shownAt(canvasElement, 0.9)).toBe("original");
    await userEvent.keyboard("{Home}{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await expect(shownAt(canvasElement, 0.1)).toBe("edited");
  },
};

export const NoChangeNoCallback: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    divider.focus();
    // At an end already, Home, End and the arrows past it tell nobody anything.
    await userEvent.keyboard("{Home}");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Home}{ArrowLeft}{PageDown}");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{End}{End}{ArrowRight}");
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(100);
    // A press moves the divider to the middle; a pointer move that stays on that spot is not a change.
    const box = root(canvasElement).getBoundingClientRect();
    const at = (type: string) =>
      root(canvasElement).dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          button: 0,
          pointerId: 9,
          isPrimary: true,
          clientX: box.left + box.width / 2,
          clientY: box.top + box.height / 2,
        }),
      );
    at("pointerdown");
    await waitFor(() => expect(args.onChange).toHaveBeenCalledTimes(3));
    at("pointermove");
    at("pointerup");
    await expect(args.onChange).toHaveBeenCalledTimes(3);
  },
};

export const ClickOrDragWithThePointer: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    const box = root(canvasElement).getBoundingClientRect();
    const y = box.top + box.height / 2;
    // A click jumps the divider there.
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: root(canvasElement),
      coords: { clientX: box.left + box.width * 0.8, clientY: y },
    });
    await expect(divider).toHaveAttribute("aria-valuenow", "80");
    // A drag follows the pointer.
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 2,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    const target = root(canvasElement);
    target.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: box.left + box.width * 0.8, clientY: y }),
    );
    target.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: box.left + box.width * 0.5, clientY: y }),
    );
    target.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: box.left + box.width * 0.3, clientY: y }),
    );
    target.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: box.left + box.width * 0.3, clientY: y }),
    );
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "30"));
    await expect(divider).toHaveFocus();
    // Escape mid-drag puts it back.
    target.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: box.left + box.width * 0.6, clientY: y }),
    );
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "60"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "30"));
  },
};

export const Controlled: Story = {
  render: (args) => {
    function Pair() {
      const [value, setValue] = useState(20);
      return (
        <>
          <CompareSlider {...args} value={value} onChange={setValue} />
          <Button onClick={() => setValue(70)}>Show more of the original</Button>
        </>
      );
    }
    return <Pair />;
  },
  play: async ({ canvas, userEvent }) => {
    const divider = canvas.getByRole("slider");
    await expect(divider).toHaveAttribute("aria-valuenow", "20");
    await userEvent.click(canvas.getByRole("button", { name: "Show more of the original" }));
    await expect(divider).toHaveAttribute("aria-valuenow", "70");
    // Keys go through onChange too.
    divider.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "69");
  },
};

export const LabelsAndTags: Story = {
  args: {
    labels: { divider: "Vergleich", position: (p) => `${p} % vorher`, before: "Vorher", after: "Nachher" },
    className: "product-compare",
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("slider", { name: "Vergleich" })).toHaveAttribute(
      "aria-valuetext",
      "50 % vorher",
    );
    await expect(root(canvasElement)).toHaveTextContent("Vorher");
    await expect(root(canvasElement)).toHaveTextContent("Nachher");
    await expect(root(canvasElement)).toHaveClass("product-compare");
  },
};

export const WithoutTags: Story = {
  args: { showTags: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-compare-slider-tag")).toBeNull();
  },
};

export const TouchDivider: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("slider");
    // The divider's hit area is at least 44px wide on touch screens.
    await expect(Number.parseFloat(getComputedStyle(divider, "::before").width)).toBeGreaterThanOrEqual(44);
    // A sideways finger drags at once and a vertical swipe scrolls the page; a tap jumps the divider.
    await expect(getComputedStyle(root(canvasElement)).touchAction).toBe("pan-y");
    const box = root(canvasElement).getBoundingClientRect();
    await userEvent.pointer({
      keys: "[TouchA]",
      target: root(canvasElement),
      coords: { clientX: box.left + box.width * 0.25, clientY: box.top + box.height / 2 },
    });
    await expect(divider).toHaveAttribute("aria-valuenow", "25");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "overflow", "font-size", "box-sizing", "width", "background-color"];
    for (const selector of [".cy-compare-slider", ".cy-compare-slider-divider", ".cy-compare-slider-tag"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

/** Pictures without a network: an SVG as a data URL, a new address each call. */
let serial = 0;
const picture = (width: number, height: number, fill: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><!-- ${++serial} --><rect width="100%" height="100%" fill="${fill}"/></svg>`,
  )}`;
const rect = (el: Element) => el.getBoundingClientRect();
/** Within a pixel: layouts round differently from browser to browser. */
const same = async (a: DOMRect, b: DOMRect) => {
  for (const side of ["left", "top", "width", "height"] as const) {
    await expect(Math.abs(a[side] - b[side])).toBeLessThan(1);
  }
};
const ready = (el: Element) =>
  waitFor(
    () => {
      for (const img of el.querySelectorAll("img")) expect(img.complete && img.naturalWidth > 0).toBe(true);
      expect(root(el).style.getPropertyValue("--_ratio")).not.toBe("");
    },
    { timeout: 3000 },
  );

/** `beforeSrc` / `afterSrc`: two pictures of different sizes share one box, the before picture's shape, and fit it. */
export const SourcesShareOneBox: Story = {
  tags: ["visual"],
  args: {
    before: undefined,
    after: undefined,
    beforeSrc: picture(600, 400, "teal"),
    beforeAlt: "Original, 600 by 400",
    afterSrc: picture(150, 100, "navy"),
    afterAlt: "Compressed, 150 by 100",
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const original = canvas.getByRole("img", { name: "Original, 600 by 400" });
    const compressed = canvas.getByRole("img", { name: "Compressed, 150 by 100" });
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    // As wide as the container, as tall as the before picture's shape makes it.
    await expect(Math.abs(frame.height - (frame.width * 2) / 3)).toBeLessThan(1);
    await same(rect(original), frame);
    await same(rect(compressed), frame);
    // The divider still splits them and moves.
    const divider = canvas.getByRole("slider");
    divider.focus();
    await userEvent.keyboard("{End}");
    await expect(divider).toHaveAttribute("aria-valuenow", "100");
  },
};

/** A side of another shape is shown whole inside the shared box (contained), centred. */
export const DifferentShapesFitTheBox: Story = {
  args: {
    before: undefined,
    after: undefined,
    beforeSrc: picture(400, 200, "teal"),
    beforeAlt: "Wide",
    afterSrc: picture(200, 200, "navy"),
    afterAlt: "Square",
  },
  play: async ({ canvas, canvasElement }) => {
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    await expect(Math.abs(frame.height - frame.width / 2)).toBeLessThan(1);
    const square = canvas.getByRole("img", { name: "Square" });
    await same(rect(square), frame);
    // The square is drawn whole in that box.
    await expect(getComputedStyle(square).objectFit).toBe("contain");
  },
};

/** Any child is laid out in the shared box: Images on both sides line up with each other and with the frame. */
export const AnyChildSharesTheBox: Story = {
  render: (args) => (
    <CompareSlider
      {...args}
      before={<Image src={picture(300, 200, "teal")} alt="Before" ratio={3 / 2} fit="contain" />}
      after={<Image src={picture(900, 600, "navy")} alt="After" ratio={3 / 2} fit="contain" />}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    await expect(Math.abs(frame.height - (frame.width * 2) / 3)).toBeLessThan(1);
    await same(rect(canvas.getByRole("img", { name: "Before" })), frame);
    await same(rect(canvas.getByRole("img", { name: "After" })), frame);
  },
};

export const BoxedStableUnderHostileHost: Story = {
  args: {
    before: undefined,
    after: undefined,
    beforeSrc: picture(300, 200, "teal"),
    beforeAlt: "Before",
    afterSrc: picture(300, 200, "navy"),
    afterAlt: "After",
  },
  play: async ({ canvasElement }) => {
    await ready(canvasElement);
    const props = ["display", "position", "width", "height", "max-width", "object-fit", "box-sizing"];
    for (const selector of [".cy-compare-slider", ".cy-compare-slider-stage", ".cy-compare-slider-img"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

/** An 800 by 400 picture in a 400px frame: fit is 50%, actual size is twice the frame. */
const wide = () => ({
  before: undefined,
  after: undefined,
  beforeSrc: picture(800, 400, "teal"),
  beforeAlt: "Original",
  afterSrc: picture(800, 400, "navy"),
  afterAlt: "Edited",
});
const imgOf = (el: Element) => el.querySelector('[data-side="before"] img') as HTMLElement;
/** A mouse (or finger) press, moves and a release on `target`, in viewport pixels. */
const press = (target: Element, pointerType = "mouse") => {
  const init = { bubbles: true, cancelable: true, pointerId: 5, pointerType, isPrimary: true, button: 0 };
  return {
    down: (x: number, y: number) =>
      target.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1, clientX: x, clientY: y })),
    move: (x: number, y: number) =>
      target.dispatchEvent(new PointerEvent("pointermove", { ...init, buttons: 1, clientX: x, clientY: y })),
    up: (x: number, y: number) =>
      target.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x, clientY: y })),
  };
};
const at = async (el: Element, left: number, top: number, width: number) => {
  const r = rect(imgOf(el));
  await expect(Math.abs(r.left - left)).toBeLessThan(1);
  await expect(Math.abs(r.top - top)).toBeLessThan(1);
  await expect(Math.abs(r.width - width)).toBeLessThan(1);
};

/** Fit (the default) or any percent of the picture's own size, chosen with ZoomControls; the frame keeps its size. */
export const ZoomFitOrActualSize: Story = {
  args: { ...wide(), onScaleChange: fn() },
  render: (args) => {
    function Zoomed() {
      const [zoom, setZoom] = useState<ZoomSetting>({ kind: "fit-page" });
      const [scale, setScale] = useState(1);
      return (
        <>
          <ZoomControls zoom={zoom} percent={scale * 100} onZoomChange={setZoom} />
          <CompareSlider
            {...args}
            zoom={zoom}
            onZoomChange={setZoom}
            onScaleChange={(s) => {
              setScale(s);
              args.onScaleChange?.(s);
            }}
          />
        </>
      );
    }
    return <Zoomed />;
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    // Fit: the 800px picture in the 400px frame is at 50%.
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(0.5));
    await expect(canvas.getByRole("button", { name: "Zoom 50%" })).toBeInTheDocument();
    await at(canvasElement, frame.left, frame.top, frame.width);
    // Actual size: twice the frame, centred in it; the frame itself does not grow.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 50%" }));
    await userEvent.click(await canvas.findByRole("menuitemradio", { name: "100%" }));
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(1));
    await at(canvasElement, frame.left - frame.width / 2, frame.top - frame.height / 2, frame.width * 2);
    await same(rect(root(canvasElement)), frame);
    // Both sides zoom together.
    await same(rect(canvas.getByRole("img", { name: "Edited" })), rect(imgOf(canvasElement)));
    // The change is announced.
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Zoom 100%"));
    // Zoom in steps from there; Fit page goes back.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(1.1));
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 110%" }));
    await userEvent.click(await canvas.findByRole("menuitemradio", { name: "Fit page" }));
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(0.5));
    await at(canvasElement, frame.left, frame.top, frame.width);
  },
};

/** Larger than the frame, the picture pans: drag it, the wheel or the arrows. The divider still moves by its line. */
export const PanWhenLargerThanTheFrame: Story = {
  args: { ...wide(), defaultZoom: { kind: "percent", value: 100 } },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    const [x0, y0] = [frame.left - frame.width / 2, frame.top - frame.height / 2];
    await waitFor(() => at(canvasElement, x0, y0, frame.width * 2));
    const divider = canvas.getByRole("slider");
    // A drag on the picture pans it and leaves the divider alone.
    const p = press(root(canvasElement));
    const [sx, sy] = [frame.left + frame.width * 0.2, frame.top + frame.height / 2];
    p.down(sx, sy);
    p.move(sx + 60, sy + 30);
    p.move(sx + 100, sy + 50);
    p.up(sx + 100, sy + 50);
    await waitFor(() => at(canvasElement, x0 + 100, y0 + 50, frame.width * 2));
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await expect(args.onChange).not.toHaveBeenCalled();
    // It stops at the picture's edges.
    p.down(sx, sy);
    p.move(sx + 900, sy + 900);
    p.up(sx + 900, sy + 900);
    await waitFor(() => at(canvasElement, frame.left, frame.top, frame.width * 2));
    // Escape mid-pan puts it back.
    p.down(sx, sy);
    p.move(sx - 150, sy);
    await waitFor(() => at(canvasElement, frame.left - 150, frame.top, frame.width * 2));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => at(canvasElement, frame.left, frame.top, frame.width * 2));
    p.up(sx - 150, sy);
    // A press on the divider's line drags the divider.
    const line = rect(divider);
    const d = press(divider);
    d.down(line.left + line.width / 2, sy);
    d.move(frame.left + frame.width * 0.7, sy);
    d.up(frame.left + frame.width * 0.7, sy);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "70"));
    await at(canvasElement, frame.left, frame.top, frame.width * 2);
    // The wheel pans (and is not left to the page).
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaX: 30, deltaY: 20 });
    root(canvasElement).dispatchEvent(wheel);
    await expect(wheel.defaultPrevented).toBe(true);
    await waitFor(() => at(canvasElement, frame.left - 30, frame.top - 20, frame.width * 2));
    // The zoomed view is a tab stop of its own, before the divider; the arrows pan it 40px.
    const view = canvas.getByRole("group", { name: "Zoomed comparison" });
    await expect(view).toBe(root(canvasElement));
    view.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => at(canvasElement, frame.left - 70, frame.top - 20, frame.width * 2));
    // Shift+Down goes 200px, and stops at the bottom edge on the way.
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await waitFor(() => at(canvasElement, frame.left - 70, frame.top - frame.height, frame.width * 2));
    await userEvent.tab();
    await expect(divider).toHaveFocus();
    // On the divider the arrows move it, not the view.
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "71");
    await at(canvasElement, frame.left - 70, frame.top - frame.height, frame.width * 2);
  },
};

/** At fit nothing pans: a press moves the divider, the wheel scrolls the page and the view is no tab stop. */
export const AtFitNothingPans: Story = {
  args: wide(),
  play: async ({ canvas, canvasElement }) => {
    await ready(canvasElement);
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 40 });
    root(canvasElement).dispatchEvent(wheel);
    await expect(wheel.defaultPrevented).toBe(false);
    // Without `zoomable`, Ctrl+wheel is the browser's page zoom.
    const zoom = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -40, ctrlKey: true });
    root(canvasElement).dispatchEvent(zoom);
    await expect(zoom.defaultPrevented).toBe(false);
    await expect(root(canvasElement)).not.toHaveAttribute("tabindex");
    await expect(canvas.queryByRole("group")).toBeNull();
  },
};

/** `zoomable`: Ctrl/Cmd+wheel (and a trackpad pinch) zooms around the pointer, Ctrl/Cmd and = - 0 from the keyboard. */
export const ZoomableByWheelAndKeys: Story = {
  args: { ...wide(), zoomable: true, onZoomChange: fn(), onScaleChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(0.5));
    // Zooming in around the top left corner keeps that corner where it is.
    const zoom = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: -200,
      ctrlKey: true,
      clientX: frame.left,
      clientY: frame.top,
    });
    root(canvasElement).dispatchEvent(zoom);
    await expect(zoom.defaultPrevented).toBe(true);
    await waitFor(() => expect(args.onZoomChange).toHaveBeenLastCalledWith({ kind: "percent", value: 67 }));
    await waitFor(() => at(canvasElement, frame.left, frame.top, 800 * 0.67));
    // Keys on the divider: Ctrl+0 is actual size, around the middle.
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{Control>}0{/Control}");
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(1));
    await userEvent.keyboard("{Control>}-{/Control}");
    await waitFor(() => expect(args.onScaleChange).toHaveBeenLastCalledWith(0.9));
  },
};

export const TouchPansWhenZoomed: Story = {
  tags: ["touch", "!dev"],
  args: { ...wide(), defaultZoom: { kind: "percent", value: 100 } },
  play: async ({ canvas, canvasElement }) => {
    await ready(canvasElement);
    const frame = rect(root(canvasElement));
    // Zoomed in, a finger pans the picture rather than the page.
    await waitFor(() => expect(getComputedStyle(root(canvasElement)).touchAction).toBe("none"));
    const p = press(root(canvasElement), "touch");
    const [sx, sy] = [frame.left + frame.width * 0.2, frame.top + frame.height / 2];
    p.down(sx, sy);
    p.move(sx + 40, sy);
    p.move(sx + 80, sy);
    p.up(sx + 80, sy);
    await waitFor(() =>
      at(canvasElement, frame.left - frame.width / 2 + 80, frame.top - frame.height / 2, frame.width * 2),
    );
    await expect(canvas.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  },
};
