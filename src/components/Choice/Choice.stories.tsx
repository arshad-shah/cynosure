import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { ChoiceBase } from "../../foundations/ChoiceBase/ChoiceBase.js";
import { rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { settled } from "../../test/settle.js";
import { Choice, type ChoiceInput } from "./Choice.js";

/**
 * A control drawn by the story: the browser's own checkbox, shown. Real controls (Checkbox, Switch, RadioGroup) draw a
 * skin under a hidden ChoiceBase; the input is always a direct child of the control's element.
 */
const square = (input: ChoiceInput) => (
  <span
    data-testid="control"
    style={{ display: "inline-flex", flex: "none", blockSize: "1lh", alignItems: "center" }}
  >
    <ChoiceBase
      {...input}
      type="checkbox"
      style={{ position: "static", opacity: 1, appearance: "auto", inlineSize: "1em", blockSize: "1em" }}
    />
  </span>
);

const meta = {
  title: "Components/Choice",
  component: Choice,
  args: { label: "Show hidden files", control: square, onChange: fn(), size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    checked: { control: "boolean" },
    strikeWhenChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
    control: { control: false },
  },
} satisfies Meta<typeof Choice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LabelNamesAndTogglesTheControl: Story = {
  tags: ["visual"],
  args: { description: "Dotfiles and system folders." },
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Show hidden files" });
    await expect(box).toHaveAccessibleDescription("Dotfiles and system folders.");
    // Pointer on the label, on the description, then Space on the focused control.
    await userEvent.click(canvas.getByText("Show hidden files"));
    await expect(box).toBeChecked();
    await userEvent.click(canvas.getByText("Dotfiles and system folders."));
    await expect(box).not.toBeChecked();
    await expect(box).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenNthCalledWith(1, true);
    await expect(args.onChange).toHaveBeenNthCalledWith(2, false);
    await expect(args.onChange).toHaveBeenNthCalledWith(3, true);
  },
};

function Controlled({ onChange }: { onChange?: ((checked: boolean) => void) | undefined }) {
  const [on, setOn] = useState(true);
  return (
    <>
      <Choice
        label="Autosave"
        checked={on}
        onChange={(next) => {
          setOn(next);
          onChange?.(next);
        }}
        control={square}
      />
      <output data-testid="state">{on ? "on" : "off"}</output>
    </>
  );
}

export const ControlledAndUncontrolled: Story = {
  render: (args) => (
    <div style={{ display: "grid" }}>
      <Controlled onChange={args.onChange} />
      <Choice label="Starts on" defaultChecked control={square} />
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    const controlled = canvas.getByRole("checkbox", { name: "Autosave" });
    await expect(controlled).toBeChecked();
    await userEvent.click(canvas.getByText("Autosave"));
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
    await expect(canvas.getByTestId("state")).toHaveTextContent("off");
    await expect(controlled).not.toBeChecked();
    const uncontrolled = canvas.getByRole("checkbox", { name: "Starts on" });
    await expect(uncontrolled).toBeChecked();
    await userEvent.click(uncontrolled);
    await expect(uncontrolled).not.toBeChecked();
  },
};

export const FormValueAndReset: Story = {
  render: () => (
    <form data-testid="form">
      <Choice label="Subscribe" name="sub" value="yes" required control={square} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByText("Subscribe"));
    await expect(new FormData(form).get("sub")).toBe("yes");
    form.reset();
    await expect(canvas.getByRole("checkbox", { name: "Subscribe" })).not.toBeChecked();
  },
};

export const DisabledDoesNotToggle: Story = {
  args: { disabled: true },
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Show hidden files" });
    await expect(box).toBeDisabled();
    await userEvent.click(canvas.getByText("Show hidden files"));
    await expect(box).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
    const row = canvasElement.querySelector(".cy-choice") as HTMLElement;
    await expect(getComputedStyle(row).cursor).toBe("not-allowed");
    await expect(Number(getComputedStyle(row).opacity)).toBeLessThan(1);
  },
};

export const SizeSetsTheText: Story = {
  render: () => (
    <div style={{ display: "grid" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Choice key={size} size={size} label={size} control={square} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const px = (name: string) => Number.parseFloat(getComputedStyle(canvas.getByText(name)).fontSize);
    await expect(px("sm")).toBeLessThan(px("md"));
    await expect(px("md")).toBeLessThan(px("lg"));
  },
};

export const GapToken: Story = {
  render: (args) => (
    <div style={{ "--cy-choice-gap": "30px" } as CSSProperties}>
      <Choice {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByTestId("control").getBoundingClientRect();
    const text = canvas.getByText("Show hidden files").getBoundingClientRect();
    await expect(text.left - control.right).toBeCloseTo(30, 0);
  },
};

const labelLook = (el: HTMLElement) => {
  const style = getComputedStyle(el);
  return {
    line: style.textDecorationLine,
    color: rgb(style.color),
    thickness: Number.parseFloat(style.textDecorationThickness),
  };
};

export const StrikeWhenCheckedAndItsTokens: Story = {
  args: { strikeWhenChecked: true, description: "Two of them" },
  render: (args) => (
    <div
      style={
        { "--cy-choice-done-color": "rgb(200, 0, 0)", "--cy-choice-strike-width": "3px" } as CSSProperties
      }
    >
      <Choice {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const label = canvas.getByText("Show hidden files");
    await expect(labelLook(label).line).toBe("none");
    await userEvent.click(label);
    await waitFor(
      async () => {
        await settled(canvasElement);
        await expect(labelLook(label)).toEqual({ line: "line-through", color: [200, 0, 0], thickness: 3 });
        await expect(rgb(getComputedStyle(canvas.getByText("Two of them")).color)).toEqual([200, 0, 0]);
      },
      { timeout: 5000 },
    );
    await userEvent.keyboard(" ");
    await waitFor(async () => expect(labelLook(label).line).toBe("none"), { timeout: 5000 });
  },
};

export const AnInputInTheLabelDoesNotStrike: Story = {
  args: { strikeWhenChecked: true },
  render: (args) => (
    <Choice
      {...args}
      label={
        <>
          Notify <ChoiceBase type="checkbox" aria-label="inner" defaultChecked />
        </>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await settled(canvasElement);
    const label = canvasElement.querySelector(".cy-choice-label") as HTMLElement;
    await expect(getComputedStyle(label).textDecorationLine).toBe("none");
  },
};

export const CoarsePointerRow: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement, canvas, args, userEvent }) => {
    const row = canvasElement.querySelector(".cy-choice") as HTMLElement;
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByText("Show hidden files") });
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

export const StableUnderHostileHost: Story = {
  args: { description: "Dotfiles and system folders." },
  play: async ({ canvasElement }) => {
    const row = computeUnderHostileHost(canvasElement, ".cy-choice", [
      "display",
      "column-gap",
      "font-size",
      "line-height",
      "margin-top",
      "box-sizing",
    ]);
    await expect(row.hostile).toEqual(row.clean);
    const label = computeUnderHostileHost(canvasElement, ".cy-choice-label", [
      "font-size",
      "font-weight",
      "color",
    ]);
    await expect(label.hostile).toEqual(label.clean);
    const description = computeUnderHostileHost(canvasElement, ".cy-choice-description", [
      "font-size",
      "color",
    ]);
    await expect(description.hostile).toEqual(description.clean);
  },
};
