import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, waitFor } from "storybook/test";
import { bell, gitBranch, warning } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { StatusBar, StatusBarSegment } from "./StatusBar.js";

const TONES = ["accent", "neutral", "danger", "success", "warning", "info"] as const;

const start = (
  <>
    <StatusBarSegment
      variant="solid"
      tone="accent"
      dot
      dotTone="success"
      dotLabel="Connected"
      popover={<Button size="sm">New connection</Button>}
      popoverLabel="Connections"
    >
      main-db
    </StatusBarSegment>
    <StatusBarSegment icon={gitBranch} mono>
      feature/status-bar
    </StatusBarSegment>
    <StatusBarSegment variant="soft" tone="accent" mono onClick={() => {}}>
      public
    </StatusBarSegment>
  </>
);
const end = (
  <>
    <StatusBarSegment mono>Ln 12, Col 4</StatusBarSegment>
    <StatusBarSegment tone="warning" icon={warning} onClick={() => {}}>
      2 warnings
    </StatusBarSegment>
    <StatusBarSegment icon={bell} label="3 notifications" onClick={() => {}}>
      3
    </StatusBarSegment>
  </>
);

const meta = {
  title: "Components/StatusBar",
  component: StatusBar,
  args: { label: "Status", start, end },
  argTypes: {
    label: { control: "text" },
    start: { control: false },
    end: { control: false },
    className: { control: "text" },
  },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ paddingBlockStart: 220 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBar>;
export default meta;
type Story = StoryObj<typeof meta>;

const isOpen = (el: Element | null) => !!el?.matches(":popover-open");
const settledClosed = (el: Element) =>
  waitFor(() => {
    expect(isOpen(el)).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const box = (el: Element) => el.getBoundingClientRect();

export const StartAndEndClusters: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("toolbar", { name: "Status" });
    await expect(bar).toHaveAttribute("aria-orientation", "horizontal");
    const connection = canvas.getByRole("button", { name: "Connected main-db" });
    const position = canvas.getByText("Ln 12, Col 4");
    const notifications = canvas.getByRole("button", { name: "3 notifications" });
    // Start segments sit at the start edge, end segments at the end edge.
    await expect(box(connection).left).toBeCloseTo(box(bar).left, 0);
    await expect(box(notifications).right).toBeCloseTo(box(bar).right, 0);
    await expect(box(position).left).toBeGreaterThan(box(canvas.getByText("public")).right);
    // A fixed-height bar, and every segment fills its height (below the top border).
    await expect(box(bar).height).toBe(28);
    for (const segment of [connection, notifications, canvas.getByText("2 warnings").closest("button")])
      await expect(box(segment as Element).bottom).toBeCloseTo(box(bar).bottom, 0);
    const label = position.closest(".cy-status-bar-segment") as HTMLElement;
    await expect(box(label).height).toBeCloseTo(box(bar).height - 1, 0);
    // A solid segment is filled with its tone; a plain one is not filled.
    await expect(getComputedStyle(connection).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(label).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  },
};

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <StatusBar
      label="Status"
      start={
        <>
          <StatusBarSegment onClick={() => setCount((c) => c + 1)}>{`Pressed ${count}`}</StatusBarSegment>
          <StatusBarSegment onClick={() => setCount((c) => c + 10)} disabled>
            Offline
          </StatusBarSegment>
        </>
      }
    />
  );
}

