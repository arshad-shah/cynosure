import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ThemeToggle } from "./ThemeToggle.js";

const memory = () => {
  const data = new Map<string, string>();
  return {
    data,
    storage: { get: (k: string) => data.get(k) ?? null, set: (k: string, v: string) => void data.set(k, v) },
  };
};

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  args: { onChange: fn(), size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

const shared = memory();

export const SelectsAndPersists: Story = {
  tags: ["visual"],
  args: { storage: shared.storage },
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("radiogroup", { name: "Colour mode" })).toBeInTheDocument();
    await expect(canvas.getByRole("radio", { name: "System" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Dark" }));
    await expect(args.onChange).toHaveBeenCalledWith("dark");
    await expect(shared.data.get("cy-color-mode")).toBe("dark");
  },
};

export const KeyboardAndLabels: Story = {
  args: { value: "light", labels: { label: "Thème", light: "Clair", dark: "Sombre", system: "Système" } },
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("radiogroup", { name: "Thème" })).toBeInTheDocument();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).toHaveBeenCalledWith("dark");
    await expect(canvas.getByRole("radio", { name: "Sombre" })).toBeInTheDocument();
  },
};
