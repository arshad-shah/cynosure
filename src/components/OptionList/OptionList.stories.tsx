import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useId, useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Icon } from "../../foundations/Icon/Icon.js";
import { heart } from "../../icons/index.js";
import { useListboxLayer } from "../../overlay/listbox-layer.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { OptionList, OptionListGroup, OptionListItem, OptionListNote } from "./OptionList.js";

interface Fruit {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  dimmed?: boolean;
  trailing?: string;
  group?: string;
}
const FRUITS: Fruit[] = [
  { value: "apple", label: "Apple", group: "Orchard" },
  { value: "pear", label: "Pear", description: "Conference", group: "Orchard" },
  { value: "banana", label: "Banana", group: "Tropical" },
  { value: "mango", label: "Mango", disabled: true, group: "Tropical" },
];

interface DemoProps {
  fruits?: Fruit[];
  grouped?: boolean;
  onChoose?: (value: string) => void;
  /** An action pinned under the options. */
  onManage?: () => void;
  style?: CSSProperties;
}

/** A button that drops an OptionList down (the parts Select, Combobox and TagInput put together). */
function Demo({ fruits = FRUITS, grouped = false, onChoose, onManage, style }: DemoProps) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState("apple");
  const [active, setActive] = useState(-1);
  useListboxLayer({ anchor, list, open, onClose: () => setOpen(false) });
  const item = (fruit: Fruit, index: number) => (
    <OptionListItem
      key={fruit.value}
      id={`${id}-${index}`}
      label={fruit.label}
      description={fruit.description}
      icon={fruit.value === "apple" ? <Icon icon={heart} /> : undefined}
      selected={fruit.value === chosen}
      active={index === active}
      disabled={fruit.disabled}
      dimmed={fruit.dimmed}
      trailing={fruit.trailing}
      onPointerMove={() => !fruit.disabled && setActive(index)}
      onClick={() => {
        if (fruit.disabled) return;
        setChosen(fruit.value);
        onChoose?.(fruit.value);
        setOpen(false);
      }}
    />
  );
  const groups = [...new Set(fruits.map((f) => f.group))];
  return (
    <div style={style}>
      <Button ref={anchor} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        Fruit
      </Button>
      <OptionList
        ref={list}
        id={id}
        label="Fruit"
        footer={
          onManage && {
            action: { label: "Manage fruit…", onSelect: onManage },
            id: `${id}-${fruits.length}`,
            active: active === fruits.length,
            onActive: () => setActive(fruits.length),
            onRun: () => {
              setOpen(false);
              onManage();
            },
          }
        }
      >
        {fruits.length === 0 && <OptionListNote>No fruit</OptionListNote>}
        {grouped
          ? groups.map((group) => (
              <OptionListGroup key={group} id={`${id}-${group}`} label={group}>
                {fruits.map((f, i) => (f.group === group ? item(f, i) : null))}
              </OptionListGroup>
            ))
          : fruits.map(item)}
      </OptionList>
    </div>
  );
}

const meta = {
  title: "Components/OptionList",
  component: OptionList,
  args: { id: "fruit", label: "Fruit" },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
  },
  render: () => <Demo grouped />,
} satisfies Meta<typeof OptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

const listbox = (root: HTMLElement) => root.querySelector('[role="listbox"]') as HTMLElement;
const option = (root: HTMLElement, name: string) =>
  [...root.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
    o.textContent?.startsWith(name),
  ) as HTMLElement;

const choose = fn();
const chooseDisabled = fn();

export const PressChoosesAndKeepsFocus: Story = {
  tags: ["visual"],
  render: () => <Demo onChoose={choose} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Fruit" });
    const list = listbox(canvasElement);
    await expect(list.matches(":popover-open")).toBe(false);
    await userEvent.click(button);
    await waitFor(() => expect(list.matches(":popover-open")).toBe(true));
    await shownFully(list);
    // At least as wide as the field it drops from, and below it.
    await expect(list.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      button.getBoundingClientRect().width,
    );
    await expect(list.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      button.getBoundingClientRect().bottom,
    );
    await expect(list).toHaveAccessibleName("Fruit");
    // The chosen option is marked and drawn in the accent colour, bolder.
    const apple = option(canvasElement, "Apple");
    const banana = option(canvasElement, "Banana");
    await expect(apple).toHaveAttribute("aria-selected", "true");
    await expect(banana).toHaveAttribute("aria-selected", "false");
    await expect(Number(getComputedStyle(apple).fontWeight)).toBeGreaterThan(
      Number(getComputedStyle(banana).fontWeight),
    );
    // Hovering makes an option active: it gets the soft highlight.
    await userEvent.hover(banana);
    await waitFor(() => expect(banana).toHaveAttribute("data-active"));
    await expect(getComputedStyle(banana).backgroundColor).not.toBe(getComputedStyle(apple).backgroundColor);
    // A press chooses without taking focus from the button.
    button.focus();
    await userEvent.click(banana);
    await expect(choose).toHaveBeenLastCalledWith("banana");
    await expect(button).toHaveFocus();
    await waitFor(() => expect(list.matches(":popover-open")).toBe(false));
  },
};

