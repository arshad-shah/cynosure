import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect } from "storybook/test";
import { Badge } from "../Badge/Badge.js";
import { Inline } from "./Inline.js";

const SPACES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
/** The four padding values of an element, in px, as [block-start, inline-end, block-end, inline-start]. */
const paddingOf = (el: Element) => {
  const style = getComputedStyle(el);
  return [style.paddingBlockStart, style.paddingInlineEnd, style.paddingBlockEnd, style.paddingInlineStart];
};

const meta = {
  title: "Components/Structure/Inline",
  component: Inline,
  args: { gap: "3", wrap: true },
  argTypes: {
    gap: { control: "select", options: SPACES },
    padding: { control: "select", options: SPACES },
    paddingInline: { control: "select", options: SPACES },
    paddingBlock: { control: "select", options: SPACES },
    grow: { control: "boolean" },
    shrink: { control: "boolean" },
    fill: { control: "boolean" },
    minSize: { control: "inline-radio", options: [undefined, "0"] },
    overflow: { control: "inline-radio", options: [undefined, "hidden", "auto", "visible"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "baseline", "stretch"] },
    justify: { control: "inline-radio", options: ["start", "center", "end", "between"] },
    wrap: { control: "boolean" },
  },
} satisfies Meta<typeof Inline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RowWithTokenGap: Story = {
  tags: ["visual"],
  render: (args) => (
    <Inline {...args} data-testid="inline">
      <Badge tone="accent">Accent</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="danger">Danger</Badge>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByTestId("inline"));
    await expect([style.flexDirection, style.columnGap]).toEqual(["row", "6px"]);
  },
};

export const DefaultsAndLayoutProps: Story = {
  render: () => (
    <Inline className="host-row" style={{ maxWidth: 200 }} data-testid="row">
      <span>A</span>
      <span>B</span>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByTestId("row");
    await expect(row).toHaveClass("cy-inline", "host-row");
    await expect(getComputedStyle(row).columnGap).toBe("6px");
    await expect(getComputedStyle(row).flexWrap).toBe("nowrap");
    await expect(getComputedStyle(row).alignItems).toBe("center");
    await expect(getComputedStyle(row).maxWidth).toBe("200px");
  },
};

export const PaddingUsesSpaceTokens: Story = {
  args: { padding: "5" },
  render: (args) => (
    <Inline {...args} data-testid="inline">
      <Badge>One</Badge>
      <Badge>Two</Badge>
    </Inline>
  ),
  play: async ({ canvas }) => {
    const inline = canvas.getByTestId("inline");
    // Space 5 is 12px, on all four sides; the first item starts inside it.
    await expect(paddingOf(inline)).toEqual(["12px", "12px", "12px", "12px"]);
    const [outer, first] = [inline.getBoundingClientRect(), canvas.getByText("One").getBoundingClientRect()];
    await expect(first.left - outer.left).toBeCloseTo(12, 0);
    await expect(first.top - outer.top).toBeCloseTo(12, 0);
  },
};

export const InlineAndBlockPaddingWinOverPadding: Story = {
  render: () => (
    <>
      <Inline padding="4" paddingInline="8" data-testid="inline-wins">
        <span>A</span>
      </Inline>
      <Inline padding="4" paddingBlock="0" data-testid="block-wins">
        <span>B</span>
      </Inline>
      <Inline paddingInline="6" data-testid="inline-only">
        <span>C</span>
      </Inline>
    </>
  ),
  play: async ({ canvas }) => {
    await expect(paddingOf(canvas.getByTestId("inline-wins"))).toEqual(["8px", "24px", "8px", "24px"]);
    await expect(paddingOf(canvas.getByTestId("block-wins"))).toEqual(["0px", "8px", "0px", "8px"]);
    await expect(paddingOf(canvas.getByTestId("inline-only"))).toEqual(["0px", "16px", "0px", "16px"]);
  },
};

