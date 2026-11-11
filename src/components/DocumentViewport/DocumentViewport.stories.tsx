import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import {
  DocumentViewport,
  type ScrollRequest,
  type ViewportPage,
  type ZoomSetting,
} from "./DocumentViewport.js";

/** 40 pages, every fifth one landscape, as a mixed PDF has. */
const PAGES: ViewportPage[] = Array.from({ length: 40 }, (_, i) =>
  i % 5 === 4 ? { id: `p${i + 1}`, width: 800, height: 600 } : { id: `p${i + 1}`, width: 600, height: 800 },
);

function Reader({ start = { kind: "fit-width" } as ZoomSetting }) {
  const [zoom, setZoom] = useState<ZoomSetting>(start);
  const [current, setCurrent] = useState<string | null>(null);
  const [visible, setVisible] = useState<string[]>([]);
  const [scale, setScale] = useState(0);
  const [request, setRequest] = useState<ScrollRequest>();
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Button onClick={() => setRequest({ id: "p30", nonce: Date.now(), focus: true })}>Go to page 30</Button>
      <div style={{ inlineSize: 700, blockSize: 420 }}>
        <DocumentViewport
          label="Contract"
          pages={PAGES}
          zoom={zoom}
          onZoomChange={setZoom}
          onCurrentPageChange={setCurrent}
          onVisiblePagesChange={setVisible}
          onScaleChange={setScale}
          scrollTo={request}
          renderPage={({ id, scale: k, visible: inView }) => (
            <div
              data-testid={id}
              data-in-view={inView ? "" : undefined}
              style={{ blockSize: "100%", display: "grid", placeItems: "center", fontSize: 24 * k }}
            >
              {id.slice(1)}
            </div>
          )}
        />
      </div>
      <output data-testid="state">{JSON.stringify({ zoom, current, visible, scale })}</output>
    </div>
  );
}

const meta = {
  title: "Components/DocumentViewport",
  component: DocumentViewport,
  args: { label: "Contract", pages: PAGES, renderPage: () => null, onZoomChange: fn() },
  render: () => <Reader />,
} satisfies Meta<typeof DocumentViewport>;
export default meta;
type Story = StoryObj<typeof meta>;

type State = { zoom: ZoomSetting; current: string | null; visible: string[]; scale: number };
const state = (el: HTMLElement) =>
  JSON.parse((el.querySelector('[data-testid="state"]') as HTMLElement).textContent as string) as State;
const viewport = (el: HTMLElement) => el.querySelector(".cy-document-viewport") as HTMLElement;
const percent = (el: HTMLElement) => Math.round(state(el).scale * 100);

export const PagesOneUnderAnother: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const region = canvas.getByRole("region", { name: "Contract" });
    await expect(region).toHaveAttribute("tabindex", "0");
    const first = canvas.getByRole("group", { name: "Page 1 of 40" });
    // Fit width: the widest page (the landscape ones, 800 wide) fills the viewport less the gap either side.
    await waitFor(() => expect(state(canvasElement).scale).toBeGreaterThan(0.6));
    const { scale } = state(canvasElement);
    await expect(800 * scale).toBeLessThan(region.clientWidth);
    await expect(800 * scale).toBeGreaterThan(region.clientWidth - 80);
    await expect(first.getBoundingClientRect().width).toBeCloseTo(600 * scale, 0);
    // Only the pages near the view are there.
    await expect(canvasElement.querySelectorAll("[data-page]").length).toBeLessThan(6);
    await waitFor(() => expect(state(canvasElement).current).toBe("p1"));
    await expect(state(canvasElement).visible).toEqual(["p1"]);
  },
};

export const ScrollingReportsThePages: Story = {
  play: async ({ canvas, canvasElement }) => {
    const region = viewport(canvasElement);
    await waitFor(() => expect(state(canvasElement).current).toBe("p1"));
    region.scrollTop = region.scrollHeight / 2;
    await waitFor(() => expect(state(canvasElement).current).not.toBe("p1"));
    const { current, visible } = state(canvasElement);
    await expect(visible).toContain(current);
    await expect(canvas.getByTestId(current as string)).toHaveAttribute("data-in-view");
  },
};

