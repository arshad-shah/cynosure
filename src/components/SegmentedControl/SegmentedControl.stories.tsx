import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { code, moon, sun, tree } from "../../icons/index.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { SegmentedControl } from "./SegmentedControl.js";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  args: {
    label: "View",
    name: "view",
    defaultValue: "tree",
    options: [
      { value: "tree", label: "Tree", icon: tree },
      { value: "raw", label: "Raw", icon: code },
      { value: "table", label: "Table", disabled: true },
    ],
    onChange: fn(),
    size: "md",
    tone: "neutral",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    iconOnly: { control: "boolean" },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ArrowKeysSelect: Story = {
  tags: ["visual"],
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Tree" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "Raw" })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("raw");
  },
};

export const IconOnlySegmentsAreNamed: Story = {
  tags: ["visual"],
  args: {
    iconOnly: true,
    label: "Theme",
    defaultValue: "light",
    options: [
      { value: "light", label: "Light", icon: sun },
      { value: "dark", label: "Dark", icon: moon },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Light" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Dark" })).toBeInTheDocument();
  },
};

export const DoubleActivationChangesOnce: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.dblClick(canvas.getByText("Raw"));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const IndicatorFollowsSelectionAndResets: Story = {
  render: (args) => (
    <form data-testid="form">
      <SegmentedControl {...args} />
    </form>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const segment = (text: string) => canvas.getByText(text).closest(".cy-segment") as Element;
    const bg = (text: string) => getComputedStyle(segment(text)).backgroundColor;
    const inactive = bg("Raw");
    await expect(bg("Tree")).not.toBe(inactive);
    await userEvent.click(canvas.getByText("Raw"));
    await expect(bg("Raw")).not.toBe(bg("Tree"));
    (canvas.getByTestId("form") as HTMLFormElement).reset();
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Tree" })).toBeChecked());
    await expect(canvasElement.querySelectorAll(".cy-segment")).toHaveLength(3);
  },
};

export const SameNameTwiceKeepsEachSelection: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <SegmentedControl {...args} label="First view" defaultValue="tree" />
      <SegmentedControl {...args} label="Second view" defaultValue="raw" />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Two controls given the same `name` (two rows of a list, two panels) are still two groups: each keeps its
    // own selection, and a click in one never moves the other.
    const first = within(canvas.getByRole("radiogroup", { name: "First view" }));
    const second = within(canvas.getByRole("radiogroup", { name: "Second view" }));
    await expect(first.getByRole("radio", { name: "Tree" })).toBeChecked();
    await expect(second.getByRole("radio", { name: "Raw" })).toBeChecked();
    await userEvent.click(second.getByText("Tree"));
    await expect(second.getByRole("radio", { name: "Tree" })).toBeChecked();
    await expect(first.getByRole("radio", { name: "Tree" })).toBeChecked();
    await userEvent.click(first.getByText("Raw"));
    await expect(first.getByRole("radio", { name: "Raw" })).toBeChecked();
    await expect(second.getByRole("radio", { name: "Tree" })).toBeChecked();
    const ids = [...canvasElement.querySelectorAll("input[type=radio]")].map((input) => input.id);
    await expect(new Set(ids).size).toBe(ids.length);
  },
};

export const NameSubmitsTheValueWithItsForm: Story = {
  render: (args) => (
    <form data-testid="form">
      <SegmentedControl {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const sent = () => new FormData(form).getAll("view");
    await expect(sent()).toEqual(["tree"]);
    // Only the given name is submitted, not the control's own grouping.
    await expect([...new FormData(form).keys()]).toEqual(["view"]);
    await userEvent.click(canvas.getByText("Raw"));
    await expect(sent()).toEqual(["raw"]);
    form.reset();
    await waitFor(() => expect(sent()).toEqual(["tree"]));
  },
};

export const SmallLinesUpWithOtherSmallControls: Story = {
  args: { size: "sm" },
  render: (args) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <SegmentedControl {...args} />
      <Button size="sm">Beside it</Button>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // A small control is as tall as every other small control, so a row of them lines up.
    const group = canvas.getByRole("radiogroup", { name: "View" });
    const button = canvas.getByRole("button", { name: "Beside it" });
    await expect(group.getBoundingClientRect().height).toBe(button.getBoundingClientRect().height);
    // The segment looks smaller than 24px there, so its hit area reaches past it.
    const segment = canvasElement.querySelector(".cy-segment") as Element;
    await expect(Number.parseFloat(getComputedStyle(segment, "::before").height)).toBeGreaterThanOrEqual(24);
  },
};

export const CoarsePointerSegments: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement }) => {
    for (const s of canvasElement.querySelectorAll(".cy-segment"))
      await expect(s.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-segmented", [
      "height",
      "border-radius",
      "background-color",
      "padding-top",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
