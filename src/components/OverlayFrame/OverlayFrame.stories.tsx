import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { OverlayFrame } from "./OverlayFrame.js";

/** A plain scroller with 40 lines and a sticky footer row raised over the lines (as VirtualList's pinned heading). */
const Scroller = () => (
  // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must be reachable by keyboard
  <section data-testid="scroller" aria-label="Log" tabIndex={0} style={{ overflow: "auto" }}>
    {Array.from({ length: 40 }, (_, i) => (
      <p key={`line-${i + 1}`} style={{ margin: 0, padding: 4 }}>{`Line ${i + 1}`}</p>
    ))}
    <div
      data-testid="sticky"
      style={{ position: "sticky", insetBlockEnd: 0, zIndex: 2, blockSize: 48, background: "Canvas" }}
    />
  </section>
);

const meta = {
  title: "Components/OverlayFrame",
  component: OverlayFrame,
  args: { overlay: <Badge tone="accent">3 new</Badge> },
  argTypes: {
    overlay: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <div style={{ display: "grid", gridTemplateRows: "minmax(0, 1fr)", blockSize: 200, inlineSize: 320 }}>
      <OverlayFrame {...args} data-testid="frame">
        <Scroller />
      </OverlayFrame>
    </div>
  ),
} satisfies Meta<typeof OverlayFrame>;
export default meta;
type Story = StoryObj<typeof meta>;

const scrollTo = async (el: HTMLElement, top: number) => {
  el.scrollTop = top;
  await new Promise((res) => el.addEventListener("scroll", res, { once: true }));
};

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame");
    const scroller = canvas.getByTestId("scroller");
    const pill = canvas.getByText("3 new");
    // The content fills the frame.
    await expect(scroller.getBoundingClientRect()).toMatchObject({
      width: frame.getBoundingClientRect().width,
      height: frame.getBoundingClientRect().height,
    });
    const where = () => {
      const [f, p] = [frame.getBoundingClientRect(), pill.getBoundingClientRect()];
      return {
        bottom: Math.round(f.bottom - p.bottom),
        centre: Math.round(f.left + f.width / 2 - (p.left + p.width / 2)),
      };
    };
    // Bottom centre, a little above the edge, and it stays there while the content scrolls.
    const before = where();
    await expect(Math.abs(before.centre)).toBeLessThanOrEqual(1);
    await expect(before.bottom).toBeGreaterThan(0);
    await expect(before.bottom).toBeLessThan(40);
    await scrollTo(scroller, 300);
    await expect(where()).toEqual(before);
    // It is not inside the content.
    await expect(scroller).not.toContainElement(pill);
  },
};

export const OverlayIsAboveRaisedContent: Story = {
  args: {
    overlay: (
      <Button size="sm" onClick={fn()}>
        Latest
      </Button>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    const button = canvas.getByRole("button", { name: "Latest" });
    const box = button.getBoundingClientRect();
    // The sticky row (z-index 2) is under the overlay: a press at the button's middle reaches the button.
    await expect(canvas.getByTestId("sticky").getBoundingClientRect().bottom).toBeGreaterThanOrEqual(
      box.bottom,
    );
    const hit = canvasElement.ownerDocument.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    await expect(button.contains(hit)).toBe(true);
  },
};

/** The offset token, set through `style`, moves the overlay; `className` adds a layout class beside the frame's own. */
export const OffsetTokenAndClassName: Story = {
  render: (args) => (
    <div style={{ display: "grid", gridTemplateRows: "minmax(0, 1fr)", blockSize: 200, inlineSize: 320 }}>
      <OverlayFrame
        {...args}
        data-testid="frame"
        className="layout-probe"
        style={{ "--cy-overlay-frame-offset": "0" } as CSSProperties}
      >
        <Scroller />
      </OverlayFrame>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("frame")).toHaveClass("cy-overlay-frame", "layout-probe");
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const pill = canvas.getByText("3 new").getBoundingClientRect();
    await expect(Math.round(frame.bottom - pill.bottom)).toBe(0);
  },
};

function Toggling() {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ display: "grid", gap: 8, inlineSize: 320 }}>
      <div style={{ display: "grid", gridTemplateRows: "minmax(0, 1fr)", blockSize: 200 }}>
        <OverlayFrame overlay={shown && <Badge>New</Badge>}>
          <Scroller />
        </OverlayFrame>
      </div>
      <Button onClick={() => setShown((s) => !s)}>Toggle</Button>
    </div>
  );
}

export const OverlayComesAndGoesWithoutRemounting: Story = {
  render: () => <Toggling />,
  play: async ({ canvas, userEvent }) => {
    const scroller = canvas.getByTestId("scroller");
    // false renders nothing.
    await expect(canvas.queryByText("New")).toBeNull();
    await scrollTo(scroller, 200);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle" }));
    await expect(await canvas.findByText("New")).toBeVisible();
    // The content is the same element, still scrolled where it was.
    await expect(canvas.getByTestId("scroller")).toBe(scroller);
    await expect(scroller.scrollTop).toBe(200);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle" }));
    await waitFor(() => expect(canvas.queryByText("New")).toBeNull());
    await expect(scroller.scrollTop).toBe(200);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const parts: [string, string[]][] = [
      [".cy-overlay-frame", ["display", "box-sizing", "margin-top", "padding-left", "grid-template-rows"]],
      [
        ".cy-overlay-frame-overlay",
        ["align-self", "justify-self", "margin-bottom", "z-index", "padding-top"],
      ],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
