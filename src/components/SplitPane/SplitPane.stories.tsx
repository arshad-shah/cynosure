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
    unit: { control: "inline-radio", options: ["percent", "px"] },
    anchor: { control: "inline-radio", options: ["start", "end"] },
    collapsible: { control: "boolean" },
    collapsed: { control: "boolean" },
    defaultCollapsed: { control: "boolean" },
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
    // Shift+arrows and Page keys take big steps, as on every slider.
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    await expect(divider).toHaveAttribute("aria-valuenow", "10");
    await userEvent.keyboard("{PageUp}");
    await expect(divider).toHaveAttribute("aria-valuenow", "60");
    await userEvent.keyboard("{PageDown}{ArrowRight>7/}");
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
          isPrimary: true,
          ...extra,
        }),
      );
    // A right-button press does not start a drag; moving without a press does nothing.
    fire("pointerdown", { button: 2, ...at(0.5) });
    fire("pointermove", at(0.3));
    await expect(divider).toHaveAttribute("aria-valuenow", "50");
    await expect(root(canvasElement)).not.toHaveAttribute("data-dragging");
    // A cancelled drag (the browser took the gesture) goes back where it began and stops following the pointer.
    fire("pointerdown", { button: 0, ...at(0.5) });
    fire("pointermove", at(0.7));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "70"));
    fire("pointercancel", {});
    fire("pointermove", at(0.3));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "50"));
    // So does Escape.
    fire("pointerdown", { button: 0, ...at(0.5) });
    fire("pointermove", at(0.3));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "30"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "50"));
    await expect(root(canvasElement)).not.toHaveAttribute("data-dragging");
  },
};

export const SizedInPixels: Story = {
  args: { unit: "px", defaultSize: 200, min: 160, max: 320, step: 20 },
  decorators: [(Story) => <div style={{ inlineSize: 600, blockSize: 200 }}>{Story()}</div>],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    const start = startPane(canvasElement);
    await expect(divider).toHaveAttribute("aria-valuetext", "200 pixels");
    await expect(start.getBoundingClientRect().width).toBeCloseTo(
      200 - divider.getBoundingClientRect().width / 2,
      0,
    );
    divider.focus();
    await userEvent.keyboard("{ArrowRight}{End}");
    await expect(divider).toHaveAttribute("aria-valuenow", "320");
    // Dragging follows the pointer in pixels.
    const box = root(canvasElement).getBoundingClientRect();
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 6,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    const d = divider.getBoundingClientRect();
    divider.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: d.left + 2, clientY: d.top + 10 }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: box.left + 180, clientY: d.top + 10 }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", { ...init, buttons: 0, clientX: box.left + 180, clientY: d.top + 10 }),
    );
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "180"));
  },
};

export const PixelDefaults: Story = {
  args: { unit: "px", defaultSize: undefined },
  decorators: [(Story) => <div style={{ inlineSize: 800, blockSize: 200 }}>{Story()}</div>],
  play: async ({ canvas, userEvent }) => {
    const divider = canvas.getByRole("separator");
    // 240 wide, between 120 and 600, 16 per arrow key.
    await expect(divider).toHaveAttribute("aria-valuenow", "240");
    await expect(divider).toHaveAttribute("aria-valuemin", "120");
    await expect(divider).toHaveAttribute("aria-valuemax", "600");
    divider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "256");
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

const endPane = (el: Element) => el.querySelector('[data-pane="end"]') as HTMLElement;

export const ToggledFromAButton: Story = {
  args: { unit: "px", defaultSize: 200, onCollapsedChange: fn() },
  render: (args) => {
    function Shell() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <>
          <Button onClick={() => setCollapsed((c) => !c)}>Toggle sidebar</Button>
          <SplitPane
            {...args}
            collapsed={collapsed}
            onCollapsedChange={(next) => {
              args.onCollapsedChange?.(next);
              setCollapsed(next);
            }}
          />
        </>
      );
    }
    return <Shell />;
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    // Collapsible because the collapse is controlled: the divider's range starts at 0.
    await expect(divider).toHaveAttribute("aria-valuemin", "0");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle sidebar" }));
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await expect(divider).toHaveAttribute("aria-valuetext", "0 pixels");
    await expect(startPane(canvasElement)).toHaveAttribute("data-collapsed");
    await expect(canvas.queryByText("Files")).not.toBeVisible();
    await expect(box(startPane(canvasElement)).width).toBe(0);
    // The size is remembered, not reported as 0.
    await expect(args.onSizeChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Toggle sidebar" }));
    await expect(divider).toHaveAttribute("aria-valuenow", "200");
    await expect(canvas.getByText("Files")).toBeVisible();
    // Enter on the divider (APG window splitter) asks the parent too.
    divider.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(true);
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await userEvent.keyboard("{Enter}");
    await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(false);
    await expect(divider).toHaveAttribute("aria-valuenow", "200");
    // The button's own toggles do not call onCollapsedChange: the parent made them.
    await expect(args.onCollapsedChange).toHaveBeenCalledTimes(2);
  },
};

