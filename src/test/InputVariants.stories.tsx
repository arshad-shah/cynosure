import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Button } from "../components/Button/Button.js";
import { IconButton } from "../components/IconButton/IconButton.js";
import { Inline } from "../components/Inline/Inline.js";
import { ProgressBar } from "../components/ProgressBar/ProgressBar.js";
import { SearchField } from "../components/SearchField/SearchField.js";
import { SegmentedControl } from "../components/SegmentedControl/SegmentedControl.js";
import { Select } from "../components/Select/Select.js";
import { Stack } from "../components/Stack/Stack.js";
import { TextArea } from "../components/TextArea/TextArea.js";
import { TextField } from "../components/TextField/TextField.js";
import { copy, filter, list, mail, table } from "../icons/index.js";

const meta = { title: "Contracts/Input variants" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = ["sm", "md", "lg"] as const;
const HEIGHT = { sm: 26, md: 32, lg: 40 };
const fruit = [
  { value: "apple", label: "Apple" },
  { value: "pear", label: "Pear" },
];

export const SizesLineUpWithButtons: Story = {
  tags: ["visual"],
  render: () => (
    <Stack gap="6">
      {SIZES.map((size) => (
        <Inline key={size} gap="3" align="end" data-testid={`row-${size}`}>
          <TextField size={size} label={`Name ${size}`} placeholder="Ada Lovelace" />
          <SearchField size={size} label={`Search ${size}`} labelHidden placeholder="Search" />
          <Select size={size} label={`Fruit ${size}`} labelHidden options={fruit} defaultValue="apple" />
          <Button size={size}>Save</Button>
        </Inline>
      ))}
    </Stack>
  ),
  play: async ({ canvas }) => {
    for (const size of SIZES) {
      const row = canvas.getByTestId(`row-${size}`);
      const controls = [
        ...row.querySelectorAll(".cy-text-field"),
        row.querySelector('[role="combobox"]'),
        row.querySelector("button.cy-button"),
      ] as HTMLElement[];
      const bottoms = controls.map((el) => Math.round(el.getBoundingClientRect().bottom));
      for (const el of controls)
        await expect(Math.round(el.getBoundingClientRect().height)).toBe(HEIGHT[size]);
      await expect(new Set(bottoms).size).toBe(1);
    }
  },
};

const DENSE = ["xs", "sm"] as const;

export const ExtraSmallRowBesideSmall: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxInlineSize: 760 }}>
      {DENSE.map((size) => (
        <div
          key={size}
          data-testid={`dense-${size}`}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <TextField
            size={size}
            label={`Filter ${size}`}
            labelHidden
            iconStart={filter}
            placeholder="Filter"
          />
          <Select size={size} label={`Fruit ${size}`} labelHidden options={fruit} defaultValue="apple" />
          <SegmentedControl
            size={size}
            label={`View ${size}`}
            defaultValue="table"
            options={[
              { value: "table", label: "Table", icon: table },
              { value: "list", label: "List", icon: list },
            ]}
          />
          <Button size={size} variant="solid" tone="accent">
            Run
          </Button>
          <IconButton size={size} icon={copy} label={`Copy ${size}`} variant="ghost" />
          <div style={{ flex: "1 0 80px" }}>
            <ProgressBar size={size} label={`Loading ${size}`} labelHidden value={60} />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // The xs controls are all 20px tall and centred on one line; sm's are 26px. The hit areas stay 24px or more.
    for (const [size, height] of [
      ["xs", 20],
      ["sm", 26],
    ] as const) {
      const row = canvas.getByTestId(`dense-${size}`);
      const controls = [
        row.querySelector(".cy-text-field"),
        row.querySelector('[role="combobox"]'),
        row.querySelector('[role="radiogroup"]'),
        ...row.querySelectorAll("button.cy-button"),
      ] as HTMLElement[];
      const middles = controls.map((el) => {
        const box = el.getBoundingClientRect();
        return Math.round(box.top + box.height / 2);
      });
      for (const el of controls) await expect(Math.round(el.getBoundingClientRect().height)).toBe(height);
      await expect(Math.max(...middles) - Math.min(...middles)).toBeLessThanOrEqual(1);
      const track = row.querySelector(".cy-progress-bar-track") as Element;
      await expect(track.getBoundingClientRect().height).toBeLessThan(height / 4);
    }
    const xs = canvas.getByTestId("dense-xs");
    for (const el of xs.querySelectorAll(
      'button.cy-button, [role="combobox"], .cy-segmented-control-segment',
    ))
      await expect(Number.parseFloat(getComputedStyle(el, "::before").height)).toBeGreaterThanOrEqual(24);
    await expect(
      canvas.getByRole("textbox", { name: "Filter xs" }).getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(24);
  },
};

export const States: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 260px))", gap: 16 }}>
      <TextField label="Empty" placeholder="name@example.com" iconStart={mail} />
      <TextField label="Filled" defaultValue="ada@lovelace.dev" iconStart={mail} clearable />
      <TextField label="Description" description="We never share it." defaultValue="ada" />
      <TextField label="Error" error="Enter a valid email." defaultValue="ada@" required />
      <TextField label="Disabled" disabled defaultValue="locked" />
      <TextField label="Read only" readOnly defaultValue="read only" />
      <Select label="Select error" error="Choose one." options={fruit} defaultValue="" required />
      <Select label="Select disabled" disabled options={fruit} defaultValue="pear" />
      <TextArea label="Notes" defaultValue={"Line one\nLine two"} maxLength={120} />
      <TextArea label="Notes error" error="Too short." defaultValue="hi" />
    </div>
  ),
  play: async ({ canvas }) => {
    const error = canvas.getByRole("textbox", { name: "Error" });
    await expect(error).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("textbox", { name: "Disabled" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "Read only" })).toHaveAttribute("readonly");
  },
};

export const NeighboursOfAnErrorStayAligned: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 220px)", gap: 16 }}>
      <TextField label="With error" error="Something is wrong here." description="And a description." />
      <TextField label="Plain" />
      <Select label="Select with error" error="Choose one." options={fruit} defaultValue="" />
      <Select label="Select plain" options={fruit} defaultValue="pear" />
    </div>
  ),
  play: async ({ canvas }) => {
    const top = (el: Element) => Math.round(el.getBoundingClientRect().top);
    const a = canvas.getByRole("textbox", { name: "With error" }).closest(".cy-text-field") as Element;
    const b = canvas.getByRole("textbox", { name: "Plain" }).closest(".cy-text-field") as Element;
    await expect(top(b)).toBe(top(a));
    await expect(top(canvas.getByRole("combobox", { name: "Select plain" }))).toBe(
      top(canvas.getByRole("combobox", { name: "Select with error" })),
    );
  },
};

export const ReadOnlyLooksDifferentFromEditable: Story = {
  render: () => (
    <Stack gap="4">
      <TextField label="Editable" defaultValue="value" />
      <TextField label="Read only" readOnly defaultValue="value" />
      <TextArea label="Area read only" readOnly defaultValue="value" />
    </Stack>
  ),
  play: async ({ canvas }) => {
    const shell = (name: string) =>
      getComputedStyle(
        canvas.getByRole("textbox", { name }).closest(".cy-text-field, .cy-text-area") as Element,
      );
    await expect(shell("Read only").backgroundColor).not.toBe(shell("Editable").backgroundColor);
    // TextArea's visible box is the textarea itself.
    const area = getComputedStyle(canvas.getByRole("textbox", { name: "Area read only" }));
    await expect(area.backgroundColor).toBe(shell("Read only").backgroundColor);
  },
};
