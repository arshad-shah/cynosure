import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import type { ZoomSetting } from "../../foundations/zoom.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { DocumentViewport } from "../DocumentViewport/DocumentViewport.js";
import { type CanvasView, PanZoomCanvas, type PanZoomCanvasHandle } from "../PanZoomCanvas/PanZoomCanvas.js";
import { ZoomControls, type ZoomControlsProps } from "./ZoomControls.js";

/** The controls on their own: fit modes come to 87% here. */
function Alone(props: Partial<ZoomControlsProps> & { start?: ZoomSetting }) {
  const [zoom, setZoom] = useState<ZoomSetting>(props.start ?? { kind: "percent", value: 100 });
  const percent = zoom.kind === "percent" ? zoom.value : 87;
  return (
    <>
      <ZoomControls
        {...props}
        zoom={zoom}
        percent={percent}
        onZoomChange={(z) => {
          setZoom(z);
          props.onZoomChange?.(z);
        }}
      />
      <output data-testid="zoom">{JSON.stringify(zoom)}</output>
    </>
  );
}

const meta = {
  title: "Components/Structure/ZoomControls",
  component: ZoomControls,
  args: { zoom: { kind: "percent", value: 100 }, percent: 100, onZoomChange: fn() },
  render: (args) => <Alone onZoomChange={args.onZoomChange} />,
} satisfies Meta<typeof ZoomControls>;
export default meta;
type Story = StoryObj<typeof meta>;

const zoomOf = (el: HTMLElement) =>
  JSON.parse(el.querySelector('[data-testid="zoom"]')?.textContent as string);

