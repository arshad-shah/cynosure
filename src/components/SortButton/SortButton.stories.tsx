import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { nextSort, type SortDirection } from "../../foundations/sort.js";
import { arrowDown } from "../../icons/arrow-down.js";
import { arrowUp } from "../../icons/arrow-up.js";
import { chevronsUpDown } from "../../icons/chevrons-up-down.js";
import type { IconData } from "../../icons/types.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { SortButton } from "./SortButton.js";

const meta = {
  title: "Components/SortButton",
  component: SortButton,
  args: { children: "Name", onClick: fn(), fill: false, align: "start" },
  argTypes: {
    children: { control: "text" },
    direction: { control: "inline-radio", options: [undefined, "ascending", "descending"] },
    fill: { control: "boolean" },
    align: { control: "inline-radio", options: ["start", "end"] },
  },
} satisfies Meta<typeof SortButton>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The icon drawn: its first path, compared with the Facet icon's. */
const drawn = (button: HTMLElement) => button.querySelector("svg path")?.getAttribute("d");
const first = (icon: IconData) => (icon.body[0]?.[1] as { d?: string } | undefined)?.d;

/** A header that cycles ascending, descending, unsorted, as Table and DataGrid do. */
function Cycling({ onClick }: { onClick?: (() => void) | undefined }) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  return (
    <SortButton
      direction={sort?.direction}
      onClick={() => {
        setSort((s) => nextSort(s, "name"));
        onClick?.();
      }}
    >
      Name
    </SortButton>
  );
}

export const Default: Story = {
  tags: ["visual"],
  render: (args) => <Cycling onClick={args.onClick} />,
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Name" });
    // Unsorted: the both-ways icon; each press moves the sort on and the icon follows.
    await expect(drawn(button)).toBe(first(chevronsUpDown));
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(drawn(button)).toBe(first(arrowUp));
    await expect(button).toHaveAttribute("data-sorted");
    await userEvent.click(button);
    await expect(drawn(button)).toBe(first(arrowDown));
    await userEvent.click(button);
    await expect(drawn(button)).toBe(first(chevronsUpDown));
    await expect(button).not.toHaveAttribute("data-sorted");
  },
};

export const Keyboard: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Name" });
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const SortedUsesTheInkColour: Story = {
  render: (args) => (
    <div style={{ color: "var(--cy-color-muted)" }}>
      <SortButton {...args}>Unsorted</SortButton>
      <SortButton {...args} direction="descending">
        Sorted
      </SortButton>
    </div>
  ),
  play: async ({ canvas }) => {
    const plain = canvas.getByRole("button", { name: "Unsorted" });
    const sorted = canvas.getByRole("button", { name: "Sorted" });
    // An unsorted header takes its colour from the header; a sorted one is drawn in ink.
    await expect(getComputedStyle(plain).color).toBe(
      getComputedStyle(plain.parentElement as HTMLElement).color,
    );
    await expect(getComputedStyle(sorted).color).not.toBe(getComputedStyle(plain).color);
  },
};

export const EndAlignedPutsTheIconFirst: Story = {
  render: (args) => (
    <div style={{ display: "grid", justifyItems: "end" }}>
      <SortButton {...args} align="end">
        Seats
      </SortButton>
    </div>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Seats" });
    const icon = (button.querySelector("svg") as SVGElement).getBoundingClientRect();
    const label = (button.querySelector("span") as HTMLElement).getBoundingClientRect();
    await expect(icon.right).toBeLessThanOrEqual(label.left);
  },
};

export const FillsItsCell: Story = {
  args: { fill: true, children: "A heading too long for its narrow column" },
  render: (args) => (
    <div data-testid="cell" style={{ display: "flex", inlineSize: 120, blockSize: 40 }}>
      <SortButton {...args} tabIndex={-1} aria-keyshortcuts="Alt+ArrowLeft" data-cell="-1:0" />
    </div>
  ),
  play: async ({ canvas }) => {
    const cell = canvas.getByTestId("cell").getBoundingClientRect();
    const button = canvas.getByRole("button");
    const box = button.getBoundingClientRect();
    await expect({ width: box.width, height: box.height }).toEqual({
      width: cell.width,
      height: cell.height,
    });
    // The label is cut short rather than overflowing the cell.
    const label = button.querySelector("span") as HTMLElement;
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    // A grid's attributes reach the button.
    await expect(button).toHaveAttribute("tabindex", "-1");
    await expect(button).toHaveAttribute("aria-keyshortcuts", "Alt+ArrowLeft");
    await expect(button).toHaveAttribute("data-cell", "-1:0");
  },
};

export const HitArea: Story = {
  args: { className: "layout-probe" },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Name" });
    await expect(button).toHaveClass("cy-sort-button", "layout-probe");
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  },
};

export const FocusRing: Story = {
  args: { fill: true },
  render: (args) => (
    <div style={{ display: "flex", inlineSize: 160, blockSize: 32 }}>
      <SortButton {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Name" });
    // Filling a cell, the ring is drawn inside it.
    await waitFor(() => expect(getComputedStyle(button).boxShadow).toContain("inset"));
  },
};

export const StableUnderHostileHost: Story = {
  args: { direction: "ascending" },
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "gap",
      "min-height",
      "box-sizing",
      "padding-left",
      "border-top-width",
      "background-color",
    ];
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-sort-button", props);
    await expect(hostile).toEqual(clean);
  },
};

export const TouchHitArea: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, args, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Name" });
    // On a touch screen the header's button is a finger's height.
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
