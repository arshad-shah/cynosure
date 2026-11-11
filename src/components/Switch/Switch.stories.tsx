import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/index.js";
import { createTheme } from "../../tokens/index.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { Switch, type SwitchProps } from "./Switch.js";

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
  tags: ["touch", "!dev"],
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

// The checklist strike is Checkbox's alone: this line stops compiling if Switch ever accepts the prop.
const SWITCH_HAS_NO_STRIKE: "strikeWhenChecked" extends keyof SwitchProps ? never : true = true;

export const OnLabelIsNeverStruckThrough: Story = {
  render: () => (
    <div style={{ display: "grid" }}>
      <Switch label="Sync on" description="Every hour" defaultChecked />
      <Checkbox label="Synced" description="Done" strikeWhenChecked defaultChecked />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(SWITCH_HAS_NO_STRIKE).toBe(true);
    const text = (role: "switch" | "checkbox") =>
      getComputedStyle(
        (canvas.getByRole(role).closest(".cy-choice") as HTMLElement).querySelector(
          ".cy-choice-label",
        ) as HTMLElement,
      );
    // Same shared row, both on: only the checklist Checkbox is struck and muted.
    await expect(text("checkbox").textDecorationLine).toBe("line-through");
    await expect(text("switch").textDecorationLine).toBe("none");
    await expect(text("switch").color).not.toBe(text("checkbox").color);
  },
};
