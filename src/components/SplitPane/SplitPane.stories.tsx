import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { SplitPane } from "./SplitPane.js";

const pane = (text: string) => <div style={{ padding: 12 }}>{text}</div>;

const meta = {
  title: "Components/SplitPane",
  component: SplitPane,
  args: {
    label: "Resize the file list",
    start: pane("Files"),
    end: pane("Preview"),
    orientation: "horizontal",
    defaultSize: 50,
    onSizeChange: fn(),
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    collapsible: { control: "boolean" },
    start: { control: false },
    end: { control: false },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          inlineSize: 600,
          blockSize: 300,
          border: "var(--cy-border-width) solid var(--cy-color-line)",
        }}
      >
        {Story()}
      </div>
    ),
  ],
} satisfies Meta<typeof SplitPane>;
export default meta;
type Story = StoryObj<typeof meta>;

const box = (el: Element) => el.getBoundingClientRect();
const startPane = (el: Element) => el.querySelector('[data-pane="start"]') as HTMLElement;
const root = (el: Element) => el.querySelector(".cy-split-pane") as HTMLElement;
const share = (el: Element, vertical = false) =>
  vertical
    ? box(startPane(el)).height / box(root(el)).height
    : box(startPane(el)).width / box(root(el)).width;

export const AWindowSplitter: Story = {
  tags: ["visual"],
  play: async ({ canvas, canvasElement }) => {
    const divider = canvas.getByRole("separator", { name: "Resize the file list" });
    await expect(divider).toHaveAttribute("tabindex", "0");
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await expect(divider).toHaveAttribute("aria-valuemin", "10");
    await expect(divider).toHaveAttribute("aria-valuemax", "90");
    await expect(divider).toHaveAttribute("aria-valuetext", "50%");
    // Side-by-side panes: the divider line is vertical, and it controls the start pane.
    await expect(divider).toHaveAttribute("aria-orientation", "vertical");
    await expect(document.getElementById(divider.getAttribute("aria-controls") as string)).toBe(
      startPane(canvasElement),
    );
    await expect(share(canvasElement)).toBeCloseTo(0.5, 1);
  },
};

export const KeyboardResizes: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    await userEvent.tab();
    await expect(divider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "55");
    await expect(args.onSizeChange).toHaveBeenLastCalledWith(55);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "45");
    await expect(share(canvasElement)).toBeCloseTo(0.45, 1);
    await userEvent.keyboard("{End}");
    await expect(divider).toHaveAttribute("aria-valuenow", "90");
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "90");
    await userEvent.keyboard("{Home}");
    await expect(divider).toHaveAttribute("aria-valuenow", "10");
    // Other keys are left alone (Enter does nothing unless collapsible).
    await userEvent.keyboard("{Enter}");
    await expect(divider).toHaveAttribute("aria-valuenow", "10");
  },
};

export const DragWithThePointer: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    const area = box(root(canvasElement));
    const y = area.top + area.height / 2;
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: divider, coords: { clientX: area.left + area.width / 2, clientY: y } },
      {
        pointerName: "mouse",
        target: divider,
        coords: { clientX: area.left + area.width * 0.3, clientY: y },
      },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "30"));
    await expect(root(canvasElement)).toHaveAttribute("data-dragging");
    // Dragging past the limit stops at it.
    await userEvent.pointer({
      pointerName: "mouse",
      target: divider,
      coords: { clientX: area.left + 5, clientY: y },
    });
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "10"));
    await userEvent.pointer({ keys: "[/MouseLeft]", target: divider });
    await expect(root(canvasElement)).not.toHaveAttribute("data-dragging");
    // The divider keeps focus, so the keyboard can fine-tune.
    await expect(divider).toHaveFocus();
    // Its hit area is wider than the line.
    await expect(Number.parseFloat(getComputedStyle(divider, "::before").width)).toBeGreaterThanOrEqual(24);
  },
};