export const PressingCallsOnClick: Story = {
  render: () => <Counter />,
  play: async ({ canvas, userEvent }) => {
    const pressed = canvas.getByRole("button", { name: "Pressed 0" });
    // A Button of size xs: dense, yet still 24px to press.
    await expect(pressed).toHaveAttribute("data-size", "xs");
    const hit = getComputedStyle(pressed, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(24);
    await expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(24);
    await userEvent.click(pressed);
    await expect(canvas.getByRole("button", { name: "Pressed 1" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Pressed 3" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Offline" }));
    await expect(canvas.getByRole("button", { name: "Pressed 3" })).toBeVisible();
  },
};

export const DotTones: Story = {
  tags: ["visual"],
  args: {
    start: (
      <>
        {TONES.map((tone) => (
          <StatusBarSegment key={tone} dot dotTone={tone}>
            {tone}
          </StatusBarSegment>
        ))}
      </>
    ),
    end: (
      <StatusBarSegment dot="live" tone="danger" dotLabel="Recording">
        00:42
      </StatusBarSegment>
    ),
  },
  play: async ({ canvas }) => {
    const dotOf = (text: string) =>
      (canvas.getByText(text).closest(".cy-status-bar-segment") as HTMLElement).querySelector(
        ".cy-badge-dot",
      ) as HTMLElement;
    // The dot is a Badge dot in its own tone: every tone a different colour, the text left in the bar's ink.
    const colours = TONES.map((tone) => getComputedStyle(dotOf(tone)).backgroundColor);
    await expect(new Set(colours).size).toBe(TONES.length);
    await expect(getComputedStyle(canvas.getByText("success")).color).toBe(
      getComputedStyle(canvas.getByText("danger")).color,
    );
    // Without dotLabel the dot is decoration (the text says the state); with it, the dot is a named image.
    await expect(dotOf("success").closest(".cy-badge")).toHaveAttribute("aria-hidden", "true");
    await expect(dotOf("success").closest(".cy-badge")).not.toHaveAttribute("role");
    await expect(canvas.queryAllByRole("img")).toHaveLength(1);
    const recording = canvas.getByRole("img", { name: "Recording" });
    await expect(getComputedStyle(recording.querySelector(".cy-badge-dot") as Element).animationName).toBe(
      "cy-badge-live",
    );
  },
};

export const LayoutPropsAndAnOpenPopover: Story = {
  args: {
    start: (
      <>
        <StatusBarSegment onClick={() => {}} className="pushed" style={{ marginInlineStart: 12 }}>
          spaced
        </StatusBarSegment>
        <StatusBarSegment popover={<p>Branch details</p>} defaultOpen>
          main
        </StatusBarSegment>
      </>
    ),
    end: null,
  },
  play: async ({ canvas, canvasElement }) => {
    // className and style reach a clickable segment's button, beside its own class.
    const spaced = canvas.getByRole("button", { name: "spaced" });
    await expect(spaced).toHaveClass("cy-status-bar-button", "pushed");
    await expect(getComputedStyle(spaced).marginInlineStart).toBe("12px");
    // A popover open from the start, named by nothing given (its text is not a string): open, with an empty name.
    const branch = canvas.getByRole("button", { name: "main" });
    await expect(branch).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector("[popover]:popover-open")).not.toBeNull(),
    );
  },
};

export const SoftTintToken: Story = {
  args: {
    start: (
      <>
        <StatusBarSegment variant="soft" tone="accent">
          static
        </StatusBarSegment>
        <StatusBarSegment variant="soft" tone="accent" onClick={() => {}}>
          clickable
        </StatusBarSegment>
      </>
    ),
    end: null,
  },
  play: async ({ canvas, canvasElement }) => {
    const fill = (text: string) =>
      getComputedStyle(canvas.getByText(text).closest(".cy-status-bar-segment, button") as Element)
        .backgroundColor;
    // A static and a clickable soft segment share one tint, read from the bar's own token.
    await expect(fill("static")).toBe(fill("clickable"));
    const before = fill("static");
    const bar = canvasElement.querySelector(".cy-status-bar") as HTMLElement;
    bar.style.setProperty("--cy-status-bar-soft-mix", "60%");
    await expect(fill("static")).not.toBe(before);
    // The button's fill eases to its new colour.
    await waitFor(() => expect(fill("clickable")).toBe(fill("static")));
    // Button's own token does not reach either: the bar's look is set through its own tokens.
    bar.style.setProperty("--cy-button-soft-mix", "5%");
    await pause(300);
    await expect(fill("static")).toBe(fill("clickable"));
    // Back to the theme's tint, which keeps the text readable.
    bar.style.removeProperty("--cy-status-bar-soft-mix");
    bar.style.removeProperty("--cy-button-soft-mix");
    await waitFor(() => expect(fill("clickable")).toBe(before));
  },
};

