import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { pressKey } from "../../test/keys.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { ScrollArea, type ScrollAreaHandle, type ScrollAreaProps } from "./ScrollArea.js";

const lines = (n: number, from = 0) =>
  Array.from({ length: n }, (_, i) => <p key={`line-${from + i}`}>{`Line ${from + i + 1}`}</p>);

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  args: { label: "Log", direction: "vertical", follow: false, onScroll: fn(), onAtBottomChange: fn() },
  argTypes: {
    label: { control: "text" },
    direction: { control: "inline-radio", options: ["vertical", "horizontal", "both"] },
    follow: { control: "boolean" },
    overlay: { control: false },
    handle: { control: false },
  },
  render: (args) => (
    <div style={{ blockSize: 200, inlineSize: 320 }}>
      <ScrollArea {...args}>{lines(40)}</ScrollArea>
    </div>
  ),
} satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

const viewport = (el: Element) => el.querySelector(".cy-scroll-area-viewport") as HTMLElement;
const atEnd = (el: HTMLElement) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
/** Scrolls as a person does: the browser fires the scroll event itself, after the frame. */
const scrollTo = async (el: HTMLElement, top: number) => {
  el.scrollTop = top;
  await new Promise((res) => el.addEventListener("scroll", res, { once: true }));
};

/** A chat or activity stream: messages arrive, a pill shows how many came in while reading further up. */
function Feed(props: Partial<ScrollAreaProps> & { start?: number }) {
  const { start = 30, ...rest } = props;
  const [count, setCount] = useState(start);
  const [unseen, setUnseen] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const handle = useRef<ScrollAreaHandle>(null);
  return (
    <Stack gap="2">
      <div style={{ blockSize: 200, inlineSize: 320 }}>
        <ScrollArea
          label="Activity"
          follow
          handle={handle}
          {...rest}
          onAtBottomChange={(bottom) => {
            setAtBottom(bottom);
            if (bottom) setUnseen(0);
            rest.onAtBottomChange?.(bottom);
          }}
          overlay={
            !atBottom && unseen > 0 ? (
              <Button size="sm" variant="solid" tone="accent" onClick={() => handle.current?.scrollToEnd()}>
                {`${unseen} new`}
              </Button>
            ) : null
          }
        >
          {lines(count)}
        </ScrollArea>
      </div>
      <Button
        size="sm"
        onClick={() => {
          setCount((c) => c + 1);
          if (!atBottom) setUnseen((u) => u + 1);
        }}
      >
        Add a line
      </Button>
    </Stack>
  );
}

export const FollowKeepsTheEndInView: Story = {
  tags: ["visual"],
  render: (args) => <Feed onAtBottomChange={args.onAtBottomChange} />,
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const el = viewport(canvasElement);
    const add = canvas.getByRole("button", { name: "Add a line" });
    // It starts at the end and stays there as lines arrive.
    await waitFor(() => expect(atEnd(el)).toBe(true));
    await expect(el.scrollTop).toBeGreaterThan(0);
    await userEvent.click(add);
    await userEvent.click(add);
    await waitFor(() => expect(canvas.getByText("Line 32")).toBeInTheDocument());
    await waitFor(() => expect(atEnd(el)).toBe(true));
    await expect(args.onAtBottomChange).not.toHaveBeenCalled();
    // Scrolling up to read lets go, and says so.
    await scrollTo(el, 40);
    await waitFor(() => expect(args.onAtBottomChange).toHaveBeenLastCalledWith(false));
    await userEvent.click(add);
    await waitFor(() => expect(canvas.getByText("Line 33")).toBeInTheDocument());
    await new Promise((res) => setTimeout(res, 50));
    await expect(el.scrollTop).toBe(40);
    // The overlay counts what arrived; it jumps back to the end, which follows again.
    await userEvent.click(canvas.getByRole("button", { name: "1 new" }));
    await waitFor(() => expect(atEnd(el)).toBe(true));
    await expect(args.onAtBottomChange).toHaveBeenLastCalledWith(true);
    await expect(canvas.queryByRole("button", { name: /new/ })).toBeNull();
    await userEvent.click(add);
    await waitFor(() => expect(canvas.getByText("Line 34")).toBeInTheDocument());
    await waitFor(() => expect(atEnd(el)).toBe(true));
  },
};

