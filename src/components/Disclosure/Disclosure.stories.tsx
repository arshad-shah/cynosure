import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { createTheme } from "../../tokens/index.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Link } from "../Link/Link.js";
import { Disclosure } from "./Disclosure.js";

const retry = fn();

const meta = {
  title: "Components/Disclosure",
  component: Disclosure,
  args: {
    summary: "Advanced options",
    variant: "plain",
    size: "md",
    onOpenChange: fn(),
    children: (
      <p style={{ margin: 0 }}>
        Indentation, key sorting and <Link href="#help">formatting help</Link>.
      </p>
    ),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "line", "card"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    summary: { control: "text" },
    edge: { control: "text" },
  },
} satisfies Meta<typeof Disclosure>;
export default meta;
type Story = StoryObj<typeof meta>;

const content = (el: HTMLElement) =>
  document.getElementById(el.getAttribute("aria-controls") as string) as HTMLElement;

export const TogglesWithClickEnterAndSpace: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Advanced options" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(content(trigger)).toBeTruthy();
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(canvas.getByRole("link", { name: "formatting help" })).toBeVisible());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard(" ");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const ClosedContentIsUnreachable: Story = {
  render: (args) => (
    <>
      <Disclosure {...args} />
      <Button>After</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Advanced options" });
    await waitFor(() => expect(content(trigger)).not.toBeVisible());
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.tab();
    // The link inside the closed panel is skipped.
    await expect(canvas.getByRole("button", { name: "After" })).toHaveFocus();
    await expect(Math.round(content(trigger).getBoundingClientRect().height)).toBe(0);
  },
};

export const OpenByDefaultAndControlled: Story = {
  render: () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Disclosure summary="Details" open={open} onOpenChange={setOpen}>
            Controlled content
          </Disclosure>
          <Button onClick={() => setOpen(false)}>Collapse from outside</Button>
        </>
      );
    }
    return (
      <>
        <Disclosure summary="Starts open" defaultOpen>
          Visible at first
        </Disclosure>
        <Controlled />
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Starts open" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(canvas.getByText("Visible at first")).toBeVisible();
    const details = canvas.getByRole("button", { name: "Details" });
    await expect(details).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Collapse from outside" }));
    await expect(details).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(canvas.getByText("Controlled content")).not.toBeVisible());
  },
};

export const HeightAnimatesAndRespectsReducedMotion: Story = {
  render: (args) => (
    <>
      <Disclosure {...args} summary="Animated" />
      <CynosureTheme theme={createTheme({ motion: "reduced" })}>
        <Disclosure {...args} summary="Still" />
      </CynosureTheme>
    </>
  ),
  play: async ({ canvas }) => {
    const animated = content(canvas.getByRole("button", { name: "Animated" }));
    const still = content(canvas.getByRole("button", { name: "Still" }));
    await expect(getComputedStyle(animated).transitionProperty).toContain("grid-template-rows");
    await expect(Number.parseFloat(getComputedStyle(animated).transitionDuration)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(still).transitionDuration)).toBe(0);
  },
};

export const ChevronTurnsWhenOpen: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Advanced options" });
    const chevron = trigger.querySelector(".cy-disclosure-chevron") as HTMLElement;
    const closed = getComputedStyle(chevron).rotate;
    await userEvent.click(trigger);
    await waitFor(() => expect(getComputedStyle(chevron).rotate).not.toBe(closed));
  },
};

export const Variants: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Disclosure {...args} variant="plain" summary="Plain" data-testid="plain" />
      <Disclosure {...args} variant="line" summary="Line" data-testid="line" />
      <Disclosure {...args} variant="card" summary="Card" defaultOpen data-testid="card" />
    </div>
  ),
  play: async ({ canvas }) => {
    const style = (id: string) => getComputedStyle(canvas.getByTestId(id));
    await expect(style("plain").borderBottomStyle).toBe("none");
    await expect(style("line").borderBottomStyle).toBe("solid");
    await expect(style("card").borderTopStyle).toBe("solid");
    await expect(style("card").backgroundColor).not.toBe(style("plain").backgroundColor);
  },
};

/** The colour `value` resolves to on `el`. */
function resolvedColor(el: Element, value: string): string {
  const probe = document.createElement("i");
  probe.style.color = value;
  el.append(probe);
  const out = getComputedStyle(probe).color;
  probe.remove();
  return out;
}

