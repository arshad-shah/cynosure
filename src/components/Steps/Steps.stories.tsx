import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Stack } from "../Stack/Stack.js";
import { type StepItem, Steps } from "./Steps.js";

const STEPS: StepItem[] = [
  { id: "account", label: "Account", description: "Email and password" },
  { id: "workspace", label: "Workspace" },
  { id: "invite", label: "Invite team" },
  { id: "done", label: "Done" },
];

const meta = {
  title: "Components/Steps",
  component: Steps,
  args: { steps: STEPS, current: "invite", orientation: "horizontal", size: "md" },
  argTypes: {
    current: { control: "select", options: STEPS.map((s) => s.id) },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof Steps>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const markers = (el: Element) => [...el.querySelectorAll(".cy-steps-marker")] as HTMLElement[];
const lines = (el: Element) => [...el.querySelectorAll(".cy-steps-line")] as HTMLElement[];

export const ShowsWhereThePersonIs: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const list = canvas.getByRole("list", { name: "Progress" });
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(4);
    // Each step says its state; the current one is marked for assistive technology.
    await expect(items[0]).toHaveTextContent("Account");
    await expect(items[0]).toHaveTextContent(", completed");
    await expect(items[1]).toHaveTextContent(", completed");
    await expect(items[2]).toHaveTextContent(", current step");
    await expect(items[3]).toHaveTextContent(", not started");
    await expect(list.querySelector('[aria-current="step"]')).toHaveTextContent("Invite team");
    await expect(list.querySelectorAll("[aria-current]")).toHaveLength(1);
    // Read-only: nothing to press.
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
    // Done steps show a tick, others their number.
    const [one, two, three, four] = markers(canvasElement);
    await expect(one?.querySelector("svg")).not.toBeNull();
    await expect(two?.querySelector("svg")).not.toBeNull();
    await expect(three).toHaveTextContent("3");
    await expect(four).toHaveTextContent("4");
  },
};

export const LinesJoinTheMarkers: Story = {
  play: async ({ canvasElement }) => {
    const ms = markers(canvasElement).map(box);
    const ls = lines(canvasElement);
    // No line after the last step.
    await expect(ls).toHaveLength(3);
    for (const [i, line] of ls.entries()) {
      const b = box(line);
      const from = ms[i] as DOMRect;
      const to = ms[i + 1] as DOMRect;
      // Between this marker and the next, at the markers' middle height.
      await expect(b.left).toBeGreaterThan(from.right);
      await expect(b.right).toBeLessThan(to.left);
      await expect(Math.abs(b.top + b.height / 2 - (from.top + from.height / 2))).toBeLessThan(1);
    }
    // Lines out of finished steps take the accent; the rest are plain.
    const colour = (el: Element) => getComputedStyle(el).backgroundColor;
    await expect(colour(ls[0] as Element)).toBe(colour(ls[1] as Element));
    await expect(colour(ls[1] as Element)).not.toBe(colour(ls[2] as Element));
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const ms = markers(canvasElement).map(box);
    // Stacked, in one column.
    await expect((ms[1] as DOMRect).top).toBeGreaterThan((ms[0] as DOMRect).bottom);
    await expect(Math.abs((ms[1] as DOMRect).left - (ms[0] as DOMRect).left)).toBeLessThan(1);
    // The label sits beside its marker, the line runs down between markers.
    const label = box(canvasElement.querySelector(".cy-steps-label") as Element);
    await expect(label.left).toBeGreaterThan((ms[0] as DOMRect).right);
    // Every step has a visible line to the next, with or without a description.
    for (const [i, el] of lines(canvasElement).entries()) {
      const line = box(el);
      await expect(line.top).toBeGreaterThan((ms[i] as DOMRect).bottom);
      await expect(line.bottom).toBeLessThan((ms[i + 1] as DOMRect).top);
      await expect(line.height).toBeGreaterThanOrEqual(8);
      await expect(line.width).toBeLessThan(line.height);
    }
  },
};

export const ChoosingAStep: Story = {
  args: {
    onStepSelect: fn(),
    steps: [...STEPS.slice(0, 3), { id: "done", label: "Done", disabled: true }],
  },
  play: async ({ args, canvas, userEvent }) => {
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(4);
    const account = canvas.getByRole("button", { name: /^Account/ });
    await userEvent.click(account);
    await expect(args.onStepSelect).toHaveBeenLastCalledWith("account");
    // The current step is not a destination; a disabled step cannot be chosen.
    const invite = canvas.getByRole("button", { name: /^Invite team/ });
    await expect(invite).toHaveAttribute("aria-current", "step");
    await userEvent.click(invite);
    const done = canvas.getByRole("button", { name: /^Done/ });
    await expect(done).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(done);
    await expect(args.onStepSelect).toHaveBeenCalledTimes(1);
    // Keyboard: Tab moves between steps, Enter and Space choose.
    account.focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: /^Workspace/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onStepSelect).toHaveBeenLastCalledWith("workspace");
    await userEvent.tab({ shift: true });
    await expect(account).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(args.onStepSelect).toHaveBeenLastCalledWith("account");
    await expect(args.onStepSelect).toHaveBeenCalledTimes(3);
    // Big enough to hit with a mouse.
    for (const button of buttons) {
      await expect(box(button).height).toBeGreaterThanOrEqual(24);
      await expect(box(button).width).toBeGreaterThanOrEqual(24);
    }
  },
};

export const GoingBackUpdatesTheSteps: Story = {
  render: (args) => {
    function Wizard() {
      const [current, setCurrent] = useState("invite");
      return <Steps {...args} current={current} onStepSelect={setCurrent} />;
    }
    return <Wizard />;
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Workspace/ }));
    const workspace = canvas.getByRole("button", { name: /^Workspace/ });
    await expect(workspace).toHaveAttribute("aria-current", "step");
    await expect(workspace).toHaveTextContent(", current step");
    await expect(canvas.getByRole("button", { name: /^Invite team/ })).toHaveTextContent(", not started");
  },
};

