import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { ROOT_ATTRIBUTES, rootAttributesStory } from "../../test/root-attributes.js";
import { Button } from "../Button/Button.js";
import { CanvasStage } from "./CanvasStage.js";

const meta = {
  title: "Components/Structure/CanvasStage",
  component: CanvasStage,
  args: { label: "Animation", ratio: 16 / 9, onFiles: fn(), onReject: fn(), accept: ".riv" },
  argTypes: {
    ratio: { control: "number" },
    accept: { control: "text" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ inlineSize: 400 }}>{Story()}</div>],
  render: (args) => (
    <CanvasStage {...args}>
      <canvas data-testid="surface" />
    </CanvasStage>
  ),
} satisfies Meta<typeof CanvasStage>;
export default meta;
type Story = StoryObj<typeof meta>;

const stageOf = (el: Element) => el.querySelector(".cy-canvas-stage") as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();
function drag(target: Element, files: File[], type = "drop") {
  const data = new DataTransfer();
  for (const f of files) data.items.add(f);
  const fire = (t: string) =>
    target.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: data }));
  fire("dragenter");
  fire("dragover");
  return () => fire(type);
}
const riv = new File(["x"], "hero.riv", { type: "" });
const png = new File(["x"], "photo.png", { type: "image/png" });

export const ASizedStageForACanvas: Story = {
  play: async ({ canvas, canvasElement }) => {
    const stage = canvas.getByRole("group", { name: "Animation" });
    await expect(stage).toBe(stageOf(canvasElement));
    // 400 wide at 16:9.
    await expect(box(stage).width).toBeCloseTo(400, 0);
    await expect(box(stage).height).toBeCloseTo(225, 0);
    // The product's canvas fills it.
    const surface = canvas.getByTestId("surface");
    await waitFor(() => expect(box(surface).width).toBeCloseTo(box(stage).width - 2 * stage.clientLeft, 0));
    await expect(box(surface).height).toBeCloseTo(box(stage).height - 2 * stage.clientTop, 0);
  },
};

export const OverlayIsCentred: Story = {
  render: (args) => {
    function Player() {
      const [opened, setOpened] = useState(false);
      return (
        <CanvasStage
          {...args}
          overlay={opened ? undefined : <Button onClick={() => setOpened(true)}>Open a file</Button>}
        >
          <canvas data-testid="surface" />
        </CanvasStage>
      );
    }
    return <Player />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const stage = box(stageOf(canvasElement));
    const button = canvas.getByRole("button", { name: "Open a file" });
    const b = box(button);
    // In the middle of the stage, and it takes presses.
    await expect(b.left + b.width / 2).toBeCloseTo(stage.left + stage.width / 2, 0);
    await expect(b.top + b.height / 2).toBeCloseTo(stage.top + stage.height / 2, 0);
    // Around it, presses reach the canvas.
    await expect(document.elementFromPoint(stage.left + 10, stage.top + 10)).toBe(
      canvas.getByTestId("surface"),
    );
    await userEvent.click(button);
    await expect(canvas.queryByRole("button", { name: "Open a file" })).toBeNull();
  },
};

export const DropAFileOnTheStage: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    const stage = stageOf(canvasElement);
    const drop = drag(canvas.getByTestId("surface"), [riv]);
    // While a file is over it, the stage says what a drop does.
    await waitFor(() => expect(stage).toHaveAttribute("data-over"));
    await expect(canvas.getByText("Drop to open")).toBeVisible();
    drop();
    await expect(args.onFiles).toHaveBeenCalledWith([riv]);
    await waitFor(() => expect(stage).not.toHaveAttribute("data-over"));
    await expect(canvas.queryByText("Drop to open")).toBeNull();
  },
};

export const FilesItDoesNotTakeAreTurnedAway: Story = {
  play: async ({ args, canvas }) => {
    drag(canvas.getByTestId("surface"), [png, riv])();
    // One file at a time unless `multiple`; the wrong type is turned away.
    await expect(args.onFiles).toHaveBeenCalledWith([riv]);
    await expect(args.onReject).toHaveBeenCalledWith([png]);
  },
};

export const MultipleTakesEveryFileOfAnyType: Story = {
  args: { multiple: true, accept: undefined, ratio: undefined, className: "product-stage" },
  play: async ({ args, canvas, canvasElement }) => {
    const stage = stageOf(canvasElement);
    // Without a ratio the stage sizes to its content; the product's class sits beside Cynosure's.
    await expect(stage).not.toHaveAttribute("data-ratio");
    await expect(stage).toHaveClass("cy-canvas-stage", "product-stage");
    drag(canvas.getByTestId("surface"), [png, riv])();
    // With `multiple` and no `accept`, every dropped file is taken and none turned away.
    await expect(args.onFiles).toHaveBeenCalledWith([png, riv]);
    await expect(args.onReject).not.toHaveBeenCalled();
  },
};

