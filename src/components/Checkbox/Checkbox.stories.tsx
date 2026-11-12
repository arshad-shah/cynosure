import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { rgb, textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { settled } from "../../test/settle.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Checkbox } from "./Checkbox.js";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { label: "Email me updates", onChange: fn(), size: "md", tone: "accent" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: { control: "select", options: ["accent", "neutral", "danger", "success", "warning", "info"] },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    strikeWhenChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ClickSpaceAndLabelToggle: Story = {
  tags: ["visual"],
  args: { description: "Monthly, no spam." },
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Email me updates" });
    await expect(box).toHaveAccessibleDescription("Monthly, no spam.");
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
    await userEvent.click(canvas.getByText("Email me updates"));
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenNthCalledWith(1, true);
    await expect(args.onChange).toHaveBeenNthCalledWith(2, false);
    await expect(args.onChange).toHaveBeenNthCalledWith(3, true);
  },
};

export const DoubleClickAndHeldSpace: Story = {
  play: async ({ canvas, args, userEvent }) => {
    const box = canvas.getByRole("checkbox");
    await userEvent.dblClick(box);
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(box).not.toBeChecked();
    box.focus();
    await userEvent.keyboard("{ >6}{/ }");
    await expect(args.onChange).toHaveBeenCalledTimes(3);
    await expect(box).toBeChecked();
  },
};

export const IndeterminateIsMixed: Story = {
  tags: ["visual"],
  args: { indeterminate: true, label: "Select all" },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    await expect(box.indeterminate).toBe(true);
    await expect(box).toBePartiallyChecked();
  },
};

export const FormValueResetAndRequired: Story = {
  render: () => (
    <form data-testid="form">
      <Checkbox label="Accept terms" name="terms" value="yes" required />
      <Checkbox label="Newsletter" name="news" value="on" defaultChecked />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(form.checkValidity()).toBe(false);
    await expect(new FormData(form).get("terms")).toBeNull();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Accept terms" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Newsletter" }));
    await expect(form.checkValidity()).toBe(true);
    await expect(new FormData(form).get("terms")).toBe("yes");
    await expect(new FormData(form).get("news")).toBeNull();
    form.reset();
    await expect(canvas.getByRole("checkbox", { name: "Accept terms" })).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "Newsletter" })).toBeChecked();
  },
};

export const CheckedShowsMark: Story = {
  tags: ["visual"],
  args: { defaultChecked: true },
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector(".cy-checkbox-mark") as Element;
    await expect(getComputedStyle(mark).opacity).toBe("1");
  },
};

export const CoarsePointerRow: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvasElement, canvas, args, userEvent }) => {
    const row = canvasElement.querySelector(".cy-choice") as HTMLElement;
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByText("Email me updates") });
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const box = computeUnderHostileHost(canvasElement, ".cy-checkbox", [
      "width",
      "height",
      "border-radius",
      "background-color",
    ]);
    await expect(box.hostile).toEqual(box.clean);
    const label = computeUnderHostileHost(canvasElement, ".cy-choice-label", [
      "font-size",
      "font-weight",
      "color",
    ]);
    await expect(label.hostile).toEqual(label.clean);
  },
};

/** A colour token as painted sRGB, resolved where `near` is (so it follows that element's theme). */
function token(near: Element, name: string) {
  const probe = document.createElement("i");
  probe.style.color = `var(${name})`;
  near.after(probe);
  const value = rgb(getComputedStyle(probe).color);
  probe.remove();
  return value;
}
const part = (root: Element, name: "label" | "description") =>
  root.querySelector(`.cy-choice-${name}`) as HTMLElement;
/** The label's strike and the painted colours of the label and the description, once any transition has ended. */
async function look(root: Element) {
  await settled(root);
  const label = getComputedStyle(part(root, "label"));
  return {
    line: label.textDecorationLine,
    label: rgb(label.color),
    description: rgb(getComputedStyle(part(root, "description")).color),
  };
}

export const StrikeWhenCheckedByPointerAndKeyboard: Story = {
  tags: ["visual"],
  args: { strikeWhenChecked: true, label: "Buy oat milk", description: "Two cartons" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Buy oat milk" });
    const ink = token(box, "--cy-color-ink");
    const muted = token(box, "--cy-color-muted");
    await expect(await look(canvasElement)).toEqual({ line: "none", label: ink, description: muted });
    // Pointer: ticking strikes and mutes the label; the description stays muted with it.
    await userEvent.click(box);
    await waitFor(
      async () =>
        expect(await look(canvasElement)).toEqual({ line: "line-through", label: muted, description: muted }),
      { timeout: 5000 },
    );
    // The strike is a hairline in the label's own colour, never thinner than the border width.
    const label = getComputedStyle(part(canvasElement, "label"));
    await expect(Number.parseFloat(label.textDecorationThickness)).toBeGreaterThanOrEqual(1);
    await expect(rgb(label.textDecorationColor)).toEqual(muted);
    // Keyboard: Space unticks and the label is plain again, then ticks and strikes again.
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
    await waitFor(async () => expect(await look(canvasElement)).toMatchObject({ line: "none", label: ink }), {
      timeout: 5000,
    });
    await userEvent.keyboard(" ");
    await waitFor(
      async () => expect(await look(canvasElement)).toMatchObject({ line: "line-through", label: muted }),
      { timeout: 5000 },
    );
  },
};

function ControlledTask({ onChange }: { onChange?: ((checked: boolean) => void) | undefined }) {
  const [done, setDone] = useState(true);
  return (
    <Checkbox
      label="Book flights"
      description="Dublin to Lisbon"
      strikeWhenChecked
      checked={done}
      onChange={(next) => {
        setDone(next);
        onChange?.(next);
      }}
    />
  );
}