export const MonospaceText: Story = {
  args: {
    start: (
      <>
        <StatusBarSegment mono>Ln 12, Col 4</StatusBarSegment>
        <StatusBarSegment>UTF-8</StatusBarSegment>
        <StatusBarSegment mono onClick={() => {}}>
          v2.4.1
        </StatusBarSegment>
      </>
    ),
    end: null,
  },
  play: async ({ canvas }) => {
    const family = (text: string) => getComputedStyle(canvas.getByText(text)).fontFamily;
    await expect(family("Ln 12, Col 4")).toMatch(/monospace/);
    await expect(family("v2.4.1")).toMatch(/monospace/);
    await expect(family("UTF-8")).not.toMatch(/monospace/);
  },
};

export const PopoverOpensUpward: Story = {
  args: {
    start: (
      <StatusBarSegment
        dot
        dotTone="success"
        popover={
          <>
            <Button size="sm">Production</Button>
            <Button size="sm">Staging</Button>
          </>
        }
        popoverLabel="Switch connection"
        label="main-db, switch connection"
      >
        main-db
      </StatusBarSegment>
    ),
    end: <StatusBarSegment>Ready</StatusBarSegment>,
  },
  render: (args) => (
    <>
      <StatusBar {...args} />
      <p data-testid="outside">Outside</p>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const segment = canvas.getByRole("button", { name: "main-db, switch connection" });
    await expect(segment).toHaveAttribute("aria-expanded", "false");
    await expect(segment).toHaveAttribute("aria-haspopup", "dialog");
    // Pointer: the panel opens above the segment, focus moves in, and a click outside closes it.
    await userEvent.click(segment);
    const panel = await canvas.findByRole("dialog", { name: "Switch connection" });
    await shownFully(panel);
    await expect(segment).toHaveAttribute("aria-expanded", "true");
    await expect(segment).toHaveAttribute("aria-controls", panel.id);
    await expect(box(panel).bottom).toBeLessThanOrEqual(box(segment).top);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Production" })).toHaveFocus());
    await userEvent.click(canvas.getByTestId("outside"));
    await settledClosed(panel);
    await expect(segment).toHaveAttribute("aria-expanded", "false");
    // Keyboard: Enter opens, Escape closes and focus returns to the segment.
    segment.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(isOpen(panel)).toBe(true));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Production" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(panel);
    await expect(segment).toHaveFocus();
    // Pressing the segment again while open closes it.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(isOpen(panel)).toBe(true));
    await userEvent.click(segment);
    await settledClosed(panel);
  },
};

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open from elsewhere</Button>
      <StatusBar
        label="Status"
        start={
          <StatusBarSegment
            open={open}
            onOpenChange={setOpen}
            popover={<p>Schemas</p>}
            popoverLabel="Schemas"
          >
            public
          </StatusBarSegment>
        }
      />
      <output data-testid="state">{open ? "open" : "closed"}</output>
    </>
  );
}

export const ControlledPopover: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    // Another control (a menu command, a second segment) opens the segment's popover.
    await userEvent.click(canvas.getByRole("button", { name: "Open from elsewhere" }));
    const panel = await canvas.findByRole("dialog", { name: "Schemas" });
    await waitFor(() => expect(isOpen(panel)).toBe(true));
    await expect(canvas.getByRole("button", { name: "public" })).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await settledClosed(panel);
    await expect(canvas.getByTestId("state")).toHaveTextContent("closed");
  },
};