export const StepsAndAMenu: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("toolbar", { name: "Zoom" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await expect(args.onZoomChange).toHaveBeenLastCalledWith({ kind: "percent", value: 110 });
    await userEvent.click(canvas.getByRole("button", { name: "Zoom out" }));
    await userEvent.click(canvas.getByRole("button", { name: "Zoom out" }));
    await expect(zoomOf(canvasElement)).toEqual({ kind: "percent", value: 90 });
    // The menu shows the percent, marks the choice, and closes when one is made.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 90%" }));
    await expect(await canvas.findByRole("menuitemradio", { name: "Fit width" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Fit page" }));
    await expect(zoomOf(canvasElement)).toEqual({ kind: "fit-page" });
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 87%" }));
    await expect(await canvas.findByRole("menuitemradio", { name: "Fit page" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "200%" }));
    await expect(zoomOf(canvasElement)).toEqual({ kind: "percent", value: 200 });
  },
};

export const OneTabStop: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Zoom out" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Zoom 100%" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(canvas.getByRole("button", { name: "Zoom 110%" })).toBeVisible();
  },
};

export const StopsAtTheLimits: Story = {
  render: () => (
    <>
      <Alone start={{ kind: "percent", value: 800 }} labels={{ group: "Largest" }} />
      <Alone start={{ kind: "percent", value: 25 }} labels={{ group: "Smallest" }} />
    </>
  ),
  play: async ({ canvas }) => {
    const largest = canvas.getByRole("toolbar", { name: "Largest" });
    const smallest = canvas.getByRole("toolbar", { name: "Smallest" });
    await expect(largest.querySelector('[aria-label="Zoom in"]')).toBeDisabled();
    await expect(largest.querySelector('[aria-label="Zoom out"]')).toBeEnabled();
    await expect(smallest.querySelector('[aria-label="Zoom out"]')).toBeDisabled();
  },
};

export const LimitsOfItsOwn: Story = {
  render: () => (
    <>
      <Alone start={{ kind: "percent", value: 300 }} min={20} max={300} labels={{ group: "Largest" }} />
      <Alone start={{ kind: "percent", value: 25 }} min={20} max={300} labels={{ group: "Smaller" }} />
    </>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const largest = canvas.getByRole("toolbar", { name: "Largest" });
    const smaller = canvas.getByRole("toolbar", { name: "Smaller" });
    // A canvas that stops at 300% and 20%: zoom in stops at 300, and zoom out goes below 25 to 20 and stops.
    await expect(largest.querySelector('[aria-label="Zoom in"]')).toBeDisabled();
    const out = smaller.querySelector('[aria-label="Zoom out"]') as HTMLElement;
    await expect(out).toBeEnabled();
    await userEvent.click(out);
    const zoom = canvasElement.querySelectorAll('[data-testid="zoom"]')[1] as HTMLElement;
    await expect(JSON.parse(zoom.textContent as string)).toEqual({ kind: "percent", value: 20 });
    await expect(out).toBeDisabled();
    // The menu offers only the presets inside the limits.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 300%" }));
    await shownFully(await canvas.findByRole("menu"));
    await expect(canvas.getByRole("menuitemradio", { name: "200%" })).toBeVisible();
    await expect(canvas.queryByRole("menuitemradio", { name: "400%" })).toBeNull();
    await userEvent.keyboard("{Escape}");
  },
};

export const DrivesADocumentViewport: Story = {
  render: () => {
    function Reader() {
      const [zoom, setZoom] = useState<ZoomSetting>({ kind: "percent", value: 100 });
      const [scale, setScale] = useState(1);
      const pages = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, width: 600, height: 800 }));
      return (
        <div style={{ display: "grid", gap: 8, inlineSize: 600 }}>
          <ZoomControls zoom={zoom} percent={scale * 100} onZoomChange={setZoom} />
          <output data-testid="zoom">{JSON.stringify(zoom)}</output>
          <div style={{ blockSize: 300 }}>
            <DocumentViewport
              label="Report"
              pages={pages}
              zoom={zoom}
              onZoomChange={setZoom}
              onScaleChange={setScale}
              renderPage={() => null}
            />
          </div>
        </div>
      );
    }
    return <Reader />;
  },
  play: async ({ canvas, userEvent }) => {
    const page = canvas.getByRole("group", { name: "Page 1 of 5" });
    await waitFor(() => expect(page.getBoundingClientRect().width).toBeCloseTo(600, 0));
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(page.getBoundingClientRect().width).toBeCloseTo(660, 0));
    // Fit width from the menu; the button then shows what it came to.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 110%" }));
    await userEvent.click(await canvas.findByRole("menuitemradio", { name: "Fit width" }));
    await expect(canvas.getByTestId("zoom")).toHaveTextContent('{"kind":"fit-width"}');
    await waitFor(() => expect(page.getBoundingClientRect().width).toBeLessThan(600));
    await expect(canvas.getByRole("button", { name: /^Zoom \d+%$/ })).not.toHaveAccessibleName("Zoom 110%");
  },
};