export const ScrollingBackToTheEndResumes: Story = {
  render: (args) => <Feed onAtBottomChange={args.onAtBottomChange} />,
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const el = viewport(canvasElement);
    await waitFor(() => expect(atEnd(el)).toBe(true));
    await scrollTo(el, 0);
    await waitFor(() => expect(args.onAtBottomChange).toHaveBeenLastCalledWith(false));
    // Scrolling down, not yet to the end, keeps it released.
    await scrollTo(el, 60);
    await expect(args.onAtBottomChange).toHaveBeenCalledTimes(1);
    // Reaching the end by scrolling follows again.
    await scrollTo(el, el.scrollHeight);
    await waitFor(() => expect(args.onAtBottomChange).toHaveBeenLastCalledWith(true));
    await userEvent.click(canvas.getByRole("button", { name: "Add a line" }));
    await waitFor(() => expect(canvas.getByText("Line 31")).toBeInTheDocument());
    await waitFor(() => expect(atEnd(el)).toBe(true));
  },
};

export const WithoutFollowNewContentStaysBelow: Story = {
  render: (args) => <Feed follow={false} onAtBottomChange={args.onAtBottomChange} />,
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const el = viewport(canvasElement);
    // It opens at the top, so it is not at the end.
    await waitFor(() => expect(args.onAtBottomChange).toHaveBeenLastCalledWith(false));
    await expect(el.scrollTop).toBe(0);
    await userEvent.click(canvas.getByRole("button", { name: "Add a line" }));
    await new Promise((res) => setTimeout(res, 50));
    await expect(el.scrollTop).toBe(0);
  },
};

export const OverlayStaysPut: Story = {
  render: () => (
    <div style={{ blockSize: 200, inlineSize: 320 }}>
      <ScrollArea label="Log" overlay={<Badge tone="accent">3 new</Badge>} data-testid="area">
        {lines(40)}
      </ScrollArea>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const area = canvas.getByTestId("area");
    const pill = canvas.getByText("3 new");
    const where = () => {
      const [a, p] = [area.getBoundingClientRect(), pill.getBoundingClientRect()];
      return {
        bottom: Math.round(a.bottom - p.bottom),
        centre: Math.round(a.left + a.width / 2 - (p.left + p.width / 2)),
      };
    };
    const before = where();
    // Bottom centre, a little above the edge.
    await expect(before.centre).toBeLessThanOrEqual(1);
    await expect(before.centre).toBeGreaterThanOrEqual(-1);
    await expect(before.bottom).toBeGreaterThan(0);
    await expect(before.bottom).toBeLessThan(40);
    await scrollTo(viewport(canvasElement), 300);
    await expect(where()).toEqual(before);
    // It is not part of the scrolling region.
    await expect(canvas.getByRole("region", { name: "Log" })).not.toContainElement(pill);
  },
};

export const KeyboardScrollsTheRegion: Story = {
  render: () => (
    <>
      <div style={{ blockSize: 160, inlineSize: 320 }}>
        <ScrollArea label="Release notes">{lines(40)}</ScrollArea>
      </div>
      <div style={{ blockSize: 160, inlineSize: 320 }}>
        <ScrollArea label="Short note">{lines(1)}</ScrollArea>
      </div>
      <Button>After</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Release notes" });
    // The scrolling region is a named tab stop, so a keyboard can scroll it.
    await waitFor(() => expect(region).toHaveAttribute("tabindex", "0"));
    await userEvent.tab();
    await expect(region).toHaveFocus();
    // One with nothing to scroll is named but is not a tab stop.
    await expect(canvas.getByRole("region", { name: "Short note" })).not.toHaveAttribute("tabindex");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    // The browser's own keys scroll the focused region (real key presses: synthetic ones scroll nothing).
    region.focus();
    if (!(await pressKey("PageDown"))) return;
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(50), { timeout: 3000 });
    await pressKey("End");
    await waitFor(() => expect(atEnd(region)).toBe(true), { timeout: 3000 });
    const end = region.scrollTop;
    await pressKey("PageUp");
    await waitFor(() => expect(region.scrollTop).toBeLessThan(end - 50), { timeout: 3000 });
  },
};