export const KeysZoomInStepsAndAnnounce: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const region = viewport(canvasElement);
    region.focus();
    await userEvent.keyboard("{Control>}0{/Control}");
    await waitFor(() => expect(percent(canvasElement)).toBe(100));
    await expect(state(canvasElement).zoom).toEqual({ kind: "percent", value: 100 });
    await userEvent.keyboard("{Control>}={/Control}");
    await waitFor(() => expect(percent(canvasElement)).toBe(110));
    await expect(canvasElement.querySelector('[role="status"]')).toHaveTextContent("Zoom 110%");
    await userEvent.keyboard("{Control>}-{/Control}{Control>}-{/Control}");
    await waitFor(() => expect(percent(canvasElement)).toBe(90));
  },
};

export const CtrlWheelZoomsAroundThePointer: Story = {
  render: () => <Reader start={{ kind: "percent", value: 100 }} />,
  play: async ({ canvas, canvasElement }) => {
    const region = viewport(canvasElement);
    await waitFor(() => expect(percent(canvasElement)).toBe(100));
    const r = region.getBoundingClientRect();
    const at = { clientX: r.left + 200, clientY: r.top + 150 };
    // What is under the pointer: a point on page 1, as a fraction of the page.
    const under = () => {
      const p = canvas.getByRole("group", { name: "Page 1 of 40" }).getBoundingClientRect();
      return [(at.clientX - p.left) / p.width, (at.clientY - p.top) / p.height];
    };
    const before = under();
    region.dispatchEvent(
      new WheelEvent("wheel", { ...at, deltaY: -200, ctrlKey: true, bubbles: true, cancelable: true }),
    );
    await waitFor(() => expect(percent(canvasElement)).toBeGreaterThan(120));
    const after = under();
    await expect(after[0]).toBeCloseTo(before[0] as number, 1);
    await expect(after[1]).toBeCloseTo(before[1] as number, 1);
    // A wheel without Ctrl or Command just scrolls.
    region.dispatchEvent(new WheelEvent("wheel", { ...at, deltaY: 100, bubbles: true, cancelable: true }));
    await expect(percent(canvasElement)).toBeGreaterThan(120);
  },
};

export const SpaceDragPans: Story = {
  render: () => <Reader start={{ kind: "percent", value: 250 }} />,
  play: async ({ canvasElement, userEvent }) => {
    const region = viewport(canvasElement);
    region.focus();
    await userEvent.keyboard("{ >}");
    await expect(region).toHaveAttribute("data-panning");
    const r = region.getBoundingClientRect();
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 3,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    const x = r.left + 300;
    const y = r.top + 200;
    region.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x, clientY: y }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x - 120, clientY: y - 80 }));
    window.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x - 120, clientY: y - 80 }),
    );
    await expect(region.scrollLeft).toBeGreaterThan(100);
    await expect(region.scrollTop).toBeGreaterThan(60);
    await userEvent.keyboard("{/ }");
    await expect(region).not.toHaveAttribute("data-panning");
    // Without Space, a drag does not pan (it belongs to what is on the page).
    const left = region.scrollLeft;
    region.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x, clientY: y }));
    window.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x - 120, clientY: y }));
    window.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: x - 120, clientY: y }),
    );
    await expect(region.scrollLeft).toBe(left);
  },
};

export const GoToAPage: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Go to page 30" }));
    await waitFor(() => expect(canvas.getByRole("group", { name: "Page 30 of 40" })).toHaveFocus());
    await waitFor(() => expect(state(canvasElement).current).toBe("p30"));
  },
};

export const LabelsAndFitPage: Story = {
  render: () => (
    <div style={{ inlineSize: 500, blockSize: 300 }}>
      <DocumentViewport
        label="Vertrag"
        pages={PAGES.slice(0, 3)}
        defaultZoom={{ kind: "fit-page" }}
        className="product-doc"
        labels={{ page: (n, t) => `Seite ${n} von ${t}`, zoom: (p) => `Zoom ${p} Prozent` }}
        renderPage={() => null}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const page = canvas.getByRole("group", { name: "Seite 1 von 3" });
    await expect(canvas.getByRole("region", { name: "Vertrag" })).toHaveClass("product-doc");
    // Fit page: the whole page fits the height.
    await waitFor(() => expect(page.getBoundingClientRect().height).toBeLessThan(300));
  },
};

