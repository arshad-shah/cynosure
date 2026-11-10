import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, spyOn, waitFor } from "storybook/test";
import { contrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { Stack } from "../Stack/Stack.js";
import { FileDrop } from "./FileDrop.js";

const meta = {
  title: "Components/FileDrop",
  component: FileDrop,
  args: { multiple: true, name: "files", hint: "PNG or PDF, up to 5 MB", onFiles: fn(), onReject: fn() },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  render: (args) => (
    <form data-testid="form" style={{ maxWidth: 420 }}>
      <FileDrop {...args} />
    </form>
  ),
} satisfies Meta<typeof FileDrop>;
export default meta;
type Story = StoryObj<typeof meta>;

const file = (name: string, type: string, bytes = 5) => new File(["x".repeat(bytes)], name, { type });
const zone = (el: Element) => el.querySelector(".cy-file-drop") as HTMLElement;
const nativeInput = (el: Element) => el.querySelector('input[type="file"]') as HTMLInputElement;
const submitted = (el: Element) =>
  new FormData(el.querySelector("form") as HTMLFormElement).getAll("files").map((f) => (f as File).name);

/** Fires a drag of `files` over `target`: enter, over, then drop (or leave). */
function drag(target: Element, files: File[], end: "drop" | "dragleave" = "drop") {
  const data = new DataTransfer();
  for (const f of files) data.items.add(f);
  const fire = (type: string) =>
    target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
  fire("dragenter");
  fire("dragover");
  return () => fire(end);
}

export const ButtonOpensThePicker: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Choose files" });
    await expect(button).toHaveAccessibleDescription("PNG or PDF, up to 5 MB");
    const input = nativeInput(canvasElement);
    const open = spyOn(input, "click").mockImplementation(() => {});
    await userEvent.click(button);
    await expect(open).toHaveBeenCalledTimes(1);
    open.mockRestore();
    // Picked files come back through onFiles and are announced.
    const picked = [file("a.png", "image/png")];
    await userEvent.upload(input, picked);
    await expect(args.onFiles).toHaveBeenLastCalledWith(picked);
    await expect(canvas.getByRole("status")).toHaveTextContent("1 file added");
  },
};

export const DroppingFiles: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    const target = zone(canvasElement);
    const files = [file("a.png", "image/png"), file("b.pdf", "application/pdf")];
    const drop = drag(target, files);
    // While files are over it, the zone says so.
    await waitFor(() => expect(target).toHaveAttribute("data-over"));
    await expect(target).toHaveTextContent("Drop to add");
    drop();
    await waitFor(() => expect(target).not.toHaveAttribute("data-over"));
    await expect(args.onFiles).toHaveBeenLastCalledWith(files);
    await expect(canvas.getByRole("status")).toHaveTextContent("2 files added");
    // Dropped files are in the form, like picked ones.
    await expect(submitted(canvasElement)).toEqual(["a.png", "b.pdf"]);
  },
};

export const DraggingAwayOrNonFiles: Story = {
  play: async ({ args, canvasElement }) => {
    const target = zone(canvasElement);
    const leave = drag(target, [file("a.png", "image/png")], "dragleave");
    await waitFor(() => expect(target).toHaveAttribute("data-over"));
    leave();
    await waitFor(() => expect(target).not.toHaveAttribute("data-over"));
    // Dragging text, not files, does not light the zone up.
    const data = new DataTransfer();
    data.setData("text/plain", "hello");
    target.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: data }));
    await expect(target).not.toHaveAttribute("data-over");
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};

