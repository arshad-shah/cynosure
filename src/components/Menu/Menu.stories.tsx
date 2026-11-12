import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { archive, copy, download, edit, flag, tag, trash } from "../../icons/index.js";
import { backdrop, contrast, rgb } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Popover } from "../Popover/Popover.js";
import { Menu, type MenuEntry } from "./Menu.js";

const items: MenuEntry[] = [
  { value: "edit", label: "Edit", icon: edit, shortcut: ["Ctrl", "E"] },
  { value: "copy", label: "Copy path", icon: copy },
  { value: "download", label: "Download", icon: download, disabled: true },
  { value: "archive", label: "Archive", icon: archive, shortcut: "mod+shift+a" },
  {
    label: "Danger zone",
    items: [{ value: "delete", label: "Delete", icon: trash, tone: "danger" }],
  },
];

const meta = {
  title: "Components/Menu",
  component: Menu,
  args: {
    label: "File actions",
    items,
    onSelect: fn(),
    placement: "bottom",
    trigger: (props) => <Button {...props}>Actions</Button>,
  },
  argTypes: { placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] } },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

const isOpen = (el: Element | null) => !!el?.matches(":popover-open");
const settledClosed = (el: Element) =>
  waitFor(() => {
    expect(isOpen(el)).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });

export const KeyboardOpensNavigatesAndSelects: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await canvas.findByRole("menu", { name: "File actions" });
    await shownFully(menu);
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Copy path" })).toHaveFocus();
    // Disabled items are skipped.
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{Home}");
    await expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("copy");
    await settledClosed(menu);
    await expect(trigger).toHaveFocus();
  },
};

export const ArrowUpOpensAtTheLastItem: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus());
  },
};

export const TypeaheadJumpsToMatchingItems: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveFocus());
    await userEvent.keyboard("a");
    await expect(canvas.getByRole("menuitem", { name: "Archive" })).toHaveFocus();
    await userEvent.keyboard("d");
    // "Download" is disabled, so "d" lands on Delete.
    await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  },
};

export const PointerSelectsAndShowsStructure: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
    const menu = await canvas.findByRole("menu");
    const group = canvas.getByRole("group", { name: "Danger zone" });
    await expect(group).toContainElement(canvas.getByRole("menuitem", { name: "Delete" }));
    await expect(canvas.getByRole("menuitem", { name: /Edit/ })).toHaveAttribute(
      "aria-keyshortcuts",
      "Control+E",
    );
    // A shortcut string gets this platform's modifier.
    await expect(canvas.getByRole("menuitem", { name: /Archive/ }).getAttribute("aria-keyshortcuts")).toMatch(
      /^(Control|Meta)\+Shift\+A$/,
    );
    await expect(canvas.getByRole("menuitem", { name: "Download" })).toHaveAttribute("aria-disabled", "true");
    const del = canvas.getByRole("menuitem", { name: "Delete" });
    await expect(getComputedStyle(del).color).not.toBe(
      getComputedStyle(canvas.getByRole("menuitem", { name: "Archive" })).color,
    );
    await userEvent.click(canvas.getByRole("menuitem", { name: "Download" }));
    await expect(args.onSelect).not.toHaveBeenCalled();
    await expect(isOpen(menu)).toBe(true);
    await userEvent.click(del);
    await expect(args.onSelect).toHaveBeenCalledWith("delete");
    await settledClosed(menu);
  },
};

export const EscapeAndTabClose: Story = {
  render: (args) => (
    <>
      <Menu {...args} />
      <Button>Next</Button>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    const menu = await canvas.findByRole("menu");
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(isOpen(menu)).toBe(true));
    // Tab closes the menu and moves on, like leaving the button.
    await userEvent.tab();
    await settledClosed(menu);
    await expect(canvas.getByRole("button", { name: "Next" })).toHaveFocus();
  },
};

function Checkable() {
  const [wrap, setWrap] = useState(true);
  const [indent, setIndent] = useState("2");
  return (
    <>
      <Menu
        label="View"
        trigger={(p) => <Button {...p}>View</Button>}
        items={[
          { value: "wrap", label: "Wrap lines", kind: "checkbox", checked: wrap },
          {
            label: "Indent",
            items: [
              { value: "2", label: "2 spaces", kind: "radio", checked: indent === "2" },
              { value: "4", label: "4 spaces", kind: "radio", checked: indent === "4" },
            ],
          },
        ]}
        onSelect={(value) => (value === "wrap" ? setWrap((w) => !w) : setIndent(value))}
      />
      <span data-testid="state">
        {String(wrap)} {indent}
      </span>
    </>
  );
}

