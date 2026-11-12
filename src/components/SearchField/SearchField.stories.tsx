import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SearchField } from "./SearchField.js";

const meta = {
  title: "Components/SearchField",
  component: SearchField,
  args: { label: "Search documents", onSubmit: fn(), onChange: fn(), size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SubmitsOnEnter: Story = {
  tags: ["visual"],
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("searchbox", { name: "Search documents" });
    await expect(box.closest(".cy-text-field")?.querySelector(".cy-icon")).toBeTruthy();
    await userEvent.type(box, "invoices");
    await expect(box).toHaveValue("invoices");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledWith("invoices");
  },
};

export const IgnoresEnterDuringComposition: Story = {
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole("searchbox");
    box.focus();
    box.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    box.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const EscapeDuringCompositionKeepsTheQuery: Story = {
  args: { defaultValue: "draft" },
  play: async ({ canvas, args }) => {
    const box = canvas.getByRole("searchbox");
    box.focus();
    // Escape while composing cancels the composition: the query stays and focus stays.
    box.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    const composing = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    box.dispatchEvent(composing);
    await expect(box).toHaveValue("draft");
    await expect(box).toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
    // Safari reports it only as keyCode 229.
    box.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", keyCode: 229, bubbles: true, cancelable: true }),
    );
    await expect(box).toHaveValue("draft");
    await expect(composing.defaultPrevented).toBe(false);
  },
};

export const EscapeClearsThenBlurs: Story = {
  args: { defaultValue: "draft" },
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("searchbox");
    await userEvent.click(box);
    await userEvent.keyboard("{Escape}");
    await expect(box).toHaveValue("");
    await expect(args.onChange).toHaveBeenLastCalledWith("");
    await expect(box).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(box).not.toHaveFocus();
  },
};