export const EdgeShowsAToneOrAnyColour: Story = {
  tags: ["visual"],
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Disclosure {...args} variant="plain" edge="danger" summary="Plain danger" data-testid="plain" />
      <Disclosure {...args} variant="line" edge="success" summary="Line success" data-testid="line" />
      <Disclosure
        {...args}
        variant="card"
        edge="warning"
        summary="Card warning"
        defaultOpen
        data-testid="card"
      />
      <Disclosure {...args} variant="card" edge="teal" summary="Card teal" data-testid="custom" />
      <div dir="rtl">
        <Disclosure {...args} variant="card" edge="accent" summary="RTL accent" data-testid="rtl" />
      </div>
      <div style={{ "--cy-disclosure-edge-width": "7px" } as CSSProperties}>
        <Disclosure {...args} edge="neutral" summary="Wide neutral" data-testid="wide" />
      </div>
      <Disclosure {...args} variant="card" summary="No edge" data-testid="none" />
    </div>
  ),
  play: async ({ canvas }) => {
    const el = (id: string) => canvas.getByTestId(id);
    const style = (id: string) => getComputedStyle(el(id));
    const edgeWidth = (id: string) => Number.parseFloat(style(id).borderLeftWidth);
    // Each edge is on the inline start in its colour: a tone's colour token, or the colour given.
    for (const [id, colour] of [
      ["plain", "var(--cy-color-danger)"],
      ["line", "var(--cy-color-success)"],
      ["card", "var(--cy-color-warning)"],
      ["custom", "teal"],
      ["wide", "var(--cy-color-ink)"],
    ] as const) {
      await expect({ id, colour: style(id).borderLeftColor }).toEqual({
        id,
        colour: resolvedColor(el(id), colour),
      });
      await expect({ id, solid: style(id).borderLeftStyle }).toEqual({ id, solid: "solid" });
    }
    // Thicker than an ordinary border, and the width is a token.
    await expect(edgeWidth("card")).toBeGreaterThan(Number.parseFloat(style("card").borderTopWidth));
    await expect(edgeWidth("wide")).toBe(7);
    // Only the start side changes: the card's other sides are those of a card without an edge.
    await expect(style("card").borderTopColor).toBe(style("none").borderTopColor);
    await expect(style("card").borderRightWidth).toBe(style("none").borderRightWidth);
    await expect(style("none").borderLeftWidth).toBe(style("none").borderRightWidth);
    await expect(el("none")).not.toHaveAttribute("data-edge");
    // Right-to-left: the edge is on the right.
    await expect(Number.parseFloat(style("rtl").borderRightWidth)).toBe(edgeWidth("card"));
    await expect(style("rtl").borderRightColor).toBe(resolvedColor(el("rtl"), "var(--cy-color-accent)"));
    // Plain and line keep the summary and the content clear of the edge.
    for (const id of ["plain", "line", "wide"]) {
      const edgeEnd = el(id).getBoundingClientRect().left + edgeWidth(id);
      const summary = (el(id).querySelector(".cy-disclosure-summary") as Element).getBoundingClientRect();
      await expect({ id, clear: summary.left - edgeEnd >= 8 }).toEqual({ id, clear: true });
    }
    // Opening still works; the edge adds no element.
    await expect(canvas.getAllByRole("button")).toHaveLength(7);
    // Host CSS cannot remove it.
    const { clean, hostile } = computeUnderHostileHost(
      canvas.getByTestId("card").parentElement as Element,
      '[data-testid="card"]',
      ["border-left-width", "border-left-color", "border-left-style"],
    );
    await expect(hostile).toEqual(clean);
  },
};