export const ArrowsMoveBetweenClickableSegments: Story = {
  render: (args) => (
    <>
      <Button>Before</Button>
      <StatusBar
        {...args}
        start={
          <>
            <StatusBarSegment onClick={() => {}}>Branch</StatusBarSegment>
            <StatusBarSegment>Read only</StatusBarSegment>
            <StatusBarSegment onClick={() => {}} disabled>
              Sync
            </StatusBarSegment>
            <StatusBarSegment popover={<p>Schemas</p>} popoverLabel="Schemas">
              Schema
            </StatusBarSegment>
          </>
        }
        end={<StatusBarSegment onClick={() => {}}>Problems</StatusBarSegment>}
      />
      <Button>After</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const branch = canvas.getByRole("button", { name: "Branch" });
    const schema = canvas.getByRole("button", { name: "Schema" });
    const problems = canvas.getByRole("button", { name: "Problems" });
    // One Tab stop for the whole bar.
    await userEvent.click(canvas.getByRole("button", { name: "Before" }));
    await userEvent.tab();
    await expect(branch).toHaveFocus();
    // Arrows skip the status-only and disabled segments, cross from start to end, and wrap.
    await userEvent.keyboard("{ArrowRight}");
    await expect(schema).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(problems).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(branch).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(problems).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(branch).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(problems).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    // Coming back lands on the segment last used.
    await userEvent.tab({ shift: true });
    await expect(problems).toHaveFocus();
    // Arrow keys inside an open popover belong to it, not to the bar.
    schema.focus();
    await userEvent.keyboard("{Enter}");
    const panel = await canvas.findByRole("dialog", { name: "Schemas" });
    await waitFor(() => expect(isOpen(panel)).toBe(true));
    await userEvent.keyboard("{ArrowRight}");
    await expect(problems).not.toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await settledClosed(panel);
    await expect(schema).toHaveFocus();
  },
};

const LONG = "postgres://analytics-replica-eu-west-1.internal:5432/warehouse";

export const LongTextShowsInFullInATooltip: Story = {
  args: {
    style: { "--cy-status-bar-segment-max-width": "14ch" } as React.CSSProperties,
    start: (
      <>
        <StatusBarSegment mono data-testid="long">
          {LONG}
        </StatusBarSegment>
        <StatusBarSegment data-testid="short">Ready</StatusBarSegment>
      </>
    ),
    end: (
      <StatusBarSegment onClick={() => {}} data-testid="long-button">
        {`${LONG} (button)`}
      </StatusBarSegment>
    ),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const doc = canvasElement.ownerDocument;
    const tips = () => [...doc.querySelectorAll<HTMLElement>(".cy-tooltip")];
    const openTip = () => tips().find(isOpen);
    const long = canvas.getByTestId("long");
    const text = long.querySelector(".cy-status-bar-segment-text") as HTMLElement;
    // The text is cut with an ellipsis at the token's width…
    await expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    // …and the full text shows in a tooltip on hover (no title attribute).
    await expect(long).not.toHaveAttribute("title");
    await userEvent.hover(long);
    await waitFor(() => expect(openTip()).toHaveTextContent(LONG));
    await shownFully(openTip() as HTMLElement);
    await userEvent.unhover(long);
    await waitFor(() => expect(openTip()).toBeUndefined());
    // Text that fits has no tooltip.
    await userEvent.hover(canvas.getByTestId("short"));
    await pause(500);
    await expect(openTip()).toBeUndefined();
    await expect(canvas.getByTestId("short")).not.toHaveAttribute("aria-describedby");
    // A clickable segment cut short shows it on keyboard focus too, and keeps its full text as its name.
    const button = canvas.getByTestId("long-button");
    await expect(button).toHaveAccessibleName(`${LONG} (button)`);
    button.focus();
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(openTip()).toHaveTextContent(`${LONG} (button)`));
    await shownFully(openTip() as HTMLElement);
  },
};

