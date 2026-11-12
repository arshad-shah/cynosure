import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { flag, heart, tag } from "../../icons/index.js";
import { backdrop, contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Dialog } from "../Dialog/Dialog.js";
import { Combobox, type ComboboxOption } from "./Combobox.js";

const fruits: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "apricot", label: "Apricot" },
  { value: "banana", label: "Banana" },
  { value: "blackberry", label: "Blackberry", disabled: true },
  { value: "blueberry", label: "Blueberry" },
  { value: "grape", label: "Grape", description: "Seedless" },
];

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  args: { label: "Fruit", options: fruits, placeholder: "Search fruit", onChange: fn(), onInputChange: fn() },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    allowCustom: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;

const listbox = () => document.querySelector(".cy-combobox-list") as HTMLElement;
const isOpen = () => listbox().matches(":popover-open");
const optionNames = () =>
  [...listbox().querySelectorAll(".cy-combobox-option-label")].map((o) => o.textContent);
const activeOption = (input: HTMLElement) => {
  const id = input.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};

export const TypeToFilterThenChooseWithEnter: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await expect(input).toHaveAttribute("aria-autocomplete", "list");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(input);
    await userEvent.keyboard("ap");
    await waitFor(() => expect(isOpen()).toBe(true));
    await shownFully(listbox());
    await expect(input).toHaveAttribute("aria-expanded", "true");
    // "ap" matches anywhere in the label, ignoring case.
    await expect(optionNames()).toEqual(["Apple", "Apricot", "Grape"]);
    await expect(activeOption(input)).toHaveTextContent("Apple");
    await userEvent.keyboard("{ArrowDown}");
    await expect(activeOption(input)).toHaveTextContent("Apricot");
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("Apricot");
    await expect(args.onChange).toHaveBeenLastCalledWith("apricot");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(input).not.toHaveAttribute("aria-activedescendant");
    await expect(input).toHaveFocus();
  },
};

export const ArrowsOpenAndEscapeClosesThenClears: Story = {
  args: { defaultValue: "banana" },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await expect(input).toHaveValue("Banana");
    input.focus();
    // Down opens on the first option, Up on the last; the whole list shows until you type.
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(isOpen()).toBe(true));
    await expect(optionNames()).toHaveLength(fruits.length);
    await expect(activeOption(input)).toHaveTextContent("Apple");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await userEvent.keyboard("{ArrowUp}");
    await expect(activeOption(input)).toHaveTextContent("Grape");
    // Disabled options are skipped.
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(activeOption(input)).toHaveTextContent("Banana");
    // First Escape closes the list, the second clears the text and the value.
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("Banana");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("");
    await expect(args.onChange).toHaveBeenLastCalledWith("");
  },
};

export const PointerChoosesAndKeepsFocusInTheInput: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await userEvent.click(input);
    await waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.click(canvas.getByRole("option", { name: /Grape/ }));
    await expect(input).toHaveValue("Grape");
    await expect(args.onChange).toHaveBeenLastCalledWith("grape");
    await expect(input).toHaveFocus();
    // A click outside closes an open list.
    await userEvent.click(input);
    await waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.click(document.body);
    await waitFor(() => expect(isOpen()).toBe(false));
  },
};

export const LeavingWithUnknownTextKeepsTheLastChoice: Story = {
  args: { defaultValue: "apple" },
  render: (args) => (
    <>
      <Combobox {...args} />
      <Button>Next field</Button>
    </>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await userEvent.clear(input);
    await userEvent.type(input, "zzz");
    await waitFor(() => expect(canvas.getByRole("option", { name: "No matches" })).toBeInTheDocument());
    await userEvent.tab();
    // Text that matches nothing is not a value: it goes back to the last choice.
    await expect(input).toHaveValue("Apple");
    await expect(args.onChange).not.toHaveBeenCalled();
    // Emptying the field and leaving clears the value.
    await userEvent.clear(input);
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith("");
  },
};

export const AllowCustomAcceptsNewText: Story = {
  args: { allowCustom: true, label: "Tag", options: [{ value: "design", label: "design" }] },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Tag" });
    await userEvent.click(input);
    await userEvent.keyboard("research{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("research");
    await expect(input).toHaveValue("research");
  },
};

/** Fetches matching fruit 300ms after each keystroke, like a server would. */
function AsyncFruit({ onChange }: { onChange: (v: string) => void }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!text) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      setOptions(fruits.filter((f) => f.label.toLowerCase().startsWith(text.toLowerCase())));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <Combobox
      label="Fruit"
      options={options}
      inputValue={text}
      onInputChange={setText}
      filter={false}
      loading={loading}
      onChange={onChange}
    />
  );
}

