import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Kbd } from "./Kbd.js";

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  args: { keys: ["Ctrl", "K"], size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] }, keys: { control: "object" } },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReadsAsAKeyCombination: Story = {
  tags: ["visual"],
  play: async ({ canvasElement }) => {
    const kbd = canvasElement.querySelector(".cy-kbd") as HTMLElement;
    await expect(kbd.querySelectorAll(".cy-kbd-key")).toHaveLength(2);
    await expect(kbd.querySelector(".cy-visually-hidden")).toHaveTextContent("Control plus K");
    await expect(kbd.textContent).not.toContain("+");
  },
};

export const SpeaksSymbolNames: Story = {
  args: { keys: ["Cmd", "Shift", "Enter"] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-visually-hidden")).toHaveTextContent(
      "Command plus Shift plus Enter",
    );
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-kbd-key", [
      "font-size",
      "font-family",
      "padding-top",
      "border-radius",
      "min-width",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