export const DrivesAPanZoomCanvas: Story = {
  render: () => {
    function Board() {
      const canvas = useRef<PanZoomCanvasHandle>(null);
      const [view, setView] = useState<CanvasView>({ x: 0, y: 0, scale: 1 });
      return (
        <div style={{ blockSize: 300, inlineSize: 400 }}>
          <PanZoomCanvas
            label="Map"
            handle={canvas}
            view={view}
            onViewChange={setView}
            min={50}
            max={200}
            bounds={{ x: 0, y: 0, width: 1600, height: 1200 }}
            overlays={{
              "top-end": (
                <ZoomControls
                  percent={view.scale * 100}
                  onZoomChange={(z) => canvas.current?.zoom(z)}
                  min={50}
                  max={200}
                  steps={[50, 100, 200]}
                  fits={[]}
                  buttons={["fit", "actual-size"]}
                />
              ),
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 1200 }} />
          </PanZoomCanvas>
          <output data-testid="scale">{view.scale}</output>
        </div>
      );
    }
    return <Board />;
  },
  play: async ({ canvas, userEvent }) => {
    const scale = () => Number(canvas.getByTestId("scale").textContent);
    const toolbar = canvas.getByRole("toolbar", { name: "Zoom" });
    // Fit to view: the whole content in the canvas, here at the canvas's own lower limit.
    await userEvent.click(canvas.getByRole("button", { name: "Fit to view" }));
    await waitFor(() => expect(scale()).toBeCloseTo(0.5, 2));
    await expect(canvas.getByRole("button", { name: "Zoom out" })).toBeDisabled();
    // Actual size is 100%.
    await userEvent.click(canvas.getByRole("button", { name: "Actual size" }));
    await waitFor(() => expect(scale()).toBe(1));
    // Zoom in goes through the canvas's own steps: 100 to 200, then stops.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(scale()).toBe(2));
    await expect(canvas.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    // The menu has no document fit modes; the preset the canvas is at is checked, without a `zoom` setting.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 200%" }));
    await shownFully(await canvas.findByRole("menu"));
    await expect(canvas.queryByRole("menuitemradio", { name: "Fit width" })).toBeNull();
    await expect(canvas.queryByRole("menuitemradio", { name: "Fit page" })).toBeNull();
    await expect(canvas.getByRole("menuitemradio", { name: "200%" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "75%" }));
    await waitFor(() => expect(scale()).toBe(0.75));
    // One tab stop still: the arrows reach the fit and actual size buttons.
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    const buttons = within(toolbar)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label"));
    await expect(buttons).toEqual(["Zoom out", "Zoom 75%", "Zoom in", "Fit to view", "Actual size"]);
  },
};

export const FitAndActualSizeButtons: Story = {
  render: () => (
    <Alone
      start={{ kind: "percent", value: 150 }}
      fits={["fit-page"]}
      buttons={["fit", "actual-size"]}
      labels={{ fit: "Ganze Seite", actualSize: "Originalgröße" }}
    />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Originalgröße" }));
    await expect(zoomOf(canvasElement)).toEqual({ kind: "percent", value: 100 });
    // Fit applies the whole content fit (`fit-page`).
    await userEvent.click(canvas.getByRole("button", { name: "Ganze Seite" }));
    await expect(zoomOf(canvasElement)).toEqual({ kind: "fit-page" });
    // `fits` limits the menu's fit modes.
    await userEvent.click(canvas.getByRole("button", { name: "Zoom 87%" }));
    await shownFully(await canvas.findByRole("menu"));
    await expect(canvas.getByRole("menuitemradio", { name: "Fit page" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(canvas.queryByRole("menuitemradio", { name: "Fit width" })).toBeNull();
    await userEvent.keyboard("{Escape}");
  },
};

export const Labels: Story = {
  render: () => (
    <Alone
      className="product-zoom"
      style={{ marginBlockStart: 4 }}
      presets={[100, 300]}
      labels={{
        group: "Vergrößerung",
        zoomIn: "Vergrößern",
        zoomOut: "Verkleinern",
        menu: (p) => `Vergrößerung ${p} Prozent`,
        fitWidth: "Breite",
        fitPage: "Seite",
      }}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("toolbar", { name: "Vergrößerung" })).toHaveClass("product-zoom");
    await userEvent.click(canvas.getByRole("button", { name: "Vergrößerung 100 Prozent" }));
    await shownFully(await canvas.findByRole("menu"));
    await expect(canvas.getByRole("menuitemradio", { name: "300%" })).toBeVisible();
    await expect(canvas.queryByRole("menuitemradio", { name: "50%" })).toBeNull();
    await expect(canvas.getByRole("menuitemradio", { name: "Breite" })).toBeVisible();
  },
};

export const TouchTargets: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Zoom in" });
    await expect(Number.parseFloat(getComputedStyle(button, "::before").width)).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "min-width", "font-size", "box-sizing"];
    for (const selector of [".cy-zoom-controls", ".cy-zoom-controls-value"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
