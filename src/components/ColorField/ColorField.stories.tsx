import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { backdrop, contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { ColorField, readColor } from "./ColorField.js";

const meta = {
  title: "Components/ColorField",
  component: ColorField,
  args: { label: "Accent", defaultValue: "rgb(51 102 255)", format: "hex", onChange: fn() },
  argTypes: {
    format: { control: "inline-radio", options: ["hex", "rgb", "oklch"] },
    alpha: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 300 }}>{Story()}</div>],
} satisfies Meta<typeof ColorField>;
export default meta;
type Story = StoryObj<typeof meta>;

type EyeDropperWindow = Window & { EyeDropper?: unknown };
const swatch = (root: HTMLElement) => root.querySelector(".cy-color-field-swatch") as HTMLElement;
const painted = (el: HTMLElement) => getComputedStyle(el).getPropertyValue("--_c").trim();

export const TypeAnyCssColour: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Accent" });
    // Values are written in the chosen format.
    await expect(input).toHaveValue("#3366ff");
    await userEvent.clear(input);
    await userEvent.type(input, "royalblue{Enter}");
    await expect(input).toHaveValue("#4169e1");
    await expect(args.onChange).toHaveBeenLastCalledWith("#4169e1");
    await expect(painted(swatch(canvasElement))).toBe("rgb(65 105 225 / 1)");
    await userEvent.clear(input);
    await userEvent.type(input, "oklch(62.8% 0.2577 29.23)");
    await userEvent.tab();
    await expect(input).toHaveValue("#ff0000");
  },
};

export const InvalidTextIsExplained: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Accent" });
    await userEvent.clear(input);
    await userEvent.type(input, "not a colour");
    await userEvent.tab();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByText(/Enter a colour such as/)).toBeVisible();
    await expect(input).toHaveAccessibleDescription(/Enter a colour such as/);
    await expect(args.onChange).not.toHaveBeenCalled();
    // Fixing it clears the error.
    await userEvent.clear(input);
    await userEvent.type(input, "teal{Enter}");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).toHaveValue("#008080");
  },
};

export const OutputFormats: Story = {
  render: (args) => (
    <>
      <ColorField {...args} label="Hex" defaultValue="red" format="hex" />
      <ColorField {...args} label="Rgb" defaultValue="red" format="rgb" />
      <ColorField {...args} label="Oklch" defaultValue="red" format="oklch" />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Hex" })).toHaveValue("#ff0000");
    await expect(canvas.getByRole("textbox", { name: "Rgb" })).toHaveValue("rgb(255 0 0)");
    await expect(canvas.getByRole("textbox", { name: "Oklch" })).toHaveValue("oklch(62.8% 0.258 29.2)");
  },
};

export const PickerAreaAndHue: Story = {
  args: { defaultValue: "red" },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Accent" });
    await userEvent.click(canvas.getByRole("button", { name: "Choose colour" }));
    const panel = await canvas.findByRole("dialog", { name: "Choose colour" });
    await shownFully(panel);
    const area = canvas.getByRole("slider", { name: "Saturation and brightness" });
    // The area is a usable size (it once collapsed to the swatch's width inside the popover).
    await expect(area.getBoundingClientRect().width).toBeGreaterThanOrEqual(160);
    await expect(area).toHaveAttribute("aria-valuetext", "Saturation and brightness: 100%, 100%");
    // Keyboard: Left lowers saturation, Down lowers brightness; Shift moves ten times as far.
    area.focus();
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}{ArrowDown}");
    await expect(area).toHaveAttribute("aria-valuetext", "Saturation and brightness: 90%, 99%");
    // Pointer: the bottom-left corner is black.
    const box = area.getBoundingClientRect();
    area.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 3,
        clientX: box.left - 200,
        clientY: box.bottom + 200,
      }),
    );
    area.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 3 }));
    await waitFor(() => expect(input).toHaveValue("#000000"));
    // Hue: back to a full colour, then turn the hue to green.
    area.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerId: 3,
        clientX: box.right + 200,
        clientY: box.top - 200,
      }),
    );
    area.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 3 }));
    const hue = canvas.getByRole("slider", { name: "Hue" });
    // The hue track is thick enough to read as a colour strip.
    const strip = getComputedStyle(hue.closest(".cy-slider-track") as Element, "::before");
    await expect(Number.parseFloat(strip.height)).toBeGreaterThanOrEqual(10);
    hue.focus();
    // Page Up moves a tenth of the circle (36°): three of them and twelve arrows reach 120°, green.
    await userEvent.keyboard("{Home}{PageUp}{PageUp}{PageUp}");
    for (let i = 0; i < 12; i++) await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(input).toHaveValue("#00ff00"));
    await expect(args.onChange).toHaveBeenLastCalledWith("#00ff00");
    // Escape closes the picker and returns focus to the swatch.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Choose colour" })).toHaveFocus());
  },
};

