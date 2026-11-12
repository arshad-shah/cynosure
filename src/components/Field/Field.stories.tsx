import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import type { FieldRender } from "../../foundations/field.js";
import { InputBase } from "../../foundations/InputBase/InputBase.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Field } from "./Field.js";

const meta = {
  title: "Components/Field",
  component: Field,
  args: {
    label: "Email",
    description: "We never share it.",
    required: false,
    size: "md",
    children: (f) => <InputBase id={f.id} aria-describedby={f.describedBy} invalid={f.invalid} />,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    layout: { control: "inline-radio", options: ["stack", "split"] },
    width: { control: "inline-radio", options: ["sm", "md", "lg", "full"] },
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LabelAndDescription: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAccessibleDescription("We never share it.");
  },
};

export const ErrorAnnouncesAndMarksInvalid: Story = {
  tags: ["visual"],
  args: { error: "Enter a valid email." },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("We never share it. Enter a valid email.");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a valid email.");
  },
};

export const RequiredMarkerIsDrawnNotTyped: Story = {
  args: {
    required: true,
    children: (f) => <InputBase id={f.id} required aria-describedby={f.describedBy} />,
  },
  play: async ({ canvasElement, canvas }) => {
    const label = canvasElement.querySelector(".cy-field-label") as HTMLElement;
    await expect(label.textContent).toBe("Email");
    await expect(getComputedStyle(label, "::after").content).not.toBe("none");
    await expect(canvas.getByRole("textbox", { name: "Email" })).toBeRequired();
  },
};

export const GroupLabelsAGroup: Story = {
  args: { group: true, children: (f) => <div aria-describedby={f.describedBy}>options</div> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Email" })).toBeInTheDocument();
  },
};

/** A bare input sized like the field controls (TextField, Select), which are border-box. */
const input = (f: FieldRender) => (
  <InputBase
    id={f.id}
    aria-describedby={f.describedBy}
    invalid={f.invalid}
    style={{ boxSizing: "border-box" }}
  />
);
const rect = (el: Element | null) => (el as Element).getBoundingClientRect();