export const TouchHitArea: Story = {
  tags: ["touch", "!dev"],
  args: {
    start: (
      <StatusBarSegment popover={<p>Schemas</p>} popoverLabel="Schemas">
        public
      </StatusBarSegment>
    ),
    end: <StatusBarSegment onClick={() => {}}>Problems</StatusBarSegment>,
  },
  play: async ({ canvas, userEvent }) => {
    const segment = canvas.getByRole("button", { name: "public" });
    const problems = canvas.getByRole("button", { name: "Problems" });
    // The bar stays dense; the hit area of each clickable segment reaches 44px on a coarse pointer.
    for (const el of [segment, problems]) {
      const hit = getComputedStyle(el, "::before");
      await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
      await expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(44);
    }
    await expect(box(canvas.getByRole("toolbar")).height).toBe(28);
    // A tap opens the popover; it never opens a tooltip.
    await userEvent.pointer({ keys: "[TouchA]", target: segment });
    const panel = await canvas.findByRole("dialog", { name: "Schemas" });
    await shownFully(panel);
    await userEvent.pointer({ keys: "[TouchA]", target: segment });
    await settledClosed(panel);
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <StatusBar
        {...args}
        start={
          <>
            <StatusBarSegment onClick={() => {}}>First</StatusBarSegment>
            <StatusBarSegment onClick={() => {}}>Second</StatusBarSegment>
          </>
        }
        end={<StatusBarSegment onClick={() => {}}>Last</StatusBarSegment>}
      />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole("toolbar");
    const first = canvas.getByRole("button", { name: "First" });
    const second = canvas.getByRole("button", { name: "Second" });
    const last = canvas.getByRole("button", { name: "Last" });
    // The start cluster is on the right, the end cluster on the left.
    await expect(box(first).right).toBeCloseTo(box(bar).right, 0);
    await expect(box(last).left).toBeCloseTo(box(bar).left, 0);
    await expect(box(second).right).toBeLessThanOrEqual(box(first).left);
    // Arrows follow the reading direction.
    first.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(second).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(last).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(second).toHaveFocus();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "height", "font-size", "font-weight", "box-sizing", "background-color", "gap"];
    const bar = computeUnderHostileHost(canvasElement, ".cy-status-bar", [...props, "border-top-width"]);
    await expect(bar.hostile).toEqual(bar.clean);
    const segment = computeUnderHostileHost(canvasElement, ".cy-status-bar-segment", [
      ...props,
      "color",
      "padding-left",
      "text-transform",
      "letter-spacing",
    ]);
    await expect(segment.hostile).toEqual(segment.clean);
    const text = computeUnderHostileHost(canvasElement, ".cy-status-bar-segment-text", [
      "font-size",
      "font-weight",
      "font-family",
      "line-height",
      "color",
      "text-transform",
      "letter-spacing",
    ]);
    await expect(text.hostile).toEqual(text.clean);
    const button = computeUnderHostileHost(canvasElement, ".cy-status-bar-button", [
      ...props,
      "padding-left",
      "border-top-width",
      "border-radius",
    ]);
    await expect(button.hostile).toEqual(button.clean);
  },
};

function ShadowStatusBar() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    mount.style.paddingBlockStart = "200px";
    root.append(mount);
    createRoot(mount).render(
      <StatusBar
        label="Shadow"
        start={
          <>
            <StatusBarSegment onClick={() => {}}>Branch</StatusBarSegment>
            <StatusBarSegment popover={<Button size="sm">Inside</Button>} popoverLabel="Schemas">
              Schema
            </StatusBarSegment>
          </>
        }
      />,
    );
  }, []);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowStatusBar />,
  decorators: [],
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const [branch, schema] = [...root.querySelectorAll<HTMLElement>(".cy-status-bar-button")];
    branch?.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(root.activeElement).toBe(schema);
    await userEvent.keyboard("{Enter}");
    const panel = root.querySelector('[role="dialog"]') as HTMLElement;
    await waitFor(() => expect(isOpen(panel)).toBe(true));
    await waitFor(() => expect(root.activeElement?.textContent).toBe("Inside"));
    await userEvent.keyboard("{Escape}");
    await settledClosed(panel);
    await expect(root.activeElement).toBe(schema);
  },
};