export const OpacityWithAlpha: Story = {
  args: { alpha: true, defaultValue: "blue" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Accent" });
    await userEvent.clear(input);
    await userEvent.type(input, "rgb(0 0 255 / 0.5){Enter}");
    await expect(input).toHaveValue("#0000ff80");
    await userEvent.click(canvas.getByRole("button", { name: "Choose colour" }));
    const opacity = await canvas.findByRole("slider", { name: "Opacity" });
    await expect(opacity).toHaveAttribute("aria-valuetext", "50%");
    opacity.focus();
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(input).toHaveValue("#0000ff"));
  },
};

export const WithoutAlphaOpacityIsDropped: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Accent" });
    await userEvent.clear(input);
    await userEvent.type(input, "rgb(0 0 255 / 0.5){Enter}");
    await expect(input).toHaveValue("#0000ff");
    await userEvent.click(canvas.getByRole("button", { name: "Choose colour" }));
    await canvas.findByRole("slider", { name: "Hue" });
    await expect(canvas.queryByRole("slider", { name: "Opacity" })).toBeNull();
  },
};

export const EyeDropperWhereSupported: Story = {
  beforeEach: () => {
    const w = window as EyeDropperWindow;
    const original = w.EyeDropper;
    w.EyeDropper = class {
      open() {
        return Promise.resolve({ sRGBHex: "#123456" });
      }
    };
    return () => {
      w.EyeDropper = original;
    };
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "Pick a colour from the screen" }));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Accent" })).toHaveValue("#123456"));
    await expect(args.onChange).toHaveBeenLastCalledWith("#123456");
  },
};

export const NoEyeDropperWhereUnsupported: Story = {
  beforeEach: () => {
    const w = window as EyeDropperWindow;
    const original = w.EyeDropper;
    delete w.EyeDropper;
    return () => {
      if (original) w.EyeDropper = original;
    };
  },
  play: async ({ canvas }) => {
    await new Promise((r) => setTimeout(r, 50));
    await expect(canvas.queryByRole("button", { name: "Pick a colour from the screen" })).toBeNull();
  },
};

export const SwatchStaysVisibleOnAnyColour: Story = {
  render: (args) => (
    <>
      <ColorField {...args} label="White" defaultValue="white" />
      <ColorField {...args} label="Surface" defaultValue="rgb(251 249 245)" />
    </>
  ),
  play: async ({ canvasElement }) => {
    // The swatch's outline stands out from the field even when the colour matches the field.
    for (const el of canvasElement.querySelectorAll<HTMLElement>(".cy-color-field-swatch")) {
      const border = getComputedStyle(el).borderTopColor;
      await expect(contrast(border, backdrop(el.parentElement))).toBeGreaterThanOrEqual(3);
    }
  },
};

export const FormValueResetAndDisabled: Story = {
  args: { name: "accent" },
  render: (args) => (
    <form data-testid="form">
      <ColorField {...args} />
      <ColorField {...args} label="Locked" name="locked" disabled />
    </form>
  ),
  play: async ({ canvas, userEvent }) => {
    const form = canvas.getByTestId("form") as HTMLFormElement;
    await expect(new FormData(form).get("accent")).toBe("#3366ff");
    await expect(new FormData(form).get("locked")).toBeNull();
    const input = canvas.getByRole("textbox", { name: "Accent" });
    await userEvent.clear(input);
    await userEvent.type(input, "gold{Enter}");
    await expect(new FormData(form).get("accent")).toBe("#ffd700");
    form.reset();
    await waitFor(() => expect(input).toHaveValue("#3366ff"));
    await expect(canvas.getByRole("textbox", { name: "Locked" })).toBeDisabled();
  },
};