export const StartsCollapsed: Story = {
  args: { defaultCollapsed: true, defaultSize: 30, onCollapsedChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await expect(startPane(canvasElement)).toHaveAttribute("data-collapsed");
    divider.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(false);
    await expect(divider).toHaveAttribute("aria-valuenow", "30");
    await expect(share(canvasElement)).toBeCloseTo(0.3, 1);
  },
};

export const ExpandFromCollapsed: Story = {
  args: { collapsible: true, defaultCollapsed: true, defaultSize: 40, min: 20, onCollapsedChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    divider.focus();
    // A key that would shrink it, or Home, leaves it collapsed.
    await userEvent.keyboard("{ArrowLeft}{Home}");
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    await expect(args.onCollapsedChange).not.toHaveBeenCalled();
    // A key that grows it opens it from 0: at min.
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onCollapsedChange).toHaveBeenLastCalledWith(false);
    await expect(divider).toHaveAttribute("aria-valuenow", "20");
    // Dragging a collapsed divider opens the pane where the pointer is; Escape puts it back collapsed.
    await userEvent.keyboard("{Enter}");
    await expect(divider).toHaveAttribute("aria-valuenow", "0");
    const area = box(root(canvasElement));
    const y = area.top + 20;
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: divider, coords: { clientX: area.left + 1, clientY: y } },
      {
        pointerName: "mouse",
        target: divider,
        coords: { clientX: area.left + area.width * 0.6, clientY: y },
      },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "60"));
    await expect(startPane(canvasElement)).not.toHaveAttribute("data-collapsed");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "0"));
    await expect(startPane(canvasElement)).toHaveAttribute("data-collapsed");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: divider });
    // Restoring brings back the size from before the collapse, not the cancelled drag's.
    await userEvent.keyboard("{Enter}");
    await expect(divider).toHaveAttribute("aria-valuenow", "20");
  },
};

export const ResizeEndsOnce: Story = {
  args: { onResizeEnd: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    const area = box(root(canvasElement));
    const y = area.top + 20;
    const at = (f: number) => ({ clientX: area.left + area.width * f, clientY: y });
    // A drag through several points reports every size, but ends once, with the last.
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: divider, coords: at(0.5) },
      { pointerName: "mouse", target: divider, coords: at(0.4) },
      { pointerName: "mouse", target: divider, coords: at(0.3) },
      { pointerName: "mouse", target: divider, coords: at(0.35) },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "35"));
    await expect(args.onSizeChange).toHaveBeenCalledTimes(3);
    await expect(args.onResizeEnd).not.toHaveBeenCalled();
    await userEvent.pointer({ keys: "[/MouseLeft]", target: divider });
    await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(35);
    // A press that does not move, and a cancelled drag, change nothing to save.
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: divider, coords: at(0.35) },
      { keys: "[/MouseLeft]", target: divider },
    ]);
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: divider, coords: at(0.35) },
      { pointerName: "mouse", target: divider, coords: at(0.6) },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "60"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "35"));
    await userEvent.pointer({ keys: "[/MouseLeft]", target: divider });
    await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
    // Holding an arrow key repeats the move; letting go ends it once.
    divider.focus();
    await userEvent.keyboard("{ArrowRight>4/}");
    await expect(divider).toHaveAttribute("aria-valuenow", "55");
    await expect(args.onResizeEnd).toHaveBeenCalledTimes(2);
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(55);
    await userEvent.keyboard("{End}");
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(90);
    // A key at the limit, and a key that is not a move, end nothing.
    await userEvent.keyboard("{ArrowRight}{a}");
    await expect(args.onResizeEnd).toHaveBeenCalledTimes(3);
  },
};