export const DisabledOptionsDescriptionsAndNotes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <Demo onChoose={chooseDisabled} />
      <Demo fruits={[]} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const [full, empty] = canvas.getAllByRole("button", { name: "Fruit" }) as [HTMLElement, HTMLElement];
    await userEvent.click(full);
    const mango = option(canvasElement, "Mango");
    await waitFor(() => expect(mango).toBeVisible());
    // A disabled option is announced as such and faded; pressing it does nothing.
    await expect(mango).toHaveAttribute("aria-disabled", "true");
    await expect(Number(getComputedStyle(mango).opacity)).toBeLessThan(1);
    await userEvent.click(mango);
    await expect(chooseDisabled).not.toHaveBeenCalled();
    // A description is a second, smaller, muted line under the label.
    const pear = option(canvasElement, "Pear");
    const [label, description] = [...pear.querySelectorAll("span span")] as [HTMLElement, HTMLElement];
    await expect(description).toHaveTextContent("Conference");
    await expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      label.getBoundingClientRect().bottom - 1,
    );
    await expect(Number.parseFloat(getComputedStyle(description).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(label).fontSize),
    );
    await userEvent.keyboard("{Escape}");
    // A note stands in for options: it is an option that cannot be chosen.
    await userEvent.click(empty);
    const note = await canvas.findByText("No fruit");
    await expect(note).toHaveAttribute("role", "option");
    await expect(note).toHaveAttribute("aria-disabled", "true");
    await expect(note).toHaveAttribute("aria-selected", "false");
  },
};

const MORE_FRUITS: Fruit[] = [
  { value: "apple", label: "Apple", trailing: "12" },
  { value: "pear", label: "Pear", trailing: "Ctrl+P", dimmed: true },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", dimmed: true },
  { value: "damson", label: "Damson" },
  { value: "fig", label: "Fig" },
  { value: "grape", label: "Grape" },
  { value: "kiwi", label: "Kiwi" },
];
const manage = fn();
const chooseDimmed = fn();

export const TrailingDimmedAndFooter: Story = {
  tags: ["visual"],
  render: () => (
    <Demo
      fruits={MORE_FRUITS}
      onChoose={chooseDimmed}
      onManage={manage}
      style={{ "--cy-option-list-max-height": "200px" } as CSSProperties}
    />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Fruit" });
    await userEvent.click(button);
    const list = listbox(canvasElement);
    await waitFor(() => expect(list.matches(":popover-open")).toBe(true));
    await shownFully(list);
    // Trailing content sits at the row's end, after the label, smaller and muted.
    const apple = option(canvasElement, "Apple");
    const count = canvas.getByText("12");
    const label = canvas.getByText("Apple");
    await expect(apple).toContainElement(count);
    await expect(count.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().right);
    await expect(apple.getBoundingClientRect().right - count.getBoundingClientRect().right).toBeLessThan(24);
    await expect(getComputedStyle(count).color).not.toBe(getComputedStyle(label).color);
    // A dimmed option reads muted but is not disabled: it can still be chosen.
    const pear = option(canvasElement, "Pear");
    const banana = option(canvasElement, "Banana");
    await expect(pear).not.toHaveAttribute("aria-disabled");
    await expect(getComputedStyle(pear).color).not.toBe(getComputedStyle(banana).color);
    // The footer is an option of the listbox, after the last option, pinned to the bottom while the options scroll.
    const footer = option(canvasElement, "Manage fruit");
    const options = [...list.querySelectorAll('[role="option"]')];
    await expect(options.at(-1)).toBe(footer);
    await expect(footer).toHaveAttribute("aria-selected", "false");
    // The list draws the action itself: its id, no icon when the action has none, the pointer making it active.
    await expect(footer.id.endsWith(`-${MORE_FRUITS.length}`)).toBe(true);
    await expect(footer.querySelector("svg")).toBeNull();
    await userEvent.hover(footer);
    await waitFor(() => expect(footer).toHaveAttribute("data-active"));
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    const pinned = () =>
      expect(
        Math.abs(list.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom),
      ).toBeLessThan(16);
    await pinned();
    list.scrollTop = 40;
    await pinned();
    // It is set off from the options by a line.
    await expect(getComputedStyle(footer.parentElement as HTMLElement).borderTopStyle).toBe("solid");
    // Choosing a dimmed option works; pressing the footer runs its action and keeps focus in the field.
    await userEvent.click(pear);
    await expect(chooseDimmed).toHaveBeenLastCalledWith("pear");
    await userEvent.click(button);
    await waitFor(() => expect(list.matches(":popover-open")).toBe(true));
    button.focus();
    await userEvent.click(option(canvasElement, "Manage fruit"));
    await expect(manage).toHaveBeenCalledTimes(1);
    await expect(button).toHaveFocus();
  },
};