export const ReadsEveryCssSyntax: Story = {
  play: async () => {
    const read = (t: string) => {
      const c = readColor(t);
      return c && { rgb: c.rgb.map((n) => Math.round(n * 255)), a: Math.round(c.a * 100) / 100 };
    };
    await expect(read("")).toBeNull();
    await expect(read("nonsense")).toBeNull();
    await expect(read("#f00")).toEqual({ rgb: [255, 0, 0], a: 1 });
    await expect(read("#f008")).toEqual({ rgb: [255, 0, 0], a: 0.53 });
    await expect(read("#0000ff80")).toEqual({ rgb: [0, 0, 255], a: 0.5 });
    await expect(read("hsl(120 100% 50% / 25%)")).toEqual({ rgb: [0, 255, 0], a: 0.25 });
    await expect(read("rgba(0, 0, 255, 0.75)")).toEqual({ rgb: [0, 0, 255], a: 0.75 });
    // Names and other syntaxes go through the browser.
    await expect(read("rebeccapurple")).toEqual({ rgb: [102, 51, 153], a: 1 });
    await expect(read("transparent")).toEqual({ rgb: [0, 0, 0], a: 0 });
  },
};

export const FormatsWithAlphaControlledAndDrag: Story = {
  render: (args) => {
    function Controlled() {
      const [value, setValue] = useState("rgb(0 0 255 / 0.5)");
      return (
        <>
          <ColorField {...args} label="Controlled" alpha format="rgb" value={value} onChange={setValue} />
          <ColorField {...args} label="Oklch" alpha format="oklch" defaultValue="rgb(128 128 128 / 0.5)" />
          <ColorField label="Defaults" className="host-color" />
        </>
      );
    }
    return <Controlled />;
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("textbox", { name: "Controlled" })).toHaveValue("rgb(0 0 255 / 0.5)");
    // Greys have no hue: written as 0 rather than noise.
    await expect(canvas.getByRole("textbox", { name: "Oklch" })).toHaveValue("oklch(60% 0 0 / 0.5)");
    // Defaults: black, written as hex; className is for layout.
    await expect(canvas.getByRole("textbox", { name: "Defaults" })).toHaveValue("#000000");
    await expect(canvasElement.querySelector(".host-color")).not.toBeNull();
    // Controlled: the owner stores what the picker reports.
    const input = canvas.getByRole("textbox", { name: "Controlled" });
    await userEvent.clear(input);
    await userEvent.type(input, "red{Enter}");
    await expect(input).toHaveValue("rgb(255 0 0)");
    // Dragging across the area updates as it goes; other mouse buttons are ignored.
    await userEvent.click(canvas.getAllByRole("button", { name: "Choose colour" })[0] as HTMLElement);
    const area = await canvas.findByRole("slider", { name: "Saturation and brightness" });
    const box = area.getBoundingClientRect();
    const at = (type: string, x: number, y: number, button = 0) =>
      area.dispatchEvent(
        new PointerEvent(type, { bubbles: true, button, pointerId: 4, clientX: x, clientY: y }),
      );
    at("pointerdown", box.left + box.width / 2, box.top + box.height / 2, 2);
    await expect(input).toHaveValue("rgb(255 0 0)");
    at("pointermove", box.left, box.bottom);
    await expect(input).toHaveValue("rgb(255 0 0)");
    at("pointerdown", box.right + 50, box.top - 50);
    at("pointermove", box.left - 50, box.bottom + 50);
    at("pointerup", box.left - 50, box.bottom + 50);
    await waitFor(() => expect(input).toHaveValue("rgb(0 0 0)"));
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-color-field", ".cy-color-field-swatch", ".cy-text-field-input"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "width",
        "height",
        "font-size",
        "box-sizing",
        "border-top-width",
        "text-transform",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchArea: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("button", { name: "Choose colour" }),
    });
    const area = await canvas.findByRole("slider", { name: "Saturation and brightness" });
    // Dragging on the area never scrolls the page.
    await expect(getComputedStyle(area).touchAction).toBe("none");
    const trigger = canvas.getByRole("button", { name: "Choose colour" });
    const hit = getComputedStyle(trigger, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
  },
};
