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
