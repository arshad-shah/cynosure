import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { settled } from "../../test/settle.js";
import { RadioGroup } from "./RadioGroup.js";

const options = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly", description: "Every Monday" },
  { value: "never", label: "Never", disabled: true },
  { value: "monthly", label: "Monthly" },
];

const meta = {
  title: "Components/Controls/RadioGroup",
  component: RadioGroup,
  args: {
    label: "Digest",
    name: "digest",
    options,
    onChange: fn(),
    size: "md",
    tone: "accent",
    orientation: "vertical",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    variant: { control: "inline-radio", options: ["list", "card"] },
    columns: { control: { type: "number", min: 1, max: 6 } },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ArrowKeysSelectAndWrapSkippingDisabled: Story = {
  tags: ["visual"],
  args: { defaultValue: "weekly" },
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "Digest" })).toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "Daily" })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("daily");
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toHaveAccessibleDescription("Every Monday");
  },
};

export const FormResetAndRequired: Story = {
  render: (args) => (
    <form data-testid="form">
      <RadioGroup {...args} required defaultValue={undefined} />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByText("Monthly"));
    await expect(new FormData(form).get("digest")).toBe("monthly");
    form.reset();
    await expect(new FormData(form).get("digest")).toBeNull();
  },
};

function Controlled() {
  const [value, setValue] = useState("daily");
  return (
    <div>
      <RadioGroup label="Digest" name="c" options={options} value={value} onChange={setValue} />
      <output data-testid="out">{value}</output>
    </div>
  );
}

export const ControlledValue: Story = {
  render: () => <Controlled />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Weekly"));
    await expect(canvas.getByTestId("out")).toHaveTextContent("weekly");
    await expect(canvas.getByRole("radio", { name: "Weekly" })).toBeChecked();
  },
};

export const CoarsePointerRows: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement }) => {
    for (const row of canvasElement.querySelectorAll(".cy-choice"))
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

const sample = (font: string) => <span style={{ fontFamily: font, fontSize: "1.4rem" }}>Ada Lovelace</span>;
const cards = [
  { value: "script", label: "Script", media: sample("cursive") },
  { value: "serif", label: "Serif", media: sample("Georgia, serif") },
  { value: "sans", label: "Sans", media: sample("var(--cy-font-sans)") },
  { value: "mono", label: "Mono", media: sample("var(--cy-font-mono)") },
  {
    value: "slanted",
    label: "Slanted",
    description: "Not for this document",
    media: sample("serif"),
    disabled: true,
  },
  { value: "plain", label: "Plain", media: sample("system-ui") },
];
const cardOf = (radio: HTMLElement) => radio.closest(".cy-choice") as HTMLElement;

/** `variant="card"`: each option is a card with a picture; its label (not the picture) names the radio. */
export const CardsChooseByPicture: Story = {
  args: { label: "Signature style", variant: "card", columns: 3, options: cards, defaultValue: "serif" },
  render: (args) => (
    <div style={{ inlineSize: 600 }}>
      <RadioGroup {...args} />
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    await expect(canvas.getByRole("radio", { name: "Serif" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Slanted" })).toHaveAccessibleDescription(
      "Not for this document",
    );
    // A press anywhere on the card, the picture included, chooses it.
    await userEvent.click(canvas.getAllByText("Ada Lovelace")[2] as HTMLElement);
    await expect(canvas.getByRole("radio", { name: "Sans" })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("sans");
    // The chosen card looks chosen once its short fade ends: border and background differ from an unchosen one.
    const chosen = cardOf(canvas.getByRole("radio", { name: "Sans" }));
    await settled(chosen);
    const other = getComputedStyle(cardOf(canvas.getByRole("radio", { name: "Script" })));
    await expect(getComputedStyle(chosen).borderTopColor).not.toBe(other.borderTopColor);
    await expect(getComputedStyle(chosen).backgroundColor).not.toBe(other.backgroundColor);
    // The native radio is there for forms and assistive tech, but not drawn.
    await expect(
      canvas.getByRole("radio", { name: "Sans" }).getBoundingClientRect().width,
    ).toBeLessThanOrEqual(1);
  },
};

/** Arrows in a grid: Left/Right wrap through the cards (skipping disabled), Up/Down move a row and stay at the edges. */
export const CardsMoveAsAGrid: Story = {
  args: { label: "Signature style", variant: "card", columns: 3, options: cards, defaultValue: "script" },
  render: (args) => (
    <div style={{ inlineSize: 600 }}>
      <RadioGroup {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const radio = (name: string) => canvas.getByRole("radio", { name });
    // Three a row.
    await expect(Math.round(cardOf(radio("Sans")).getBoundingClientRect().top)).toBe(
      Math.round(cardOf(radio("Script")).getBoundingClientRect().top),
    );
    await userEvent.tab();
    await expect(radio("Script")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(radio("Mono")).toHaveFocus();
    await expect(radio("Mono")).toBeChecked();
    await userEvent.keyboard("{ArrowDown}");
    await expect(radio("Mono")).toHaveFocus(); // the last row: stays put
    await userEvent.keyboard("{ArrowRight}");
    await expect(radio("Plain")).toHaveFocus(); // skips the disabled card
    await userEvent.keyboard("{ArrowRight}");
    await expect(radio("Script")).toHaveFocus(); // wraps
    await userEvent.keyboard("{ArrowUp}");
    await expect(radio("Script")).toHaveFocus(); // the first row: stays put
    await userEvent.keyboard("{ArrowLeft}");
    await expect(radio("Plain")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(radio("Sans")).toHaveFocus();
    await expect(radio("Sans")).toBeChecked();
  },
};

/** A narrow container wraps the grid so a card is never under its minimum width; Up/Down follow the columns shown. */
export const CardsWrapOnANarrowContainer: Story = {
  args: { label: "Signature style", variant: "card", columns: 3, options: cards, defaultValue: "script" },
  render: (args) => (
    <div style={{ inlineSize: 300 }}>
      <RadioGroup {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const radio = (name: string) => canvas.getByRole("radio", { name });
    const top = (name: string) => Math.round(cardOf(radio(name)).getBoundingClientRect().top);
    // Two a row at 300px.
    await expect(top("Serif")).toBe(top("Script"));
    await expect(top("Sans")).toBeGreaterThan(top("Script"));
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect(radio("Sans")).toHaveFocus();
  },
};

/** Cards keep the native radios: a form submits the chosen value. */
export const CardsSubmitWithAForm: Story = {
  args: { label: "Signature style", name: "style", variant: "card", options: cards, defaultValue: "mono" },
  render: (args) => (
    <form aria-label="Sign">
      <RadioGroup {...args} />
    </form>
  ),
  play: async ({ canvas }) => {
    const form = canvas.getByRole("form", { name: "Sign" }) as HTMLFormElement;
    await expect(new FormData(form).get("style")).toBe("mono");
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-radio-group-radio", [
      "width",
      "height",
      "border-radius",
      "background-color",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