export const TouchResizeEndsOnce: Story = {
  tags: ["touch", "!dev"],
  args: { onResizeEnd: fn(), unit: "px", anchor: "end", defaultSize: 200, min: 100, max: 400 },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    const area = box(root(canvasElement));
    const y = area.top + 40;
    await userEvent.pointer([
      { keys: "[TouchA>]", target: divider, coords: { clientX: area.right - 200, clientY: y } },
      { pointerName: "TouchA", target: divider, coords: { clientX: area.right - 260, clientY: y } },
      { pointerName: "TouchA", target: divider, coords: { clientX: area.right - 300, clientY: y } },
      { keys: "[/TouchA]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "300"));
    await expect(args.onResizeEnd).toHaveBeenCalledTimes(1);
    await expect(args.onResizeEnd).toHaveBeenLastCalledWith(300);
  },
};

export const AnchoredToTheEnd: Story = {
  args: {
    unit: "px",
    anchor: "end",
    defaultSize: 200,
    min: 120,
    max: 400,
    step: 20,
    label: "Resize the inspector",
  },
  decorators: [
    (Story) => (
      <div data-testid="frame" style={{ inlineSize: 400, blockSize: 200 }}>
        {Story()}
      </div>
    ),
  ],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator", { name: "Resize the inspector" });
    const end = endPane(canvasElement);
    const half = box(divider).width / 2;
    // The pixel size belongs to the end pane, and the divider controls it.
    await expect(document.getElementById(divider.getAttribute("aria-controls") as string)).toBe(end);
    await expect(box(end).width).toBeCloseTo(200 - half, 0);
    // A wider window grows the start pane; the end pane keeps its pixels.
    canvas.getByTestId("frame").style.inlineSize = "560px";
    await waitFor(() => expect(box(startPane(canvasElement)).width).toBeCloseTo(360 - half, 0));
    await expect(box(end).width).toBeCloseTo(200 - half, 0);
    // The arrows move the divider: Left moves it towards the start, growing the end pane.
    divider.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "220");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "180");
    await userEvent.keyboard("{End}");
    await expect(divider).toHaveAttribute("aria-valuenow", "400");
    // Dragging measures from the end edge.
    const area = box(root(canvasElement));
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: divider,
        coords: { clientX: area.right - 400, clientY: area.top + 20 },
      },
      {
        pointerName: "mouse",
        target: divider,
        coords: { clientX: area.right - 250, clientY: area.top + 20 },
      },
      { keys: "[/MouseLeft]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "250"));
    await expect(box(end).width).toBeCloseTo(250 - half, 0);
  },
};

export const ABottomDock: Story = {
  args: {
    orientation: "vertical",
    unit: "px",
    anchor: "end",
    defaultSize: 100,
    min: 60,
    max: 240,
    step: 20,
    collapsible: true,
    start: pane("Editor"),
    end: pane("Results"),
    label: "Resize the results",
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    const end = endPane(canvasElement);
    await expect(box(end).height).toBeCloseTo(100 - box(divider).height / 2, 0);
    await expect(box(end).top).toBeGreaterThan(box(startPane(canvasElement)).top);
    divider.focus();
    // Up moves the divider up, so the dock grows.
    await userEvent.keyboard("{ArrowUp}");
    await expect(divider).toHaveAttribute("aria-valuenow", "120");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(divider).toHaveAttribute("aria-valuenow", "80");
    // Enter collapses the dock, not the editor.
    await userEvent.keyboard("{Enter}");
    await expect(end).toHaveAttribute("data-collapsed");
    await expect(startPane(canvasElement)).not.toHaveAttribute("data-collapsed");
    await expect(box(end).height).toBe(0);
    await expect(canvas.getByText("Editor")).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(divider).toHaveAttribute("aria-valuenow", "80");
    const area = box(root(canvasElement));
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: divider,
        coords: { clientX: area.left + 20, clientY: area.bottom - 80 },
      },
      {
        pointerName: "mouse",
        target: divider,
        coords: { clientX: area.left + 20, clientY: area.bottom - 150 },
      },
      { keys: "[/MouseLeft]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "150"));
  },
};

export const AnchoredToTheEndRightToLeft: Story = {
  args: { unit: "px", anchor: "end", defaultSize: 200, min: 120, max: 400, step: 20 },
  decorators: [(Story) => <div dir="rtl">{Story()}</div>],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const divider = canvas.getByRole("separator");
    const end = endPane(canvasElement);
    // The end pane is on the left, and keeps the pixels.
    await expect(box(end).right).toBeLessThan(box(divider).right);
    await expect(box(end).width).toBeCloseTo(200 - box(divider).width / 2, 0);
    divider.focus();
    // Right moves the divider away from the end pane, so it grows.
    await userEvent.keyboard("{ArrowRight}");
    await expect(divider).toHaveAttribute("aria-valuenow", "220");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(divider).toHaveAttribute("aria-valuenow", "180");
    const area = box(root(canvasElement));
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: divider, coords: { clientX: area.left + 180, clientY: area.top + 20 } },
      { pointerName: "mouse", target: divider, coords: { clientX: area.left + 300, clientY: area.top + 20 } },
      { keys: "[/MouseLeft]", target: divider },
    ]);
    await waitFor(() => expect(divider).toHaveAttribute("aria-valuenow", "300"));
  },
};

export const AnchoredStableUnderHostileHost: Story = {
  args: { unit: "px", anchor: "end", defaultSize: 200, defaultCollapsed: true },
  play: async ({ canvasElement }) => {
    const props = ["display", "grid-template-columns", "width", "visibility"];
    for (const selector of [".cy-split-pane", '[data-pane="end"]']) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