export const SpaceInAFieldTypesAndBlurLetsGo: Story = {
  render: () => (
    <div style={{ inlineSize: 500, blockSize: 300 }}>
      <DocumentViewport
        label="Form"
        pages={PAGES.slice(0, 2)}
        defaultZoom={{ kind: "percent", value: 100 }}
        renderPage={({ index }) => (index === 0 ? <input aria-label="Name" /> : null)}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const region = viewport(canvasElement);
    // Space typed in a field on a page is a space, not the hand tool.
    await userEvent.click(canvas.getByRole("textbox", { name: "Name" }));
    await userEvent.keyboard("a b");
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveValue("a b");
    await expect(region).not.toHaveAttribute("data-panning");
    // Held on the viewport it is; leaving lets go. Ctrl+0 at 100% changes nothing.
    region.focus();
    await userEvent.keyboard("{ >}{ >}");
    await expect(region).toHaveAttribute("data-panning");
    await userEvent.keyboard("{Control>}0x{/Control}");
    region.blur();
    await waitFor(() => expect(region).not.toHaveAttribute("data-panning"));
    region.dispatchEvent(new FocusEvent("blur"));
  },
};

export const CentresASpotAndKeepsFocus: Story = {
  render: () => {
    function Jump() {
      const [request, setRequest] = useState<ScrollRequest>();
      return (
        <div style={{ display: "grid", gap: 8, inlineSize: 500 }}>
          <Button
            onClick={() =>
              setRequest({ id: "p12", nonce: 1, rect: { left: 280, top: 700, width: 40, height: 40 } })
            }
          >
            Show the signature
          </Button>
          <Button onClick={() => setRequest({ id: "missing", nonce: 2 })}>Unknown page</Button>
          <div style={{ blockSize: 300 }}>
            <DocumentViewport
              label="Contract"
              pages={PAGES}
              defaultZoom={{ kind: "percent", value: 100 }}
              scrollTo={request}
              style={{ "--cy-document-viewport-gap": "40px" } as React.CSSProperties}
              renderPage={() => null}
            />
          </div>
        </div>
      );
    }
    return <Jump />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const region = viewport(canvasElement);
    const button = canvas.getByRole("button", { name: "Show the signature" });
    await userEvent.click(button);
    // The spot is centred in the viewport, and focus stays on the button.
    const page = await canvas.findByRole("group", { name: "Page 12 of 40" });
    const p = page.getBoundingClientRect();
    const r = region.getBoundingClientRect();
    await expect(p.top + 720 - (r.top + region.clientHeight / 2)).toBeLessThan(2);
    await expect(Math.abs(p.left + 300 - (r.left + region.clientWidth / 2))).toBeLessThan(2);
    await expect(button).toHaveFocus();
    // The gap comes from the token: page 1 starts 40px down.
    const top = region.scrollTop;
    await userEvent.click(canvas.getByRole("button", { name: "Unknown page" }));
    await expect(region.scrollTop).toBe(top);
  },
};

export const NoPages: Story = {
  render: () => (
    <div style={{ inlineSize: 400, blockSize: 200 }}>
      <DocumentViewport label="Empty" pages={[]} renderPage={() => null} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Empty" })).toBeVisible();
    await expect(canvas.queryAllByRole("group")).toHaveLength(0);
  },
};

export const PinchZooms: Story = {
  tags: ["touch", "!dev"],
  render: () => <Reader start={{ kind: "percent", value: 100 }} />,
  play: async ({ canvasElement }) => {
    const region = viewport(canvasElement);
    await expect(getComputedStyle(region).touchAction).toBe("pan-x pan-y");
    const r = region.getBoundingClientRect();
    const touch = (type: string, id: number, x: number) =>
      (type === "pointerdown" ? region : window).dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: id,
          pointerType: "touch",
          isPrimary: id === 1,
          clientX: r.left + x,
          clientY: r.top + 150,
        }),
      );
    // One finger alone does not zoom.
    touch("pointerdown", 1, 300);
    touch("pointermove", 1, 290);
    await expect(percent(canvasElement)).toBe(100);
    touch("pointerdown", 2, 340);
    touch("pointermove", 1, 260);
    touch("pointermove", 2, 380);
    await waitFor(() => expect(percent(canvasElement)).toBeGreaterThan(200));
    touch("pointerup", 1, 260);
    touch("pointerup", 2, 380);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "overflow-y", "box-sizing", "position", "font-size"];
    for (const selector of [".cy-document-viewport", ".cy-document-viewport-page"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