export const OnlyWrongFilesCallsOnlyOnReject: Story = {
  play: async ({ args, canvas }) => {
    drag(canvas.getByTestId("surface"), [png])();
    await expect(args.onReject).toHaveBeenCalledWith([png]);
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};

export const CrossingAChildKeepsTheDropHint: Story = {
  play: async ({ canvas, canvasElement }) => {
    const stage = stageOf(canvasElement);
    const surface = canvas.getByTestId("surface");
    const data = new DataTransfer();
    data.items.add(riv);
    const fire = (target: Element, type: string) =>
      target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
    // Entering the stage, then its canvas, then leaving the stage's own edge for the canvas: still over the stage.
    fire(stage, "dragenter");
    fire(surface, "dragenter");
    fire(stage, "dragleave");
    await waitFor(() => expect(stage).toHaveAttribute("data-over"));
    // Leaving the canvas for outside ends it.
    fire(surface, "dragleave");
    await waitFor(() => expect(stage).not.toHaveAttribute("data-over"));
  },
};

export const DragOverTheOverlayEndsWhenItLeaves: Story = {
  render: (args) => (
    <CanvasStage {...args} overlay={<Button>Open a file</Button>}>
      <canvas data-testid="surface" />
    </CanvasStage>
  ),
  play: async ({ canvas, canvasElement }) => {
    const stage = stageOf(canvasElement);
    const button = canvas.getByRole("button", { name: "Open a file" });
    const data = new DataTransfer();
    data.items.add(riv);
    const fire = (target: Element, type: string) =>
      target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
    // A file comes in over the overlay's button: the drop hint covers the stage.
    fire(button, "dragenter");
    await waitFor(() => expect(stage).toHaveAttribute("data-over"));
    const hint = (stage.querySelector("[data-drop]") as HTMLElement).firstElementChild as HTMLElement;
    // As the browser does, the hint now under the pointer is entered and the button left (a browser sends no
    // leave to an element taken out of the page).
    fire(hint, "dragenter");
    if (button.isConnected) fire(button, "dragleave");
    // Leaving the hint for outside the stage ends the drag: the hint goes and the overlay is back.
    fire(hint, "dragleave");
    await waitFor(() => expect(stage).not.toHaveAttribute("data-over"));
    await expect(canvas.queryByText("Drop to open")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Open a file" })).toBeVisible();
  },
};

export const TextDragsAndLeavingAreIgnored: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    const stage = stageOf(canvasElement);
    const data = new DataTransfer();
    data.setData("text/plain", "hello");
    const enter = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: data });
    canvas.getByTestId("surface").dispatchEvent(enter);
    await expect(enter.defaultPrevented).toBe(false);
    await expect(stage).not.toHaveAttribute("data-over");
    // Dragging text over the stage or dropping it there is not taken either.
    for (const type of ["dragover", "drop"]) {
      const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data });
      canvas.getByTestId("surface").dispatchEvent(event);
      await expect(event.defaultPrevented).toBe(false);
    }
    // A file dragged in and out again leaves nothing behind.
    drag(canvas.getByTestId("surface"), [riv], "dragleave")();
    await expect(stage).not.toHaveAttribute("data-over");
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};

export const NoDropWithoutOnFilesOrWhenDisabled: Story = {
  render: () => (
    <>
      <CanvasStage label="Plain" ratio={2}>
        <canvas data-testid="plain" />
      </CanvasStage>
      <CanvasStage label="Off" ratio={2} disabled onFiles={() => {}}>
        <canvas data-testid="off" />
      </CanvasStage>
    </>
  ),
  play: async ({ canvas }) => {
    for (const id of ["plain", "off"]) {
      const data = new DataTransfer();
      data.items.add(riv);
      const enter = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: data });
      canvas.getByTestId(id).dispatchEvent(enter);
      await expect(enter.defaultPrevented).toBe(false);
      await expect(canvas.getByTestId(id).closest(".cy-canvas-stage")).not.toHaveAttribute("data-over");
    }
  },
};

export const Labels: Story = {
  args: { labels: { drop: "Zum Öffnen ablegen" } },
  play: async ({ canvas }) => {
    drag(canvas.getByTestId("surface"), [riv]);
    await expect(await canvas.findByText("Zum Öffnen ablegen")).toBeVisible();
  },
};

export const ThemedThroughTokens: Story = {
  render: (args) => (
    <div
      style={{
        ["--cy-canvas-stage-background" as string]: "rgb(10, 20, 30)",
        ["--cy-canvas-stage-radius" as string]: "0px",
      }}
    >
      <CanvasStage {...args}>
        <canvas />
      </CanvasStage>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const s = getComputedStyle(stageOf(canvasElement));
    await expect(s.backgroundColor).toBe("rgb(10, 20, 30)");
    await expect(s.borderTopLeftRadius).toBe("0px");
  },
};

export const StableUnderHostileHost: Story = {
  args: { overlay: <Button>Open</Button> },
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-canvas-stage", ".cy-canvas-stage-overlay"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "width",
        "height",
        "font-size",
        "box-sizing",
        "position",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const PassesIdDataAndRef: Story = rootAttributesStory<HTMLDivElement>(
  (ref) => <CanvasStage ref={ref} label="Stage" {...ROOT_ATTRIBUTES} />,
  "cy-canvas-stage",
);
