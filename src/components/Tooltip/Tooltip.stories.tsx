import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, waitFor } from "storybook/test";
import { download } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Tooltip } from "./Tooltip.js";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  args: {
    content: "Download as JSON",
    placement: "top",
    delay: 120,
    children: (
      <Button icon={download} data-testid="trigger">
        Export
      </Button>
    ),
  },
  argTypes: {
    placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] },
    delay: { control: { type: "number", min: 0, max: 1500, step: 50 } },
    content: { control: "text" },
    className: { control: "text" },
    disabled: { control: "boolean" },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

const tooltip = (root: HTMLElement) => root.ownerDocument.querySelector(".cy-tooltip") as HTMLElement;
const isOpen = (el: HTMLElement) => el.matches(":popover-open");
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const HoverShowsAfterDelay: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByTestId("trigger");
    await userEvent.hover(trigger);
    await expect(isOpen(tooltip(canvasElement))).toBe(false);
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    await shownFully(tooltip(canvasElement));
    await expect(trigger).toHaveAccessibleDescription("Download as JSON");
    await userEvent.unhover(trigger);
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(false));
  },
};

export const FocusShowsAndEscapeHides: Story = {
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.tab();
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(false));
    await userEvent.tab();
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(false));
  },
};

export const IsHoverable: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.hover(canvas.getByTestId("trigger"));
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    await userEvent.hover(tooltip(canvasElement));
    await pause(250);
    await expect(isOpen(tooltip(canvasElement))).toBe(true);
    await userEvent.unhover(tooltip(canvasElement));
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(false));
  },
};

export const TouchDoesNotOpen: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByTestId("trigger") });
    await pause(250);
    await expect(isOpen(tooltip(canvasElement))).toBe(false);
  },
};

export const DisabledNeverOpens: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement, userEvent, step }) => {
    const trigger = canvas.getByTestId("trigger");
    await step("hover and keyboard focus open nothing, and nothing describes the trigger", async () => {
      await userEvent.hover(trigger);
      await pause(250);
      await expect(canvasElement.querySelector('[role="tooltip"]')).toBeNull();
      await userEvent.unhover(trigger);
      await userEvent.tab();
      await expect(trigger).toHaveFocus();
      await pause(50);
      await expect(canvasElement.querySelector('[role="tooltip"]')).toBeNull();
      await expect(trigger).not.toHaveAttribute("aria-describedby");
    });
    await expect(args.disabled).toBe(true);
  },
};

export const FlipsNearTheViewportEdge: Story = {
  args: { placement: "bottom" },
  render: (args) => (
    <div style={{ position: "fixed", insetInline: 0, bottom: 4, display: "flex", justifyContent: "center" }}>
      <Tooltip {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByTestId("trigger");
    await userEvent.hover(trigger);
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    await expect(tooltip(canvasElement).getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger.getBoundingClientRect().top,
    );
  },
};

export const FollowsTriggerOnScroll: Story = {
  render: (args) => (
    <div
      data-testid="scroller"
      style={{ height: 160, overflow: "auto", border: "1px solid var(--cy-color-line)" }}
    >
      <div style={{ height: 600, paddingTop: 120 }}>
        <Tooltip {...args} />
      </div>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    const before = tooltip(canvasElement).getBoundingClientRect().top;
    canvas.getByTestId("scroller").scrollTop = 40;
    await waitFor(() =>
      expect(tooltip(canvasElement).getBoundingClientRect().top).toBeCloseTo(before - 40, 0),
    );
  },
};

function ShadowTooltip() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <Tooltip content="Inside shadow" delay={0}>
        <Button>Shadow</Button>
      </Tooltip>,
    );
  }, []);
  return <div data-testid="host" ref={host} style={{ paddingTop: 120 }} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowTooltip />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const button = host.shadowRoot?.querySelector("button") as HTMLElement;
    const tip = host.shadowRoot?.querySelector(".cy-tooltip") as HTMLElement;
    await userEvent.hover(button);
    await waitFor(() => expect(tip.matches(":popover-open")).toBe(true));
    await expect(tip.getBoundingClientRect().bottom).toBeLessThanOrEqual(button.getBoundingClientRect().top);
    // Let the fade-in finish so the accessibility scan measures the final colours.
    await waitFor(() => expect(getComputedStyle(tip).opacity).toBe("1"));
  },
};