export const GroupsAreNamedByTheirHeadings: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Fruit" }));
    const list = listbox(canvasElement);
    await waitFor(() => expect(list.matches(":popover-open")).toBe(true));
    const groups = [...list.querySelectorAll<HTMLElement>('[role="group"]')];
    await expect(groups).toHaveLength(2);
    await expect(groups[0]).toHaveAccessibleName("Orchard");
    await expect(groups[1]).toHaveAccessibleName("Tropical");
    // The heading is not an option, and reads smaller than the options.
    const heading = canvas.getByText("Orchard");
    await expect(heading.closest('[role="option"]')).toBeNull();
    await expect(Number.parseFloat(getComputedStyle(heading).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(option(canvasElement, "Apple")).fontSize),
    );
  },
};

export const TokensRestyleTheList: Story = {
  render: () => (
    <Demo
      style={
        {
          "--cy-option-list-bg": "rgb(250, 240, 220)",
          "--cy-option-list-active-bg": "rgb(220, 235, 255)",
          "--cy-option-list-max-height": "60px",
        } as CSSProperties
      }
    />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Fruit" }));
    const list = listbox(canvasElement);
    await waitFor(() => expect(list.matches(":popover-open")).toBe(true));
    await shownFully(list);
    await expect(getComputedStyle(list).backgroundColor).toBe("rgb(250, 240, 220)");
    await expect(list.getBoundingClientRect().height).toBeLessThanOrEqual(60);
    const pear = option(canvasElement, "Pear");
    await userEvent.hover(pear);
    await waitFor(() => expect(getComputedStyle(pear).backgroundColor).toBe("rgb(220, 235, 255)"));
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Demo fruits={MORE_FRUITS} onManage={() => {}} />
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Fruit" }));
    const apple = option(canvasElement, "Apple");
    await waitFor(() => expect(apple).toBeVisible());
    // The icon leads on the right, the text follows to its left, and the trailing count ends the row on the left.
    const icon = apple.querySelector("svg") as SVGElement;
    const text = apple.querySelector("span") as HTMLElement;
    await expect(icon.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      text.getBoundingClientRect().right - 1,
    );
    const count = canvas.getByText("12");
    await expect(count.getBoundingClientRect().right).toBeLessThan(
      canvas.getByText("Apple").getBoundingClientRect().left,
    );
  },
};

export const StableUnderHostileHost: Story = {
  render: () => (
    <>
      <Demo grouped />
      <Demo fruits={MORE_FRUITS} onManage={() => {}} />
    </>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    for (const button of canvas.getAllByRole("button", { name: "Fruit" })) {
      await userEvent.click(button);
      await waitFor(() => expect(button.nextElementSibling?.matches(":popover-open")).toBe(true));
    }
    for (const selector of [
      ".cy-option-list",
      ".cy-option-list-option",
      ".cy-option-list-label",
      ".cy-option-list-description",
      ".cy-option-list-group-label",
      ".cy-option-list-trailing",
      ".cy-option-list-footer",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "font-size",
        "line-height",
        "padding-top",
        "padding-left",
        "box-sizing",
        "letter-spacing",
        "text-transform",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const TouchSizedOptions: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Fruit" }) });
    await waitFor(() => expect(listbox(canvasElement).matches(":popover-open")).toBe(true));
    for (const o of canvasElement.querySelectorAll<HTMLElement>('[role="option"]'))
      await expect(o.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    // A tap chooses.
    await userEvent.pointer({ keys: "[TouchA]", target: option(canvasElement, "Banana") });
    await waitFor(() => expect(option(canvasElement, "Banana")).toHaveAttribute("aria-selected", "true"));
  },
};