export const ChecksTypeSizeAndCount: Story = {
  args: { accept: ".png,application/pdf", maxSize: 10, maxFiles: 2 },
  play: async ({ args, canvas, canvasElement }) => {
    const ok1 = file("one.png", "image/png");
    const ok2 = file("two.pdf", "application/pdf");
    const third = file("three.png", "image/png");
    const wrong = file("notes.txt", "text/plain");
    const big = file("huge.png", "image/png", 50);
    drag(zone(canvasElement), [ok1, wrong, big, ok2, third])();
    await waitFor(() => expect(args.onFiles).toHaveBeenLastCalledWith([ok1, ok2]));
    await expect(args.onReject).toHaveBeenLastCalledWith([
      { file: wrong, reason: "type" },
      { file: big, reason: "size" },
      { file: third, reason: "count" },
    ]);
    // Each refusal is explained, and only the accepted files reach the form.
    const alert = canvas.getByRole("alert");
    await expect(alert).toHaveTextContent("notes.txt: this type of file is not accepted");
    await expect(alert).toHaveTextContent("huge.png: too large");
    await expect(alert).toHaveTextContent("three.png: too many files");
    await expect(zone(canvasElement)).toHaveAttribute("data-invalid");
    await expect(submitted(canvasElement)).toEqual(["one.png", "two.pdf"]);
  },
};

export const OneFile: Story = {
  args: { multiple: false },
  play: async ({ args, canvas, canvasElement }) => {
    await expect(canvas.getByRole("button", { name: "Choose a file" })).toBeVisible();
    await expect(nativeInput(canvasElement)).not.toHaveAttribute("multiple");
    const [a, b] = [file("a.png", "image/png"), file("b.png", "image/png")];
    drag(zone(canvasElement), [a, b])();
    await waitFor(() => expect(args.onFiles).toHaveBeenLastCalledWith([a]));
    await expect(args.onReject).toHaveBeenLastCalledWith([{ file: b, reason: "count" }]);
  },
};

export const KeyboardReachesOnlyTheButton: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Choose files" })).toHaveFocus();
    // The native input is hidden and out of the tab order; the button is the way in.
    const input = nativeInput(canvasElement);
    await expect(input).toHaveAttribute("tabindex", "-1");
    await expect(input.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement)).toBe(false);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, canvasElement }) => {
    await expect(canvas.getByRole("button", { name: "Choose files" })).toBeDisabled();
    drag(zone(canvasElement), [file("a.png", "image/png")])();
    await expect(zone(canvasElement)).not.toHaveAttribute("data-over");
    await expect(args.onFiles).not.toHaveBeenCalled();
    await expect(submitted(canvasElement)).toEqual([]);
  },
};

export const LabelsOverride: Story = {
  args: {
    labels: {
      prompt: "Dateien hierher ziehen, oder",
      choose: "Dateien wählen",
      added: (n) => `${n} hinzugefügt`,
      rejected: ({ file: f }) => `${f.name} abgelehnt`,
    },
    accept: ".png",
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("button", { name: "Dateien wählen" })).toBeVisible();
    await expect(zone(canvasElement)).toHaveTextContent("Dateien hierher ziehen, oder");
    drag(zone(canvasElement), [file("a.png", "image/png"), file("b.txt", "text/plain")])();
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("1 hinzugefügt"));
    await expect(canvas.getByRole("alert")).toHaveTextContent("b.txt abgelehnt");
  },
};

export const TouchButton: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Choose files" });
    const hit = getComputedStyle(button, "::before");
    await expect(Number.parseFloat(hit.height)).toBeGreaterThanOrEqual(44);
    const open = spyOn(nativeInput(canvasElement), "click").mockImplementation(() => {});
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(open).toHaveBeenCalled();
    open.mockRestore();
  },
};

export const ReadableInLightAndDark: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <div className="surface" style={{ background: "var(--cy-color-surface)", padding: 8 }}>
            <FileDrop {...args} />
          </div>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const surface of canvasElement.querySelectorAll(".surface")) {
      const bg = getComputedStyle(zone(surface)).backgroundColor;
      for (const sel of [".cy-file-drop-prompt", ".cy-file-drop-hint"]) {
        await expect(
          contrast(getComputedStyle(surface.querySelector(sel) as Element).color, bg),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    const props = [
      "display",
      "font-size",
      "color",
      "padding-top",
      "border-top-style",
      "box-sizing",
      "text-align",
    ];
    for (const selector of [".cy-file-drop", ".cy-file-drop-prompt", ".cy-file-drop-hint"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