export const TouchDrag: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    await expect(Number.parseFloat(getComputedStyle(divider, "::before").width)).toBeGreaterThanOrEqual(44);
    const area = box(root(canvasElement));
    const y = area.top + 40;
    await userEvent.pointer([
      { keys: "[TouchA>]", target: divider, coords: { clientX: area.left + area.width / 2, clientY: y } },
      {
        pointerName: "TouchA",
        target: divider,
        coords: { clientX: area.left + area.width * 0.7, clientY: y },
      },
      { keys: "[/TouchA]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "70"));
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical", defaultSize: 40 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    await expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    await expect(share(canvasElement, true)).toBeCloseTo(0.4, 1);
    divider.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(divider).toHaveAttribute("aria-valuenow", "45");
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(divider).toHaveAttribute("aria-valuenow", "35");
    const area = box(root(canvasElement));
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: divider,
        coords: { clientX: area.left + 20, clientY: area.top + area.height * 0.35 },
      },
      {
        pointerName: "mouse",
        target: divider,
        coords: { clientX: area.left + 20, clientY: area.top + area.height * 0.6 },
      },
      { keys: "[/MouseLeft]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "60"));
  },
};

export const FollowsTheTextDirection: Story = {
  decorators: [(Story) => <div dir="rtl">{Story()}</div>],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    // The start pane is on the right; ArrowLeft makes it bigger.
    await expect(box(startPane(canvasElement)).left).toBeGreaterThan(box(divider).left);
    divider.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "55");
    const area = box(root(canvasElement));
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: divider,
        coords: { clientX: area.left + area.width / 2, clientY: area.top + 20 },
      },
      {
        pointerName: "mouse",
        target: divider,
        coords: { clientX: area.right - area.width * 0.25, clientY: area.top + 20 },
      },
      { keys: "[/MouseLeft]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "25"));
  },
};

export const CollapseAndRestore: Story = {
  args: { collapsible: true, defaultSize: 35 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    await expect(divider).toHaveAttribute("aria-valuemin", "0");
    divider.focus();
    await userEvent.keyboard("{Enter}");
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await expect(startPane(canvasElement)).toHaveAttribute("data-collapsed");
    await expect(canvas.queryByText("Files")).not.toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(divider).toHaveAttribute("aria-valuenow", "35");
    await expect(canvas.getByText("Files")).toBeVisible();
  },
};

export const Controlled: Story = {
  render: (args) => {
    function Panes() {
      const [size, setSize] = useState(25);
      return (
        <>
          <SplitPane {...args} size={size} onSizeChange={setSize} />
          <Button onClick={() => setSize(60)}>Wide list</Button>
        </>
      );
    }
    return <Panes />;
  },
  play: async ({ canvas, userEvent }) => {
    const divider = canvas.getByRole("separator");
    await expect(divider).toHaveAttribute("aria-valuenow", "25");
    divider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "30");
    await userEvent.click(canvas.getByRole("button", { name: "Wide list" }));
    await expect(divider).toHaveAttribute("aria-valuenow", "60");
  },
};

export const PointerEdgeCases: Story = {
  args: { min: 20, max: 80, step: 10, className: "host-split" },
  play: async ({ canvas, canvasElement }) => {
    const divider = canvas.getByRole("separator");
    await expect(root(canvasElement)).toHaveClass("host-split");
    const area = box(root(canvasElement));
    const at = (fraction: number) => ({ clientX: area.left + area.width * fraction, clientY: area.top + 20 });
    const fire = (type: string, extra: object) =>
      divider.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 9,
          pointerType: "mouse",
          ...extra,
        }),
      );
    // A right-button press does not start a drag; moving without a press does nothing.
    fire("pointerdown", { button: 2, ...at(0.5) });
    fire("pointermove", at(0.3));
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await expect(root(canvasElement)).not.toHaveAttribute("data-dragging");
    // A cancelled drag (the browser took the gesture) stops following the pointer.
    fire("pointerdown", { button: 0, ...at(0.5) });
    fire("pointermove", at(0.7));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "70"));
    fire("pointercancel", {});
    fire("pointermove", at(0.3));
    await expect(divider).toHaveAttribute("aria-valuenow", "70");
    await expect(root(canvasElement)).not.toHaveAttribute("data-dragging");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "grid-template-columns",
      "width",
      "height",
      "box-sizing",
      "background-color",
      "cursor",
    ];
    for (const selector of [".cy-split-pane", ".cy-split-pane-divider"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