export const SplitPutsTheControlAtTheEnd: Story = {
  tags: ["visual"],
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {(["ltr", "rtl"] as const).map((dir) => (
        <div key={dir} dir={dir} data-testid={dir} style={{ inlineSize: 560 }}>
          <Field layout="split" width="md" label={`Font ${dir}`} description="Used in the query editor.">
            {input}
          </Field>
        </div>
      ))}
      <div data-testid="narrow" style={{ inlineSize: 240 }}>
        <Field layout="split" width="md" label="Font narrow" description="Used in the query editor.">
          {input}
        </Field>
      </div>
      <div data-testid="error" style={{ inlineSize: 560 }}>
        <Field layout="split" label="Port" error="Enter a number." required>
          {input}
        </Field>
      </div>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const part = (id: string, selector: string) => canvas.getByTestId(id).querySelector(selector);
    for (const dir of ["ltr", "rtl"] as const) {
      const root = rect(part(dir, ".cy-field"));
      const label = rect(part(dir, ".cy-field-label"));
      const description = rect(part(dir, ".cy-field-description"));
      const control = rect(part(dir, "input"));
      // Label above description at the start; the control on the same row at the end, centred on the text.
      await expect(description.top).toBeGreaterThanOrEqual(label.bottom);
      const textMid = (label.top + description.bottom) / 2;
      await expect(Math.abs(control.top + control.height / 2 - textMid)).toBeLessThan(2);
      if (dir === "ltr") {
        await expect(control.left).toBeGreaterThan(Math.max(label.right, description.right));
        await expect(Math.round(control.right)).toBe(Math.round(root.right));
      } else {
        await expect(control.right).toBeLessThan(Math.min(label.left, description.left));
        await expect(Math.round(control.left)).toBe(Math.round(root.left));
      }
      // The label still names the control and the description still describes it; pressing the label focuses it.
      const box = canvas.getByRole("textbox", { name: `Font ${dir}` });
      await expect(box).toHaveAccessibleDescription("Used in the query editor.");
      await userEvent.click(canvas.getByText(`Font ${dir}`));
      await expect(box).toHaveFocus();
    }
    // Narrow: the control moves under the description and stays inside the field.
    const narrow = rect(part("narrow", ".cy-field"));
    const narrowControl = rect(part("narrow", "input"));
    await expect(narrowControl.top).toBeGreaterThanOrEqual(
      rect(part("narrow", ".cy-field-description")).bottom,
    );
    await expect(narrowControl.left).toBeGreaterThanOrEqual(narrow.left);
    await expect(narrowControl.right).toBeLessThanOrEqual(narrow.right + 0.5);
    // An error is announced under the text, and the control is still described by it.
    const port = canvas.getByRole("textbox", { name: "Port" });
    await expect(port).toHaveAccessibleDescription("Enter a number.");
    await expect(port).toHaveAttribute("aria-invalid", "true");
    await expect(rect(part("error", ".cy-field-error")).top).toBeGreaterThanOrEqual(
      rect(part("error", ".cy-field-label")).bottom,
    );
    // Host CSS cannot break the row.
    for (const selector of [".cy-field", ".cy-field-text", ".cy-field-control"]) {
      const { clean, hostile } = computeUnderHostileHost(canvas.getByTestId("ltr"), selector, [
        "display",
        "flex-wrap",
        "align-items",
        "inline-size",
        "column-gap",
      ]);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};

export const ControlWidthsLineUp: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, inlineSize: 600 }} data-testid="column">
      <Field layout="split" width="md" label="Theme" description="Light, dark or the system's.">
        {input}
      </Field>
      <Field layout="split" width="md" label="A much longer setting label" description="Short.">
        {input}
      </Field>
      <Field layout="split" width="sm" label="Small">
        {input}
      </Field>
      <Field layout="split" width="lg" label="Large">
        {input}
      </Field>
      <Field width="sm" label="Stacked small">
        {input}
      </Field>
      <Field width="full" label="Stacked full">
        {input}
      </Field>
      <Field layout="split" label="Natural">
        {(f) => <InputBase id={f.id} size={4} style={{ inlineSize: "auto" }} />}
      </Field>
      <div style={{ inlineSize: 120 }}>
        <Field width="lg" label="Squeezed">
          {input}
        </Field>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const control = (name: string) => rect(canvas.getByRole("textbox", { name }));
    const token = (name: string) => {
      const probe = document.createElement("div");
      probe.style.inlineSize = name;
      canvas.getByTestId("column").append(probe);
      const width = probe.getBoundingClientRect().width;
      probe.remove();
      return width;
    };
    // Settings rows with the same width line up, whatever their labels.
    await expect(control("Theme").left).toBe(control("A much longer setting label").left);
    await expect(control("Theme").width).toBe(control("A much longer setting label").width);
    // Each width is its token, smallest to largest; full is the whole field.
    await expect(control("Small").width).toBeCloseTo(token("var(--cy-field-control-width-sm, 160px)"), 0);
    await expect(control("Theme").width).toBeCloseTo(token("var(--cy-field-control-width-md, 256px)"), 0);
    await expect(control("Large").width).toBeCloseTo(token("var(--cy-field-control-width-lg, 384px)"), 0);
    await expect(control("Small").width).toBeLessThan(control("Theme").width);
    await expect(control("Theme").width).toBeLessThan(control("Large").width);
    // The stacked layout takes a width too.
    await expect(control("Stacked small").width).toBe(control("Small").width);
    await expect(control("Stacked full").width).toBe(600);
    // Without a width, a split control keeps its own size at the end.
    await expect(control("Natural").width).toBeLessThan(control("Small").width);
    await expect(Math.round(control("Natural").right)).toBe(Math.round(control("Theme").right));
    // A width never pushes the control out of a narrower field.
    await expect(control("Squeezed").width).toBeLessThanOrEqual(120);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-field-label", [
      "font-size",
      "font-weight",
      "color",
      "text-transform",
    ]);
    await expect(hostile).toEqual(clean);
  },
};