export const AnchorTakesALayoutClass: Story = {
  args: { className: "pushed" },
  render: (args) => (
    <div style={{ display: "flex" }}>
      <style>{".pushed { margin-inline-start: 24px; }"}</style>
      <Tooltip {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const anchor = canvas.getByTestId("trigger").parentElement as HTMLElement;
    await expect(anchor).toHaveClass("cy-tooltip-anchor", "pushed");
    await expect(getComputedStyle(anchor).marginInlineStart).toBe("24px");
  },
};

export const RepeatedTextShowsWithoutDescribing: Story = {
  args: { describe: false, content: "Export" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByTestId("trigger");
    // Text the name already holds (a label cut short) is for the eye: shown, but not read twice.
    await expect(trigger).not.toHaveAttribute("aria-describedby");
    await expect(tooltip(canvasElement)).toHaveAttribute("aria-hidden", "true");
    await userEvent.tab();
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    await shownFully(tooltip(canvasElement));
    await expect(trigger).not.toHaveAccessibleDescription();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(false));
  },
};

export const DisabledNeverShowsOrDescribes: Story = {
  args: { disabled: true, delay: 0 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByTestId("trigger");
    // Off (e.g. while the text it repeats is fully visible): no tip, no description; hover and focus do nothing.
    await expect(tooltip(canvasElement)).toBeNull();
    await expect(trigger).not.toHaveAttribute("aria-describedby");
    await userEvent.hover(trigger);
    await pause(150);
    await userEvent.tab();
    await pause(50);
    await expect(canvasElement.ownerDocument.querySelector(".cy-tooltip")).toBeNull();
    // The anchor is still there, so turning the tooltip on or off never remounts the trigger.
    await expect(trigger.parentElement).toHaveClass("cy-tooltip-anchor");
  },
};

const LONG_LABEL = "quarterly-revenue-by-region-and-channel.csv";

export const OnlyWhileTheTextIsCutShort: Story = {
  args: {
    content: LONG_LABEL,
    delay: 0,
    whenTruncated: (trigger) => trigger.querySelector<HTMLElement>("[data-testid='text']"),
  },
  render: (args) => (
    <div>
      <Tooltip {...args}>
        <Button data-testid="trigger">
          <span
            data-testid="text"
            style={{
              display: "block",
              inlineSize: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {LONG_LABEL}
          </span>
        </Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByTestId("trigger");
    const text = canvas.getByTestId("text");
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    // Cut short: focus shows the full text, for the eye only (the trigger's name already holds it).
    await userEvent.tab();
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
    await expect(tooltip(canvasElement)).toHaveAttribute("aria-hidden", "true");
    await expect(trigger).not.toHaveAttribute("aria-describedby");
    // Room for the whole text (a resize, no new render): the tip closes and stays off; the trigger is the same element.
    text.style.inlineSize = "600px";
    await waitFor(() => expect(canvasElement.ownerDocument.querySelector(".cy-tooltip")).toBeNull());
    await expect(canvas.getByTestId("trigger")).toBe(trigger);
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await pause(50);
    await expect(canvasElement.ownerDocument.querySelector(".cy-tooltip")).toBeNull();
    // Cut short again: it works again.
    text.style.inlineSize = "120px";
    await waitFor(() => expect(tooltip(canvasElement)).not.toBeNull());
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await waitFor(() => expect(isOpen(tooltip(canvasElement))).toBe(true));
  },
};

export const WhenTruncatedMeasuresTheTrigger: Story = {
  args: { content: "Export everything", delay: 0, whenTruncated: true },
  play: async ({ canvasElement, userEvent }) => {
    // `true` measures the trigger itself, which fits: no tip at all.
    await userEvent.tab();
    await pause(50);
    await expect(canvasElement.ownerDocument.querySelector(".cy-tooltip")).toBeNull();
  },
};
