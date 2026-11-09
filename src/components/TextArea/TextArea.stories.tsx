import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { TextArea } from "./TextArea.js";

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  args: { label: "Notes", onChange: fn(), rows: 2, maxRows: 4, size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["outline", "soft"] },
    rows: { control: { type: "number", min: 1, max: 10 } },
    maxRows: { control: { type: "number", min: 1, max: 30 } },
    maxLength: { control: { type: "number", min: 1 } },
    showCount: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
} satisfies Meta<typeof TextArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GrowsThenScrolls: Story = {
  tags: ["visual"],
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const start = area.getBoundingClientRect().height;
    await userEvent.type(area, "one{enter}two{enter}three");
    const grown = area.getBoundingClientRect().height;
    await expect(grown).toBeGreaterThan(start);
    await userEvent.type(area, "{enter}4{enter}5{enter}6{enter}7{enter}8");
    const capped = area.getBoundingClientRect().height;
    await expect(capped).toBeGreaterThan(grown);
    await userEvent.type(area, "{enter}9{enter}10");
    await expect(area.getBoundingClientRect().height).toBe(capped);
    await expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
  },
};

export const CounterAndMaxLength: Story = {
  args: { maxLength: 20, showCount: true },
  play: async ({ canvas, args, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.type(area, "hello");
    const counter = canvasElementCounter(area);
    await expect(counter).toHaveTextContent("5 / 20");
    await expect(counter).toHaveAttribute("aria-live", "polite");
    await expect(area.getAttribute("aria-describedby")).toContain(counter.id);
    await userEvent.type(area, " world, this is far too long");
    await expect((area as HTMLTextAreaElement).value).toHaveLength(20);
    await expect(args.onChange).toHaveBeenLastCalledWith((area as HTMLTextAreaElement).value);
  },
};

const canvasElementCounter = (area: HTMLElement) =>
  area.closest(".cy-field")?.querySelector(".cy-text-area-count") as HTMLElement;

export const CounterLabelsOverride: Story = {
  args: {
    maxLength: 10,
    showCount: true,
    labels: { count: (n: number, max?: number) => `${(max ?? 0) - n} left` },
  },
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.type(area, "abc");
    await expect(canvasElementCounter(area)).toHaveTextContent("7 left");
  },
};

export const FormResetRestoresValueCountAndHeight: Story = {
  render: () => (
    <form data-testid="form">
      <TextArea label="Notes" name="notes" defaultValue="a" rows={2} maxRows={6} maxLength={50} showCount />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    const area = canvas.getByRole("textbox", { name: "Notes" });
    const start = area.getBoundingClientRect().height;
    await userEvent.type(area, "{enter}b{enter}c{enter}d");
    await expect(new FormData(form).get("notes")).toBe("a\nb\nc\nd");
    form.reset();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await expect(area).toHaveValue("a");
    await expect(canvasElementCounter(area)).toHaveTextContent("1 / 50");
    await expect(area.getBoundingClientRect().height).toBe(start);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, "textarea", [
      "font-size",
      "line-height",
      "padding-top",
      "border-top-width",
      "color",
      "height",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
