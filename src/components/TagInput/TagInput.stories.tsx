import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { TagInput } from "./TagInput.js";

const SUGGESTIONS = ["react", "preact", "astro", "design", "docs", "release"];

const meta = {
  title: "Components/TagInput",
  component: TagInput,
  args: { label: "Topics", defaultValue: ["design"], onChange: fn() },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
} satisfies Meta<typeof TagInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Fires a paste of `text` (Firefox ignores `clipboardData` in the ClipboardEvent constructor, so attach it). */
function paste(input: HTMLElement, text: string) {
  const data = new DataTransfer();
  data.setData("text/plain", text);
  const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data });
  if (!event.clipboardData) Object.defineProperty(event, "clipboardData", { value: data });
  input.dispatchEvent(event);
}

const tagsOf = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll(".cy-tag-input-text")].map((t) => t.textContent);

export const EnterAndCommaAddTags: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Topics" });
    await userEvent.type(input, "docs{Enter}");
    await expect(tagsOf(canvasElement)).toEqual(["design", "docs"]);
    await expect(args.onChange).toHaveBeenLastCalledWith(["design", "docs"]);
    await expect(input).toHaveValue("");
    await userEvent.type(input, " release ,");
    // Trimmed, added on the separator, and announced.
    await expect(tagsOf(canvasElement)).toEqual(["design", "docs", "release"]);
    await expect(canvas.getByRole("status")).toHaveTextContent("release added");
    const list = canvas.getByRole("list", { name: "Tags" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    // Enter on an empty field adds nothing.
    await userEvent.keyboard("{Enter}");
    await expect(tagsOf(canvasElement)).toHaveLength(3);
  },
};

export const RemovingTags: Story = {
  args: { defaultValue: ["design", "docs", "release"] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Topics" });
    await userEvent.click(canvas.getByRole("button", { name: "Remove docs" }));
    await expect(tagsOf(canvasElement)).toEqual(["design", "release"]);
    await expect(input).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("docs removed");
    // Backspace in an empty field removes the last tag.
    await userEvent.keyboard("{Backspace}");
    await expect(tagsOf(canvasElement)).toEqual(["design"]);
    // But not while there is text to delete.
    await userEvent.type(input, "ab{Backspace}");
    await expect(tagsOf(canvasElement)).toEqual(["design"]);
    await expect(input).toHaveValue("a");
  },
};

export const ArrowKeysThroughTags: Story = {
  args: { defaultValue: ["design", "docs", "release"] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Topics" });
    input.focus();
    // From the start of the field, Arrow Left moves into the tags (their remove buttons).
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Remove release" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Remove docs" })).toHaveFocus();
    await userEvent.keyboard("{Delete}");
    await expect(tagsOf(canvasElement)).toEqual(["design", "release"]);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Remove design" })).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(input).toHaveFocus();
    // Tags are not tab stops: one Tab leaves the whole field.
    await expect(canvas.getByRole("button", { name: "Remove design" })).toHaveAttribute("tabindex", "-1");
    await userEvent.keyboard("{ArrowLeft}{Escape}");
    await expect(input).toHaveFocus();
  },
};

export const RefusalsAreExplained: Story = {
  args: {
    defaultValue: ["design"],
    maxTags: 3,
    validate: (tag) => (tag.length > 12 ? "Keep tags under 12 characters" : null),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Topics" });
    await userEvent.type(input, "Design{Enter}");
    // Case-insensitive duplicate: refused, explained, and the text stays to fix.
    await expect(input).toHaveAccessibleDescription("Design is already added");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveValue("Design");
    await userEvent.clear(input);
    await expect(input).not.toHaveAttribute("aria-invalid");
    await userEvent.type(input, "averyveryverylongtag{Enter}");
    await expect(input).toHaveAccessibleDescription("Keep tags under 12 characters");
    await userEvent.clear(input);
    await userEvent.type(input, "a{Enter}b{Enter}c{Enter}");
    await expect(tagsOf(canvasElement)).toEqual(["design", "a", "b"]);
    await expect(input).toHaveAccessibleDescription("Up to 3 tags");
  },
};

export const PastingAList: Story = {
  args: { defaultValue: [] },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Topics" });
    input.focus();
    paste(input, "react, astro\npreact,react");
    // Split on separators and lines; the repeated one is refused.
    await waitFor(() => expect(tagsOf(canvasElement)).toEqual(["react", "astro", "preact"]));
    await expect(input).toHaveAccessibleDescription("react is already added");
  },
};

export const Suggestions: Story = {
  args: { suggestions: SUGGESTIONS },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Topics" });
    await userEvent.type(input, "re");
    const list = await waitFor(() => canvas.getByRole("listbox"));
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "true"));
    // Matches anywhere in the word; tags already added are not offered.
    const options = within(list)
      .getAllByRole("option")
      .map((o) => o.textContent);
    await expect(options).toEqual(["react", "preact", "release"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveAttribute("aria-activedescendant", within(list).getAllByRole("option")[1]?.id);
    await userEvent.keyboard("{Enter}");
    await expect(tagsOf(canvasElement)).toEqual(["design", "preact"]);
    await userEvent.type(input, "ast");
    await userEvent.click(await waitFor(() => canvas.getByRole("option", { name: "astro" })));
    await expect(tagsOf(canvasElement)).toEqual(["design", "preact", "astro"]);
    // Free text is still allowed.
    await userEvent.type(input, "zzz{Escape}");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Enter}");
    await expect(tagsOf(canvasElement)).toContain("zzz");
  },
};