export const PaddedRowStaysInsideItsParentInRtl: Story = {
  render: () => (
    <div dir="rtl" style={{ inlineSize: 200 }} data-testid="frame">
      <Inline padding="6" wrap data-testid="outer">
        <Badge>First</Badge>
        <Inline data-testid="inner">
          <Badge>Nested</Badge>
        </Inline>
      </Inline>
    </div>
  ),
  play: async ({ canvas }) => {
    const [frame, outer] = [canvas.getByTestId("frame"), canvas.getByTestId("outer")].map((el) =>
      el.getBoundingClientRect(),
    ) as [DOMRect, DOMRect];
    // The padding is inside the row's width, and in right-to-left text the first item starts 16px from the right.
    await expect(outer.width).toBeCloseTo(frame.width, 0);
    await expect(outer.right - canvas.getByText("First").getBoundingClientRect().right).toBeCloseTo(16, 0);
    // A nested row has no padding of its own and does not inherit the parent's.
    await expect(paddingOf(canvas.getByTestId("inner"))).toEqual(["0px", "0px", "0px", "0px"]);
    await expect(canvas.getByTestId("inner").getAttribute("style")).not.toContain("pad");
  },
};

/** A status bar in right-to-left text: the grown item takes the free space and the one after it sits at the end. */
export const GrowPushesTheRestToTheEndInRtl: Story = {
  render: () => (
    <div dir="rtl" style={{ inlineSize: 300 }}>
      <Inline data-testid="bar" overflow="hidden">
        <Badge>main</Badge>
        <Inline grow minSize="0" data-testid="grown">
          <Badge>Ready</Badge>
        </Inline>
        <Badge>Ln 1</Badge>
      </Inline>
    </div>
  ),
  play: async ({ canvas }) => {
    const bar = canvas.getByTestId("bar").getBoundingClientRect();
    await expect(canvas.getByText("Ln 1").getBoundingClientRect().left).toBeCloseTo(bar.left, 0);
    await expect(getComputedStyle(canvas.getByTestId("grown")).flexGrow).toBe("1");
    await expect(getComputedStyle(canvas.getByTestId("bar")).overflowX).toBe("hidden");
  },
};

export const PassesHandlersDataAndRef: Story = {
  render: () => {
    function Zone() {
      const ref = useRef<HTMLElement>(null);
      const [log, setLog] = useState<string[]>([]);
      const [hasRef, setHasRef] = useState(false);
      useEffect(() => setHasRef(ref.current?.dataset.zone === "drop"), []);
      return (
        <>
          <Inline
            ref={ref}
            gap="2"
            data-zone="drop"
            data-state={log.length ? "used" : "idle"}
            aria-label="Drop zone"
            role="group"
            tabIndex={0}
            onClick={() => setLog((l) => [...l, "click"])}
            onKeyDown={(e) => e.key === "Enter" && setLog((l) => [...l, "enter"])}
            onDragOver={(e) => e.preventDefault()}
            onPointerEnter={() => setLog((l) => [...l, "enter-pointer"])}
          >
            <span>Drop files here</span>
          </Inline>
          <output data-testid="log">{log.join(",")}</output>
          <output data-testid="ref">{String(hasRef)}</output>
        </>
      );
    }
    return <Zone />;
  },
  play: async ({ canvas, userEvent }) => {
    const zone = canvas.getByRole("group", { name: "Drop zone" });
    // Any data-* attribute reaches the element, and the ref is the element itself.
    await expect(zone).toHaveAttribute("data-zone", "drop");
    await expect(zone).toHaveAttribute("data-state", "idle");
    await expect(canvas.getByTestId("ref")).toHaveTextContent("true");
    // Event handlers run on the element: pointer, click and keys (it is focusable with tabIndex).
    await userEvent.hover(zone);
    await userEvent.click(zone);
    await expect(zone).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByTestId("log")).toHaveTextContent("enter-pointer,click,enter");
    await expect(zone).toHaveAttribute("data-state", "used");
  },
};
