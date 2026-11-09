import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { Switch } from "./Switch.js";

const meta = {
  title: "Components/Switch",
  component: Switch,
  args: { label: "Auto-expand", onChange: fn(), size: "md", tone: "accent" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TogglesAsASwitch: Story = {
  tags: ["visual"],
  play: async ({ canvas, args, userEvent }) => {
    const sw = canvas.getByRole("switch", { name: "Auto-expand" });
    await expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    await expect(sw).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(sw).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const ThumbMovesWhenOn: Story = {
  render: () => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
    </CynosureTheme>
  ),
  play: async ({ canvasElement }) => {
    const [off, on] = [...canvasElement.querySelectorAll(".cy-switch-thumb")].map(
      (t) => t.getBoundingClientRect().left - (t.parentElement as Element).getBoundingClientRect().left,
    );
    await expect(on).toBeGreaterThan(off as number);
  },
};

export const DoubleClickYieldsTwoChanges: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.dblClick(canvas.getByRole("switch"));
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const FormAndReset: Story = {
  render: () => (
    <form data-testid="form">
      <Switch label="Sync" name="sync" value="on" defaultChecked />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(new FormData(form).get("sync")).toBe("on");
    await userEvent.click(canvas.getByRole("switch", { name: "Sync" }));
    await expect(new FormData(form).get("sync")).toBeNull();
    form.reset();
    await expect(canvas.getByRole("switch", { name: "Sync" })).toBeChecked();
  },
};

export const CoarsePointerRow: Story = {
  tags: ["touch"],
  play: async ({ canvasElement }) => {
    await expect(
      (canvasElement.querySelector(".cy-choice") as HTMLElement).getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-switch", [
      "width",
      "height",
      "border-radius",
      "background-color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