export const SuggestionKeysAndEdges: Story = {
  args: { suggestions: ["alpha", "beta", "gamma"], defaultValue: ["one"] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Topics" });
    input.focus();
    // Arrow Down on an empty field opens every suggestion at the first; Arrow Up opens at the last.
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "true"));
    const options = () => within(canvas.getByRole("listbox")).getAllByRole("option");
    await expect(input).toHaveAttribute("aria-activedescendant", options()[0]?.id);
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveAttribute("aria-activedescendant", options()[0]?.id);
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    // A second Escape with the list closed is left for an enclosing dialog.
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveAttribute("aria-activedescendant", options()[2]?.id);
    await userEvent.keyboard("{Enter}");
    await expect(tagsOf(canvasElement)).toEqual(["one", "gamma"]);
    // Nothing matches: the list says so, and Enter adds the free text.
    await userEvent.type(input, "zzz");
    await waitFor(() =>
      expect(canvas.getByRole("option", { name: "No suggestions" })).toHaveAttribute("aria-disabled", "true"),
    );
    await userEvent.keyboard("{Enter}");
    await expect(tagsOf(canvasElement)).toEqual(["one", "gamma", "zzz"]);
    // Removing the first tag from the keyboard returns to the field.
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Remove one" })).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => expect(input).toHaveFocus());
    await expect(tagsOf(canvasElement)).toEqual(["gamma", "zzz"]);
  },
};

export const PlainFieldKeys: Story = {
  args: { label: <span>Topics</span>, labelHidden: true, defaultValue: [] },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox");
    input.focus();
    // Without suggestions, Arrow keys and Escape leave the caret alone, and no list exists.
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{Escape}{Backspace}{ArrowLeft}");
    await expect(canvas.queryByRole("listbox")).toBeNull();
    await expect(tagsOf(canvasElement)).toEqual([]);
    // A pasted single word is typed normally (not split).
    paste(input, "solo");
    await expect(tagsOf(canvasElement)).toEqual([]);
  },
};

export const LeavingTheFieldKeepsTheText: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Topics" }), "pending");
    await userEvent.tab();
    await expect(tagsOf(canvasElement)).toEqual(["design", "pending"]);
  },
};

export const InForms: Story = {
  args: { name: "topic", defaultValue: ["design", "docs"] },
  render: (args) => (
    <form data-testid="form">
      <Stack gap="4">
        <TagInput {...args} />
        <TagInput label="Required" name="needed" required />
        <TagInput label="Locked" name="locked" defaultValue={["fixed"]} disabled />
        <Button type="reset">Reset</Button>
      </Stack>
    </form>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    // Every tag is submitted under the name; disabled ones are not.
    await expect(new FormData(form).getAll("topic")).toEqual(["design", "docs"]);
    await expect(new FormData(form).getAll("locked")).toEqual([]);
    await expect(canvas.queryByRole("button", { name: "Remove fixed" })).toBeNull();
    // Required with no tags: the form is invalid until one is added.
    await expect(form.checkValidity()).toBe(false);
    await userEvent.type(canvas.getByRole("textbox", { name: "Required" }), "x{Enter}");
    await expect(form.checkValidity()).toBe(true);
    await userEvent.type(canvas.getByRole("textbox", { name: "Topics" }), "more{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(new FormData(form).getAll("topic")).toEqual(["design", "docs"]));
    await expect(tagsOf(canvasElement)).toContain("docs");
  },
};

export const Controlled: Story = {
  render: (args) => {
    function Controlled() {
      const [tags, setTags] = useState<string[]>(["one"]);
      return (
        <Stack gap="4">
          <TagInput {...args} value={tags} onChange={setTags} />
          <Button onClick={() => setTags([])}>Clear all</Button>
        </Stack>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Topics" }), "two{Enter}");
    await expect(tagsOf(canvasElement)).toEqual(["one", "two"]);
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await expect(tagsOf(canvasElement)).toEqual([]);
    await expect(canvas.queryByRole("list", { name: "Tags" })).toBeNull();
  },
};

export const TouchRemove: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const remove = canvas.getByRole("button", { name: "Remove design" });
    await expect(Number.parseFloat(getComputedStyle(remove, "::before").height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: remove });
    await expect(tagsOf(canvasElement)).toEqual([]);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "font-size",
      "color",
      "background-color",
      "padding-left",
      "list-style-type",
      "box-sizing",
    ];
    for (const selector of [
      ".cy-tag-input",
      ".cy-tag-input-tags",
      ".cy-tag-input-tag",
      ".cy-tag-input-text",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