export const TouchTargets: Story = {
  tags: ["touch", "!dev"],
  args: { onStepSelect: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const done = canvas.getByRole("button", { name: /^Done/ });
    await expect(box(done).height).toBeGreaterThanOrEqual(44);
    await expect(box(done).width).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: done });
    await expect(args.onStepSelect).toHaveBeenCalledWith("done");
  },
};

export const ErrorsAndOverrides: Story = {
  args: {
    current: "workspace",
    steps: [
      { id: "account", label: "Account", status: "error" },
      { id: "workspace", label: "Workspace" },
      { id: "invite", label: "Invite team", status: "complete" },
      { id: "done", label: "Done" },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    const items = canvas.getAllByRole("listitem");
    await expect(items[0]).toHaveTextContent(", has a problem");
    await expect(items[0]).toHaveAttribute("data-status", "error");
    // A later step can be marked done out of order.
    await expect(items[2]).toHaveTextContent(", completed");
    // The problem marker uses the danger colour, not the accent.
    const [problem, current] = markers(canvasElement);
    await expect(getComputedStyle(problem as Element).borderTopColor).not.toBe(
      getComputedStyle(current as Element).borderTopColor,
    );
  },
};

export const LabelsOverride: Story = {
  args: {
    labels: {
      list: "Fortschritt",
      complete: "erledigt",
      current: "aktueller Schritt",
      upcoming: "offen",
      error: "Fehler",
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "Fortschritt" })).toBeVisible();
    const items = canvas.getAllByRole("listitem");
    await expect(items[0]).toHaveTextContent(", erledigt");
    await expect(items[2]).toHaveTextContent(", aktueller Schritt");
    await expect(items[3]).toHaveTextContent(", offen");
  },
};

export const FollowsTheTextDirection: Story = {
  render: (args) => (
    <div dir="rtl">
      <Steps {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [first, second] = markers(canvasElement).map(box);
    await expect(first?.left).toBeGreaterThan(second?.right as number);
    const line = box(lines(canvasElement)[0] as Element);
    await expect(line.right).toBeLessThan(first?.left as number);
    await expect(line.left).toBeGreaterThan(second?.right as number);
  },
};

export const ReadableInLightAndDark: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface" style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <Steps {...args} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const page = getComputedStyle(surface).backgroundColor;
      for (const label of surface.querySelectorAll(".cy-steps-label")) {
        await expect(contrast(getComputedStyle(label).color, page)).toBeGreaterThanOrEqual(4.5);
      }
      for (const marker of markers(surface)) {
        const s = getComputedStyle(marker);
        const fill = s.backgroundColor;
        // The number or tick reads against the marker; the marker stands out from the page.
        await expect(contrast(s.color, fill)).toBeGreaterThanOrEqual(4.5);
        await expect(contrast(s.borderTopColor, page)).toBeGreaterThanOrEqual(3);
      }
    }
  },
};

export const DefaultsAndBadInput: Story = {
  render: () => (
    <Stack gap="6">
      <Steps steps={STEPS} current="nowhere" className="unknown" />
      <Steps steps={[]} current="none" className="empty" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const unknown = canvasElement.querySelector(".unknown") as HTMLElement;
    await expect(unknown).toHaveAttribute("data-orientation", "horizontal");
    await expect(unknown).toHaveAttribute("data-size", "md");
    // An unknown current step: nothing is current or done.
    await expect(unknown.querySelectorAll('[data-status="upcoming"]')).toHaveLength(4);
    await expect(unknown.querySelector("[aria-current]")).toBeNull();
    await expect((canvasElement.querySelector(".empty") as HTMLElement).children).toHaveLength(0);
  },
};

export const StableUnderHostileHost: Story = {
  args: { onStepSelect: fn() },
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "height",
      "width",
      "font-size",
      "box-sizing",
      "color",
      "padding-left",
      "list-style-type",
    ];
    for (const selector of [".cy-steps", ".cy-steps-step", ".cy-steps-marker", ".cy-steps-label"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const NumberedHowTo: Story = {
  args: {
    current: undefined,
    orientation: "vertical",
    steps: [
      { id: "install", label: "Install the app", description: "From Google Play or the App Store" },
      { id: "open", label: "Open it", description: "Allow location for prayer times" },
      { id: "pick", label: "Pick your city" },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    // Steps to follow, not progress: the list is named "Steps", nothing is current and no status is read.
    const list = canvas.getByRole("list", { name: "Steps" });
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    await expect(list.querySelectorAll("[aria-current]")).toHaveLength(0);
    for (const item of items) {
      await expect(item).not.toHaveTextContent("not started");
      await expect(item).not.toHaveTextContent("completed");
    }
    // Every marker is a number, styled alike and readable (not the muted "upcoming" look).
    const all = markers(canvasElement);
    await expect(all.map((m) => m.textContent)).toEqual(["1", "2", "3"]);
    const colours = new Set(all.map((m) => getComputedStyle(m).color));
    await expect(colours.size).toBe(1);
    const label = canvasElement.querySelector(".cy-steps-label") as HTMLElement;
    await expect(contrast(getComputedStyle(label).color, "rgb(251, 249, 245)")).toBeGreaterThanOrEqual(7);
    // Still read-only, and the list's name can be replaced.
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
  },
};

export const HowToWithAnOwnName: Story = {
  args: { current: undefined, labels: { list: "How to install" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "How to install" })).toBeInTheDocument();
  },
};