export const WithoutALabelItIsNotARegion: Story = {
  render: () => (
    <div style={{ blockSize: 120, inlineSize: 320 }}>
      <ScrollArea data-testid="area">
        <Stack gap="1">
          {Array.from({ length: 12 }, (_, i) => (
            <Button key={`b-${i + 1}`}>{`Item ${i + 1}`}</Button>
          ))}
        </Stack>
      </ScrollArea>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Its content is focusable, so the area itself needs no tab stop; focus scrolls it.
    await expect(canvas.queryByRole("region")).toBeNull();
    await expect(viewport(canvasElement)).not.toHaveAttribute("tabindex");
    for (let i = 0; i < 12; i++) await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Item 12" })).toHaveFocus();
    await expect(viewport(canvasElement).scrollTop).toBeGreaterThan(0);
  },
};

const wide = <div style={{ inlineSize: 900, blockSize: 400 }}>Wide and tall</div>;

export const DirectionPicksTheAxes: Story = {
  render: () => (
    <>
      {(["vertical", "horizontal", "both"] as const).map((direction) => (
        <div key={direction} style={{ blockSize: 120, inlineSize: 300 }}>
          <ScrollArea label={direction} direction={direction}>
            {wide}
          </ScrollArea>
        </div>
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    const style = (name: string) => getComputedStyle(canvas.getByRole("region", { name }));
    await expect([style("vertical").overflowX, style("vertical").overflowY]).toEqual(["hidden", "auto"]);
    await expect([style("horizontal").overflowX, style("horizontal").overflowY]).toEqual(["auto", "hidden"]);
    await expect([style("both").overflowX, style("both").overflowY]).toEqual(["auto", "auto"]);
    const both = canvas.getByRole("region", { name: "both" });
    both.scrollLeft = 200;
    both.scrollTop = 100;
    await expect([both.scrollLeft, both.scrollTop]).toEqual([200, 100]);
    // A horizontal area with content wider than it is a tab stop, as a vertical one is.
    await waitFor(() =>
      expect(canvas.getByRole("region", { name: "horizontal" })).toHaveAttribute("tabindex", "0"),
    );
  },
};

/** An app shell column: the ScrollArea takes what the header and footer leave, and scrolls; the page does not. */
export const FillsItsParent: Story = {
  render: () => (
    <>
      <div style={{ blockSize: 200, inlineSize: 300 }} data-testid="box">
        <ScrollArea label="In a box" data-testid="boxed">
          {lines(30)}
        </ScrollArea>
      </div>
      <div style={{ blockSize: 240, display: "flex", flexDirection: "column" }} data-testid="column">
        <Badge>Header</Badge>
        <ScrollArea label="Body" data-testid="body">
          {lines(30)}
        </ScrollArea>
        <Badge>Footer</Badge>
      </div>
    </>
  ),
  play: async ({ canvas }) => {
    const boxed = canvas.getByTestId("boxed").getBoundingClientRect();
    await expect([boxed.width, boxed.height]).toEqual([300, 200]);
    const column = canvas.getByTestId("column");
    const footer = canvas.getByText("Footer").getBoundingClientRect();
    await expect(footer.bottom).toBeLessThanOrEqual(column.getBoundingClientRect().bottom + 0.5);
    await expect(column.scrollHeight).toBeLessThanOrEqual(column.clientHeight);
    const body = canvas.getByRole("region", { name: "Body" });
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  },
};

function Jump({ dir }: { dir?: "rtl" }) {
  const handle = useRef<ScrollAreaHandle>(null);
  const target = useRef<HTMLSpanElement>(null);
  const go = (align?: "start" | "center") =>
    handle.current?.scrollIntoView(target.current as HTMLElement, align ? { align } : undefined);
  return (
    <div dir={dir}>
      <Stack direction="row" gap="2">
        <Button size="sm" onClick={() => go()}>
          Nearest
        </Button>
        <Button size="sm" onClick={() => go("start")}>
          Start
        </Button>
        <Button size="sm" onClick={() => go("center")}>
          Centre
        </Button>
      </Stack>
      <div style={{ blockSize: 160, inlineSize: 300 }}>
        <ScrollArea label="Results" direction="both" handle={handle}>
          <div style={{ inlineSize: 1200, blockSize: 1200, paddingBlockStart: 700, paddingInlineStart: 800 }}>
            <span ref={target} style={{ display: "inline-block", inlineSize: 60, blockSize: 20 }}>
              Match
            </span>
          </div>
        </ScrollArea>
      </div>
      <div style={{ blockSize: 1600 }} />
    </div>
  );
}

const inView = (target: Element, area: Element) => {
  const [t, a] = [target.getBoundingClientRect(), area.getBoundingClientRect()];
  return (
    t.top >= a.top - 0.5 && t.bottom <= a.bottom + 0.5 && t.left >= a.left - 0.5 && t.right <= a.right + 0.5
  );
};

export const ScrollIntoViewMovesOnlyTheArea: Story = {
  render: () => <Jump />,
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Results" });
    const match = canvas.getByText("Match");
    const page = window.scrollY;
    await userEvent.click(canvas.getByRole("button", { name: "Nearest" }));
    await expect(inView(match, region)).toBe(true);
    // Nearest: the least scrolling, so the match sits at the bottom edge.
    await expect(region.getBoundingClientRect().bottom - match.getBoundingClientRect().bottom).toBeLessThan(
      20,
    );
    await expect(window.scrollY).toBe(page);
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await expect(match.getBoundingClientRect().top - region.getBoundingClientRect().top).toBeCloseTo(0, 0);
    await userEvent.click(canvas.getByRole("button", { name: "Centre" }));
    const [m, r] = [match.getBoundingClientRect(), region.getBoundingClientRect()];
    await expect(m.top + m.height / 2 - (r.top + region.clientHeight / 2)).toBeCloseTo(0, 0);
    await expect(window.scrollY).toBe(page);
  },
};

export const ScrollIntoViewInRtl: Story = {
  render: () => <Jump dir="rtl" />,
  play: async ({ canvas, userEvent }) => {
    const region = canvas.getByRole("region", { name: "Results" });
    const match = canvas.getByText("Match");
    await expect(inView(match, region)).toBe(false);
    await userEvent.click(canvas.getByRole("button", { name: "Nearest" }));
    await expect(inView(match, region)).toBe(true);
    await expect(region.scrollLeft).toBeLessThan(0);
  },
};

export const ReportsScrolling: Story = {
  play: async ({ canvasElement, args }) => {
    await scrollTo(viewport(canvasElement), 80);
    await waitFor(() => expect(args.onScroll).toHaveBeenCalled());
    const event = (args.onScroll as ReturnType<typeof fn>).mock.calls[0]?.[0] as { target: unknown };
    await expect(event.target).toBe(viewport(canvasElement));
  },
};

export const StableUnderHostileHost: Story = {
  args: { overlay: <Badge>New</Badge> },
  play: async ({ canvasElement }) => {
    const parts: [string, string[]][] = [
      [".cy-scroll-area", ["display", "width", "height", "min-height", "box-sizing", "margin-top"]],
      [".cy-scroll-area-viewport", ["overflow-x", "overflow-y", "height", "padding-top", "box-sizing"]],
      [".cy-scroll-area-overlay", ["align-self", "justify-self", "margin-bottom", "z-index"]],
    ];
    for (const [selector, props] of parts) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

function ShadowFeed() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<Feed />);
  }, []);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowFeed />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector(".cy-scroll-area-viewport")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const el = viewport(root as unknown as Element);
    await waitFor(() => expect(atEnd(el)).toBe(true));
    await userEvent.click(root.querySelector("button") as HTMLElement);
    await waitFor(() => expect(root.textContent).toContain("Line 31"));
    await waitFor(() => expect(atEnd(el)).toBe(true));
    // Its styles reach it inside the shadow root.
    await expect(getComputedStyle(el).overflowY).toBe("auto");
  },
};

export const TouchTapsTheOverlayAndPans: Story = {
  tags: ["touch", "!dev"],
  render: () => <Feed />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const el = viewport(canvasElement);
    await waitFor(() => expect(atEnd(el)).toBe(true));
    // A finger pans the area (the browser's own scrolling, nothing in the way).
    await expect(getComputedStyle(el).touchAction).toBe("auto");
    await scrollTo(el, 0);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Add a line" }) });
    const pill = await canvas.findByRole("button", { name: "1 new" });
    await expect(pill.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    await userEvent.pointer({ keys: "[TouchA]", target: pill });
    await waitFor(() => expect(atEnd(el)).toBe(true));
  },
};