export const SummaryEndSitsOutsideTheTrigger: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Disclosure
        {...args}
        summary="Tool call: run_query"
        trailing={<Badge tone="success">Done</Badge>}
        data-testid="badge"
      />
      <Disclosure
        {...args}
        variant="card"
        headingLevel={3}
        summary="A long summary that has to give way to what sits at the end of its row"
        trailing={
          <Button size="sm" onClick={retry}>
            Retry
          </Button>
        }
        data-testid="button"
      />
      <div dir="rtl">
        <Disclosure {...args} summary="RTL" trailing={<Badge>3</Badge>} data-testid="rtl" />
      </div>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    retry.mockClear();
    const root = (id: string) => canvas.getByTestId(id);
    const box = (id: string, selector: string) =>
      (root(id).querySelector(selector) as Element).getBoundingClientRect();
    const trigger = canvas.getByRole("button", { name: "Tool call: run_query" });
    const badge = canvas.getByText("Done");
    // Not part of the trigger: its text is not in the button's name and it is not inside it.
    await expect(trigger.contains(badge)).toBe(false);
    await expect(trigger).toHaveAccessibleName("Tool call: run_query");
    // On the summary's row, after the summary and before the chevron.
    const b = badge.getBoundingClientRect();
    await expect(b.left).toBeGreaterThan(box("badge", ".cy-disclosure-summary").right);
    await expect(b.right).toBeLessThanOrEqual(box("badge", ".cy-disclosure-chevron").left);
    const t = trigger.getBoundingClientRect();
    await expect(Math.abs(b.top + b.height / 2 - (t.top + t.height / 2))).toBeLessThan(1);
    // A badge is part of the row: a press on it reaches the trigger, which opens and closes the section.
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) as HTMLElement;
    await expect(trigger.contains(hit)).toBe(true);
    await userEvent.click(hit);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(hit);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    // A button there is its own target, after the trigger in the tab order, and does not toggle.
    const heading = canvas.getByRole("heading", { level: 3 });
    const long = within(heading).getByRole("button");
    const retryButton = canvas.getByRole("button", { name: "Retry" });
    await expect(heading.contains(retryButton)).toBe(false);
    await userEvent.click(retryButton);
    await expect(retry).toHaveBeenCalledTimes(1);
    await expect(long).toHaveAttribute("aria-expanded", "false");
    long.focus();
    await userEvent.tab();
    await expect(retryButton).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(retry).toHaveBeenCalledTimes(2);
    await expect(long).toHaveAttribute("aria-expanded", "false");
    long.focus();
    await userEvent.keyboard("{Enter}");
    await expect(long).toHaveAttribute("aria-expanded", "true");
    // A long summary wraps before the end slot instead of running under it.
    await expect(box("button", ".cy-disclosure-summary").right).toBeLessThanOrEqual(
      retryButton.getBoundingClientRect().left,
    );
    // Right-to-left: the slot sits left of the summary, the chevron left of the slot.
    const r = box("rtl", ".cy-disclosure-trailing");
    await expect(r.right).toBeLessThan(box("rtl", ".cy-disclosure-summary").left);
    await expect(r.left).toBeGreaterThanOrEqual(box("rtl", ".cy-disclosure-chevron").right);
    // Host CSS cannot move it.
    const { clean, hostile } = computeUnderHostileHost(root("badge"), ".cy-disclosure-trailing", [
      "display",
      "align-items",
      "pointer-events",
      "z-index",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const TouchTarget: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Advanced options" });
    await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: trigger });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const TouchTargetWithASummaryEnd: Story = {
  tags: ["touch", "!dev"],
  args: { trailing: <Badge>3</Badge> },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Advanced options" });
    await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: trigger });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const props = [
      "height",
      "font-size",
      "font-weight",
      "padding-left",
      "background-color",
      "color",
      "text-align",
    ];
    const trigger = computeUnderHostileHost(canvasElement, ".cy-disclosure-trigger", props);
    await expect(trigger.hostile).toEqual(trigger.clean);
  },
};

export const FocusRingClearsTheText: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Disclosure {...args} variant="line" summary="Line" />
      <Disclosure {...args} variant="card" summary="Card" />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    // Without inner padding (plain, line) the ring sits outside the trigger; cards clip, so theirs is inset.
    await userEvent.tab();
    const line = canvas.getByRole("button", { name: "Line" });
    await expect(line).toHaveFocus();
    await expect(getComputedStyle(line).boxShadow).not.toContain("inset");
    await expect(Number.parseFloat(getComputedStyle(line).borderTopLeftRadius)).toBeGreaterThan(0);
    await expect(Number.parseFloat(getComputedStyle(line).outlineOffset)).toBeGreaterThan(0);
    await userEvent.tab();
    const card = canvas.getByRole("button", { name: "Card" });
    await expect(card).toHaveFocus();
    await expect(getComputedStyle(card).boxShadow).toContain("inset");
  },
};
