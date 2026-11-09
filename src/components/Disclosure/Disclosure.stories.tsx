import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { createTheme } from "../../tokens/index.js";
import { Button } from "../Button/Button.js";
import { Link } from "../Link/Link.js";
import { Disclosure } from "./Disclosure.js";

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

export const TouchTarget: Story = {
  tags: ["touch"],
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