export const AsyncResultsArriveLateWithoutLosingKeys: Story = {
  render: (args) => <AsyncFruit onChange={args.onChange as (v: string) => void} />,
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await userEvent.click(input);
    // Type faster than results arrive: nothing is lost, and the list says it is loading.
    await userEvent.keyboard("bl");
    await expect(input).toHaveValue("bl");
    await waitFor(() => expect(canvas.getByRole("listbox")).toHaveAttribute("aria-busy", "true"));
    await expect(canvas.getByRole("option", { name: "Loading…" })).toBeInTheDocument();
    await userEvent.keyboard("u");
    await expect(input).toHaveValue("blu");
    // Results arrive: the first enabled one is active, focus never left the input.
    await waitFor(() => expect(optionNames()).toEqual(["Blueberry"]));
    await expect(canvas.getByRole("listbox")).not.toHaveAttribute("aria-busy");
    await expect(input).toHaveFocus();
    await waitFor(() => expect(activeOption(input)).toHaveTextContent("Blueberry"));
    await userEvent.keyboard("{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("blueberry");
  },
};

export const FormValueRequiredAndReset: Story = {
  args: { name: "fruit", required: true, defaultValue: "", labels: { required: "Pick a fruit." } },
  render: (args) => (
    <form data-testid="form" onSubmit={(e) => e.preventDefault()}>
      <Combobox {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const input = canvas.getByRole("combobox", { name: /Fruit/ });
    // A blocked submit focuses the input and explains why.
    form.requestSubmit();
    await waitFor(() => expect(input).toHaveFocus());
    await expect(canvas.getByText("Pick a fruit.")).toBeVisible();
    await userEvent.keyboard("ban{Enter}");
    await expect(new FormData(form).get("fruit")).toBe("banana");
    await expect(canvas.queryByText("Pick a fruit.")).toBeNull();
    form.reset();
    await waitFor(() => expect(input).toHaveValue(""));
    await expect(new FormData(form).get("fruit")).toBe("");
  },
};

export const InsideADialogEscapeClosesOneThingAtATime: Story = {
  render: (args) => (
    <Dialog title="Order" defaultOpen>
      <Combobox {...args} />
    </Dialog>
  ),
  play: async ({ canvas, userEvent }) => {
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    await waitFor(() => expect(dialog.open).toBe(true));
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("gr");
    await waitFor(() => expect(isOpen()).toBe(true));
    // The list sits above the dialog.
    await shownFully(listbox());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(dialog.open).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("");
    await expect(dialog.open).toBe(true);
    // Nothing left to undo: Escape reaches the dialog.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog.open).toBe(false));
  },
};

export const DisabledField: Story = {
  args: { disabled: true, defaultValue: "apple", name: "fruit" },
  render: (args) => (
    <form data-testid="form">
      <Combobox {...args} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await expect(input).toBeDisabled();
    await userEvent.click(input);
    await expect(isOpen()).toBe(false);
    await expect(new FormData(canvas.getByTestId("form") as HTMLFormElement).get("fruit")).toBeNull();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit" }));
    await waitFor(() => expect(isOpen()).toBe(true));
    for (const selector of [".cy-combobox-list", ".cy-combobox-option", ".cy-combobox-option-label"]) {
      const { clean, hostile } = computeUnderHostileHost(document, selector, [
        "display",
        "padding-top",
        "font-size",
        "box-sizing",
        "color",
        "text-transform",
        "letter-spacing",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await userEvent.pointer({ keys: "[TouchA]", target: input });
    await waitFor(() => expect(isOpen()).toBe(true));
    const row = canvas.getByRole("option", { name: "Banana" });
    await waitFor(() => expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44));
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onChange).toHaveBeenLastCalledWith("banana");
  },
};

export const EdgeCasesAndKeys: Story = {
  render: (args) => (
    <>
      <Combobox
        {...args}
        className="host-combo"
        label={<span>Fruit</span>}
        options={[
          { value: "banana", label: "Banana", icon: heart },
          { value: "cherry", label: "Cherry", icon: tag, disabled: true },
        ]}
      />
      <Button>After</Button>
    </>
  ),
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await expect(canvasElement.querySelector(".host-combo")).not.toBeNull();
    const input = canvas.getByRole("combobox");
    input.focus();
    // Keys that do nothing while the list is closed.
    await userEvent.keyboard("{Enter}");
    await expect(isOpen()).toBe(false);
    // Text being composed (IME) is left alone.
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", isComposing: true, bubbles: true }));
    await expect(isOpen()).toBe(false);
    // Alt+Down opens on the current choice (none yet: the first option).
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await waitFor(() => expect(isOpen()).toBe(true));
    await expect(listbox().querySelectorAll(".cy-icon")).toHaveLength(2);
    // A disabled option cannot be chosen by pointer either.
    await userEvent.click(canvas.getByRole("option", { name: "Cherry" }));
    await expect(args.onChange).not.toHaveBeenCalled();
    // Tab closes the list without choosing.
    await userEvent.tab();
    await waitFor(() => expect(isOpen()).toBe(false));
    await expect(args.onChange).not.toHaveBeenCalled();
    // Nothing matches: arrows have nowhere to go.
    input.focus();
    await userEvent.keyboard("zz{ArrowDown}{ArrowUp}");
    await expect(input).not.toHaveAttribute("aria-activedescendant");
  },
};

export const FullyControlled: Story = {
  render: (args) => {
    function Controlled() {
      const [value, setValue] = useState("apple");
      const [text, setText] = useState("Apple");
      return (
        <form data-testid="form">
          <Combobox
            {...args}
            name="fruit"
            value={value}
            onChange={setValue}
            inputValue={text}
            onInputChange={setText}
          />
          <output data-testid="out">{value}</output>
        </form>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Fruit" });
    await userEvent.clear(input);
    await userEvent.type(input, "gra");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByTestId("out")).toHaveTextContent("grape");
    await expect(input).toHaveValue("Grape");
    // A reset leaves controlled values to their owner.
    (canvas.getByTestId("form") as HTMLFormElement).reset();
    await expect(canvas.getByTestId("out")).toHaveTextContent("grape");
  },
};

/** A colour token as painted sRGB, resolved next to `near` (so it follows that element's theme). */
function token(near: Element, name: string) {
  const probe = document.createElement("i");
  probe.style.color = `var(${name})`;
  near.after(probe);
  const value = rgb(getComputedStyle(probe).color);
  probe.remove();
  return value;
}
const VIOLET = "rgb(124, 58, 237)";

const categories: ComboboxOption[] = [
  { value: "work", label: "Work", icon: tag, iconTone: "info" },
  { value: "urgent", label: "Urgent", icon: flag, iconTone: "danger" },
  { value: "garden", label: "Garden", icon: tag, iconColor: VIOLET },
  { value: "archived", label: "Archived", icon: tag, iconTone: "success", iconColor: VIOLET, disabled: true },
  { value: "other", label: "Other", icon: tag },
  { value: "text", label: "Text only" },
];
const iconOf = (option: HTMLElement) => option.querySelector(".cy-icon") as SVGElement;
const colourOf = (el: Element) => rgb(getComputedStyle(el).color);

export const OptionIconsKeepTheirColour: Story = {
  args: { label: "Category", options: categories, placeholder: "Search categories" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Category" });
    const danger = token(input, "--cy-color-danger");
    await userEvent.click(input);
    await waitFor(() => expect(isOpen()).toBe(true));
    await shownFully(listbox());
    const option = (name: string) => canvas.getByRole("option", { name });
    await expect(colourOf(iconOf(option("Work")))).toEqual(token(input, "--cy-color-info"));
    await expect(colourOf(iconOf(option("Urgent")))).toEqual(danger);
    await expect(colourOf(iconOf(option("Garden")))).toEqual(rgb(VIOLET));
    // Without the props an icon is the option's text colour, as before; a disabled option's icon is muted with its row.
    await expect(colourOf(iconOf(option("Other")))).toEqual(colourOf(option("Other")));
    await expect(colourOf(iconOf(option("Archived")))).toEqual(colourOf(option("Archived")));
    await expect(getComputedStyle(option("Archived")).opacity).toBe("0.45");
    await expect(option("Text only").querySelector(".cy-icon")).toBeNull();
    // The active option (arrow keys) keeps the icon's colour, readable on the highlight (3:1 for graphics).
    await userEvent.keyboard("{ArrowDown}");
    await expect(activeOption(input)).toHaveTextContent("Urgent");
    await expect(colourOf(iconOf(option("Urgent")))).toEqual(danger);
    const ratio = contrast(getComputedStyle(iconOf(option("Urgent"))).color, backdrop(option("Urgent")));
    await expect(ratio).toBeGreaterThanOrEqual(3);
    // Chosen and reopened: the selected option's icon is still its own colour.
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("Urgent");
    await userEvent.click(input);
    await waitFor(() => expect(isOpen()).toBe(true));
    await expect(option("Urgent")).toHaveAttribute("aria-selected", "true");
    await expect(colourOf(iconOf(option("Urgent")))).toEqual(danger);
  },
};

export const OptionIconColourIsStableUnderHostileHost: Story = {
  args: { label: "Category", options: categories },
  play: async ({ canvasElement }) => {
    for (const selector of [
      '.cy-combobox-icon[data-tone="danger"]',
      '.cy-combobox-icon[style*="color"]',
      '.cy-combobox-option[aria-disabled="true"] .cy-combobox-icon',
    ]) {
      const icon = computeUnderHostileHost(canvasElement, selector, ["color", "stroke", "width"]);
      await expect({ selector, ...icon.hostile }).toEqual({ selector, ...icon.clean });
    }
    const toned = computeUnderHostileHost(canvasElement, '.cy-combobox-icon[data-tone="danger"]', ["color"]);
    await expect(rgb(toned.hostile.color as string)).toEqual(
      token(canvasElement.querySelector(".cy-combobox") as Element, "--cy-color-danger"),
    );
  },
};
