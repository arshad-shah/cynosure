import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TONES } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { BitField } from "./BitField.js";

const meta = {
  title: "Components/Controls/BitField",
  component: BitField,
  args: { label: "Bits", bits: 16, defaultValue: 0x8005n, onChange: fn(), size: "md", tone: "accent" },
  argTypes: {
    bits: { control: { type: "number", min: 1, max: 64 } },
    groupSize: { control: { type: "number", min: 1, max: 16 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: TONES },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof BitField>;
export default meta;
type Story = StoryObj<typeof meta>;

const pressed = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll("button")]
    .map((b) => (b.getAttribute("aria-pressed") === "true" ? 1 : 0))
    .join("");

/** One toggle per bit, the highest first, grouped by byte; a press flips a bit and reports the new value. */
export const PressFlipsABit: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("toolbar", { name: "Bits" })).toBeInTheDocument();
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(16);
    await expect(buttons[0]).toHaveAccessibleName("Bit 15");
    await expect(buttons[15]).toHaveAccessibleName("Bit 0");
    await expect(pressed(canvasElement)).toBe("1000000000000101");
    await expect(buttons[0]).toHaveTextContent("1");
    await expect(buttons[1]).toHaveTextContent("0");
    // Two groups of eight, named by their bits.
    await expect(canvas.getByRole("group", { name: "Bits 15 to 8" })).toBeInTheDocument();
    await expect(canvas.getByRole("group", { name: "Bits 7 to 0" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Bit 1" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(0x8007n);
    await expect(pressed(canvasElement)).toBe("1000000000000111");
    await userEvent.click(canvas.getByRole("button", { name: "Bit 15" }));
    await expect(args.onChange).toHaveBeenLastCalledWith(0x0007n);
  },
};

/** One tab stop: the arrows move between the bits (across the groups), Home and End jump, Space flips. */
export const KeyboardMovesAndFlips: Story = {
  args: { bits: 8, defaultValue: 0n },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    const bit = (n: number) => canvas.getByRole("button", { name: `Bit ${n}` });
    await expect(bit(7)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(bit(5)).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenLastCalledWith(32n);
    await userEvent.keyboard("{End}");
    await expect(bit(0)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(33n);
    await userEvent.keyboard("{Home}");
    await expect(bit(7)).toHaveFocus();
    // Tab leaves the field in one step.
    await userEvent.tab();
    await expect(document.activeElement?.closest(".cy-bit-field")).toBeNull();
  },
};

/** Controlled: the value from outside sets the bits, and wider words (64 bits) work through bigint. */
export const ControlledAndSixtyFourBits: Story = {
  args: { bits: 64, defaultValue: undefined },
  render: (args) => {
    function Word() {
      const [value, setValue] = useState(0n);
      return (
        <>
          <BitField {...args} value={value} onChange={setValue} />
          <Button onClick={() => setValue(2n ** 63n + 1n)}>Top and bottom</Button>
          <output data-testid="out">{value.toString(16)}</output>
        </>
      );
    }
    return <Word />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvasElement.querySelectorAll("button[aria-pressed]")).toHaveLength(64);
    await expect(canvas.getAllByRole("group")).toHaveLength(8);
    await userEvent.click(canvas.getByRole("button", { name: "Top and bottom" }));
    await expect(canvas.getByRole("button", { name: "Bit 63" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Bit 0" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "Bit 1" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Bit 32" }));
    await expect(canvas.getByTestId("out")).toHaveTextContent("8000000100000001");
  },
};

/** `groupSize` groups by nibble; a value wider than `bits` shows only its low bits; labels name the bits. */
export const GroupsAndLabels: Story = {
  args: {
    bits: 8,
    groupSize: 4,
    defaultValue: 0x1ffn,
    labels: { bit: (n) => `Bit ${n} setzen`, group: (high, low) => `Bits ${high}–${low}` },
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole("group").map((g) => g.getAttribute("aria-label"))).toEqual([
      "Bits 7–4",
      "Bits 3–0",
    ]);
    await expect(pressed(canvasElement)).toBe("11111111");
    await expect(canvas.getByRole("button", { name: "Bit 0 setzen" })).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const bit = canvas.getByRole("button", { name: "Bit 3" });
    await expect(bit).toBeDisabled();
    await userEvent.click(bit);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** The highest bit stays on the left in right-to-left pages, as numbers are written. */
export const SameOrderInRightToLeft: Story = {
  args: { bits: 8 },
  render: (args) => (
    <div dir="rtl">
      <BitField {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const high = canvas.getByRole("button", { name: "Bit 7" }).getBoundingClientRect();
    const low = canvas.getByRole("button", { name: "Bit 0" }).getBoundingClientRect();
    await expect(high.left).toBeLessThan(low.left);
    canvas.getByRole("button", { name: "Bit 7" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Bit 6" })).toHaveFocus();
  },
};

export const TouchBits: Story = {
  tags: ["touch", "!dev"],
  args: { bits: 8, defaultValue: 0n },
  play: async ({ args, canvas, userEvent }) => {
    const bit = canvas.getByRole("button", { name: "Bit 2" });
    await expect(bit.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    await expect(Number.parseFloat(getComputedStyle(bit, "::before").height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: bit });
    await expect(args.onChange).toHaveBeenLastCalledWith(4n);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-bit-field", ".cy-bit-field-group"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "gap",
        "font-size",
        "box-sizing",
        "direction",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
