import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { SearchField, type SearchFieldProps } from "./SearchField.js";

const meta = {
  title: "Components/SearchField",
  component: SearchField,
  args: { label: "Search documents", onSubmit: fn(), onChange: fn(), size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    trailing: { control: "text" },
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

const DOCS = ["Invoice March", "Invoice April", "Receipt", "Contract", "Invoice May"];

function Counted(props: Partial<SearchFieldProps>) {
  const [query, setQuery] = useState("");
  const hits = query ? DOCS.filter((d) => d.toLowerCase().includes(query.toLowerCase())).length : 0;
  return (
    <SearchField
      label="Search documents"
      {...props}
      value={query}
      onChange={setQuery}
      trailing={query ? `${hits ? 1 : 0} of ${hits}` : undefined}
    />
  );
}

export const TrailingMatchCount: Story = {
  tags: ["visual"],
  render: () => <Counted />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const box = canvas.getByRole("searchbox", { name: "Search documents" });
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent(/^$/);
    await userEvent.type(box, "invoice");
    const count = canvasElement.querySelector(".cy-search-field-trailing") as HTMLElement;
    // Shown inside the field, at its end, without covering the typed text; read once, through the status.
    await expect(count).toHaveTextContent("1 of 3");
    await expect(count.closest(".cy-text-field")).toBe(box.closest(".cy-text-field"));
    await expect(count).toHaveAttribute("aria-hidden", "true");
    await expect(box.getBoundingClientRect().right).toBeLessThanOrEqual(count.getBoundingClientRect().left);
    await expect(status).toHaveTextContent("1 of 3");
    // A new count is announced politely.
    await userEvent.type(box, " ap");
    await expect(status).toHaveTextContent("1 of 1");
    await expect(status).toHaveAttribute("aria-live", "polite");
    // Cleared: the count goes away and so does the announcement.
    await userEvent.keyboard("{Escape}");
    await expect(box).toHaveValue("");
    await expect(canvasElement.querySelector(".cy-search-field-trailing")).toBeNull();
    await expect(status).toHaveTextContent(/^$/);
  },
};

export const TrailingAnyContent: Story = {
  args: {
    defaultValue: "report",
    trailing: (
      <>
        <span>12</span> results
      </>
    ),
  },
  play: async ({ canvas, args, userEvent }) => {
    // Content other than a string is announced by its text.
    await expect(canvas.getByRole("status")).toHaveTextContent("12 results");
    // The field still clears with its button.
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(canvas.getByRole("searchbox")).toHaveValue("");
    await expect(args.onChange).toHaveBeenLastCalledWith("");
  },
};

export const TrailingSitsAtTheEndInRtl: Story = {
  args: { defaultValue: "فاتورة", trailing: "3" },
  decorators: [(Story) => <div dir="rtl">{Story()}</div>],
  play: async ({ canvas, canvasElement }) => {
    const box = canvas.getByRole("searchbox");
    const count = canvasElement.querySelector(".cy-search-field-trailing") as HTMLElement;
    // The inline end is the left in right-to-left text.
    await expect(count.getBoundingClientRect().right).toBeLessThanOrEqual(box.getBoundingClientRect().left);
  },
};

export const TrailingUnderHostileHost: Story = {
  args: { defaultValue: "a", trailing: "2 of 9" },
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-search-field-trailing", [
      "font-size",
      "font-weight",
      "color",
      "text-transform",
      "letter-spacing",
      "white-space",
      "margin-left",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const TrailingDuringComposition: Story = {
  render: () => <Counted />,
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("searchbox");
    await userEvent.type(box, "rec");
    await expect(canvas.getByRole("status")).toHaveTextContent("1 of 1");
    // Escape while an IME composes leaves the query and its count alone.
    box.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    box.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true, isComposing: true }),
    );
    await expect(box).toHaveValue("rec");
    await expect(canvas.getByRole("status")).toHaveTextContent("1 of 1");
  },
};
