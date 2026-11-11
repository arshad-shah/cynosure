import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { ColorSwatches, type ColorSwatchesProps } from "./ColorSwatches.js";

const BRAND = [
  { value: "rgb(194 65 12)", label: "Ember" },
  { value: "rgb(29 27 24)", label: "Ink" },
  { value: "rgb(251 249 245)", label: "Paper" },
  { value: "rgb(47 102 176)", label: "Info blue" },
  { value: "rgb(47 125 74 / 0.5)", label: "Half green" },
];

function Picker(props: Partial<ColorSwatchesProps> & { start?: string }) {
  const [value, setValue] = useState<string | undefined>(props.start);
  return (
    <>
      <ColorSwatches
        label="Brand colours"
        swatches={BRAND}
        {...props}
        value={value}
        onChange={(v) => {
          setValue(v);
          props.onChange?.(v);
        }}
      />
      <output data-testid="value">{value ?? ""}</output>
    </>
  );
}

const meta = {
  title: "Components/ColorSwatches",
  component: ColorSwatches,
  args: { label: "Brand colours", swatches: BRAND, onChange: fn() },
  render: (args) => <Picker onChange={args.onChange} />,
} satisfies Meta<typeof ColorSwatches>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ARadioGroupOfColours: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const group = canvas.getByRole("radiogroup", { name: "Brand colours" });
    await expect(group).toBeVisible();
    await expect(canvas.getAllByRole("radio")).toHaveLength(5);
    await userEvent.click(canvas.getByRole("radio", { name: "Ink" }));
    await expect(canvas.getByRole("radio", { name: "Ink" })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("rgb(29 27 24)");
    // Hit areas are at least 24px.
    const hit = getComputedStyle(canvas.getByRole("radio", { name: "Ink" }), "::before");
    await expect(Number.parseFloat(hit.width)).toBeGreaterThanOrEqual(24);
  },
};

export const ArrowKeysMoveAndChoose: Story = {
  render: () => <Picker start="rgb(29 27 24)" />,
  play: async ({ canvas, userEvent }) => {
    // One tab stop: the chosen swatch.
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Ink" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "Paper" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "Paper" })).toBeChecked();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("radio", { name: "Half green" })).toBeChecked();
    await userEvent.tab();
    await expect(canvas.getByRole("radiogroup").contains(document.activeElement)).toBe(false);
  },
};

export const MatchesByColourNotSpelling: Story = {
  render: () => <Picker start="#1D1B18" />,
  play: async ({ canvas }) => {
    // The same colour written as hex picks the rgb swatch.
    await expect(canvas.getByRole("radio", { name: "Ink" })).toBeChecked();
  },
};

export const TickShowsOnLightAndDark: Story = {
  render: () => <Picker start="rgb(251 249 245)" />,
  play: async ({ canvas }) => {
    const paper = canvas.getByRole("radio", { name: "Paper" });
    const ink = canvas.getByRole("radio", { name: "Ink" });
    // A dark tick on the pale swatch, a light tick on dark ones.
    await expect(getComputedStyle(paper).color).toBe("rgb(0, 0, 0)");
    await expect(getComputedStyle(ink).color).toBe("rgb(255, 255, 255)");
    await expect(paper.querySelector("svg")).not.toBeNull();
  },
};

export const PlainStringsAndDisabled: Story = {
  render: () => <Picker swatches={["red", "rgb(0 0 255)"]} disabled />,
  play: async ({ canvas, userEvent }) => {
    // Unlabelled swatches are named by their value.
    const red = canvas.getByRole("radio", { name: "red" });
    await expect(red).toBeDisabled();
    await userEvent.click(red);
    await expect(canvas.getByTestId("value")).toHaveTextContent("");
  },
};

export const TouchSwatches: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    const swatch = canvas.getByRole("radio", { name: "Ember" });
    await expect(Number.parseFloat(getComputedStyle(swatch, "::before").width)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: swatch });
    await expect(swatch).toBeChecked();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = ["display", "width", "height", "border-top-width", "padding-left", "box-sizing", "cursor"];
    for (const selector of [".cy-color-swatches", ".cy-color-swatches-swatch"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