export const StrikeFollowsAControlledValue: Story = {
  render: (args) => <ControlledTask onChange={args.onChange} />,
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Book flights" });
    const ink = token(box, "--cy-color-ink");
    const muted = token(box, "--cy-color-muted");
    // Checked from the start: struck without any interaction.
    await expect(await look(canvasElement)).toMatchObject({ line: "line-through", label: muted });
    await userEvent.click(canvas.getByText("Book flights"));
    await expect(args.onChange).toHaveBeenLastCalledWith(false);
    await waitFor(async () => expect(await look(canvasElement)).toMatchObject({ line: "none", label: ink }));
    box.focus();
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await waitFor(async () =>
      expect(await look(canvasElement)).toMatchObject({ line: "line-through", label: muted }),
    );
  },
};

export const OnlyAStrikeCheckboxThatIsFullyCheckedIsStruck: Story = {
  render: () => (
    <div style={{ display: "grid" }}>
      <Checkbox label="Plain" description="No prop" defaultChecked />
      <Checkbox label="Mixed" description="Some subtasks" strikeWhenChecked checked indeterminate />
      <Checkbox label="Off" description="Not done" strikeWhenChecked disabled />
    </div>
  ),
  play: async ({ canvas }) => {
    const ink = token(canvas.getByRole("checkbox", { name: "Plain" }), "--cy-color-ink");
    for (const name of ["Plain", "Mixed", "Off"]) {
      const row = canvas.getByRole("checkbox", { name }).closest(".cy-choice") as HTMLElement;
      await expect({ name, ...(await look(row)) }).toMatchObject({ name, line: "none", label: ink });
    }
    const plain = canvas.getByRole("checkbox", { name: "Plain" }).closest(".cy-choice") as HTMLElement;
    await expect(plain).not.toHaveAttribute("data-strike");
  },
};

export const DoneLabelIsReadableInLightAndDark: Story = {
  render: () => (
    <div style={{ display: "grid" }}>
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div data-testid={mode} style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <Checkbox
              label={`Done in ${mode}`}
              description="Still readable"
              strikeWhenChecked
              defaultChecked
            />
          </div>
        </CynosureTheme>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const mode of ["light", "dark"]) {
      const surface = canvas.getByTestId(mode);
      await settled(surface);
      await expect(getComputedStyle(part(surface, "label")).textDecorationLine).toBe("line-through");
      for (const name of ["label", "description"] as const) {
        const ratio = textContrast(part(surface, name));
        await expect({ mode, name, readable: ratio >= 4.5 }).toEqual({ mode, name, readable: true });
      }
    }
  },
};

/** The declarations a media query (`reduce`, `forced-colors`) applies to a matching element, read from the stylesheets. */
function declaredUnder(media: string, el: Element, property: string): string[] {
  const found: string[] = [];
  const walk = (rules: CSSRuleList, inside: boolean) => {
    for (const rule of rules) {
      if (rule instanceof CSSMediaRule) walk(rule.cssRules, inside || rule.conditionText.includes(media));
      else if (rule instanceof CSSStyleRule) {
        if (inside && el.matches(rule.selectorText)) found.push(rule.style.getPropertyValue(property));
        walk(rule.cssRules, inside);
      }
    }
  };
  for (const sheet of document.styleSheets) walk(sheet.cssRules, false);
  return found.filter(Boolean);
}

export const StrikeSurvivesForcedColoursAndStopsMovingForReducedMotion: Story = {
  args: { strikeWhenChecked: true, defaultChecked: true, label: "Send invoice" },
  play: async ({ canvasElement }) => {
    const label = part(canvasElement, "label");
    // Forced colours remove the muted colour, so the strike is declared again in the system text colour.
    await expect(declaredUnder("forced-colors", label, "text-decoration-line")).toEqual(["line-through"]);
    await expect(
      declaredUnder("forced-colors", label, "text-decoration-color").map((c) => c.toLowerCase()),
    ).toEqual(["canvastext"]);
    // The colour change is a transition, switched off for reduced motion.
    await expect(getComputedStyle(label).transitionProperty).toBe("color");
    await expect(declaredUnder("prefers-reduced-motion", label, "transition")).toContain("none");
  },
};

export const StrikeIsStableUnderHostileHost: Story = {
  args: { strikeWhenChecked: true, defaultChecked: true, label: "Pay rent", description: "Due Friday" },
  play: async ({ canvasElement }) => {
    await settled(canvasElement);
    const label = computeUnderHostileHost(canvasElement, ".cy-choice-label", [
      "text-decoration-line",
      "text-decoration-thickness",
      "text-decoration-color",
      "color",
    ]);
    await expect(label.clean["text-decoration-line"]).toBe("line-through");
    await expect(label.hostile).toEqual(label.clean);
    const description = computeUnderHostileHost(canvasElement, ".cy-choice-description", ["color"]);
    await expect(description.hostile).toEqual(description.clean);
  },
};

export const DoneTokensRestyleTheStrike: Story = {
  args: { strikeWhenChecked: true, defaultChecked: true, label: "File taxes", description: "By the 31st" },
  render: (args) => (
    <div
      style={
        { "--cy-checkbox-done-color": "rgb(0, 110, 0)", "--cy-checkbox-strike-width": "3px" } as CSSProperties
      }
    >
      <Checkbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await settled(canvasElement);
    const label = getComputedStyle(part(canvasElement, "label"));
    await expect([
      label.textDecorationLine,
      rgb(label.color),
      Number.parseFloat(label.textDecorationThickness),
    ]).toEqual(["line-through", [0, 110, 0], 3]);
    await expect(rgb(getComputedStyle(part(canvasElement, "description")).color)).toEqual([0, 110, 0]);
  },
};