export const CheckableItemsStayOpen: Story = {
  render: () => <Checkable />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View" }));
    const menu = await canvas.findByRole("menu");
    const wrapItem = canvas.getByRole("menuitemcheckbox", { name: "Wrap lines" });
    await expect(wrapItem).toHaveAttribute("aria-checked", "true");
    await userEvent.click(wrapItem);
    await expect(canvas.getByTestId("state")).toHaveTextContent("false 2");
    await expect(wrapItem).toHaveAttribute("aria-checked", "false");
    await expect(isOpen(menu)).toBe(true);
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "4 spaces" }));
    await expect(canvas.getByRole("menuitemradio", { name: "4 spaces" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(canvas.getByRole("menuitemradio", { name: "2 spaces" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  },
};

export const InsideAPopoverClosesOnlyItself: Story = {
  render: (args) => (
    <Popover label="Panel" trigger={(p) => <Button {...p}>Panel</Button>}>
      <Menu {...args} />
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Panel" }));
    const panel = await canvas.findByRole("dialog", { name: "Panel" });
    await userEvent.click(await canvas.findByRole("button", { name: "Actions" }));
    const menu = await canvas.findByRole("menu");
    await waitFor(() => expect(isOpen(menu)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await settledClosed(menu);
    await expect(isOpen(panel)).toBe(true);
    await expect(canvas.getByRole("button", { name: "Actions" })).toHaveFocus();
  },
};

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Actions" }) });
    await canvas.findByRole("menu");
    const row = canvas.getByRole("menuitem", { name: "Archive" });
    await waitFor(() => expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44));
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onSelect).toHaveBeenCalledWith("archive");
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

const coloured: MenuEntry[] = [
  { value: "high", label: "High priority", icon: flag, iconTone: "danger" },
  { value: "low", label: "Low priority", icon: flag, iconTone: "info" },
  { value: "garden", label: "Garden", icon: tag, iconColor: VIOLET },
  { value: "locked", label: "Locked", icon: flag, iconTone: "danger", iconColor: VIOLET, disabled: true },
  { value: "plain", label: "No priority", icon: flag },
  { label: "Danger zone", items: [{ value: "delete", label: "Delete", icon: trash, tone: "danger" }] },
];
const iconOf = (item: HTMLElement) => item.querySelector(".cy-menu-icon") as SVGElement;
const colourOf = (el: Element) => rgb(getComputedStyle(el).color);

export const ItemIconsKeepTheirColour: Story = {
  args: { label: "Priority", items: coloured, className: "priority-menu" },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions" });
    const danger = token(trigger, "--cy-color-danger");
    const muted = token(trigger, "--cy-color-muted");
    await userEvent.click(trigger);
    const menu = await canvas.findByRole("menu", { name: "Priority" });
    await shownFully(menu);
    const item = (name: string) => canvas.getByRole("menuitem", { name });
    await expect(colourOf(iconOf(item("High priority")))).toEqual(danger);
    await expect(colourOf(iconOf(item("Low priority")))).toEqual(token(trigger, "--cy-color-info"));
    await expect(colourOf(iconOf(item("Garden")))).toEqual(rgb(VIOLET));
    // Unchanged without the props: muted, or the item's own colour on a danger item. Disabled items are muted too.
    await expect(colourOf(iconOf(item("No priority")))).toEqual(muted);
    await expect(colourOf(iconOf(item("Delete")))).toEqual(colourOf(item("Delete")));
    await expect(colourOf(iconOf(item("Locked")))).toEqual(muted);
    await expect(getComputedStyle(item("Locked")).opacity).toBe("0.45");
    // The focused (highlighted) item keeps the icon's colour, readable on the highlight (3:1 for graphics).
    await waitFor(() => expect(item("High priority")).toHaveFocus());
    await expect(colourOf(iconOf(item("High priority")))).toEqual(danger);
    for (const name of ["High priority", "Low priority"]) {
      item(name).focus();
      const ratio = contrast(getComputedStyle(iconOf(item(name))).color, backdrop(item(name)));
      await expect({ name, visible: ratio >= 3 }).toEqual({ name, visible: true });
    }
    await expect(getComputedStyle(item("Low priority")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    // Closing from the trigger and opening again: the colours are a property of the items, not of one opening.
    await userEvent.click(trigger);
    await settledClosed(menu);
    await expect(menu).toHaveClass("cy-menu", "priority-menu");
    await userEvent.click(trigger);
    await shownFully(menu);
    await expect(colourOf(iconOf(item("Garden")))).toEqual(rgb(VIOLET));
  },
};

export const ItemIconColourIsStableUnderHostileHost: Story = {
  args: { label: "Priority", items: coloured },
  play: async ({ canvasElement }) => {
    for (const selector of [
      '.cy-menu-icon[data-tone="danger"]',
      '.cy-menu-icon[style*="color"]',
      '[aria-disabled="true"] > .cy-menu-icon',
      '[data-label="No priority"] > .cy-menu-icon',
    ]) {
      const icon = computeUnderHostileHost(canvasElement, selector, ["color", "stroke", "width"]);
      await expect({ selector, ...icon.hostile }).toEqual({ selector, ...icon.clean });
    }
    const toned = computeUnderHostileHost(canvasElement, '.cy-menu-icon[data-tone="danger"]', ["color"]);
    await expect(rgb(toned.hostile.color as string)).toEqual(
      token(canvasElement.querySelector(".cy-menu") as Element, "--cy-color-danger"),
    );
  },
};
