import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import type { ZoomSetting } from "../../foundations/zoom.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { DocumentViewport } from "../DocumentViewport/DocumentViewport.js";
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
  title: "Components/ZoomControls",
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
