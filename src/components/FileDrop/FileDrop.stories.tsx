import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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

type Picked = readonly (File | string)[] | null;
/**
 * A picker the story answers itself (what was chosen, null for a cancel, or a failure), so the busy state is checked
 * while it is surely still open.
 */
function heldPicker() {
  let settle = { resolve: (_: Picked) => {}, reject: (_: unknown) => {} };
  const picker = fn(
    () =>
      new Promise<Picked>((resolve, reject) => {
        settle = { resolve, reject };
      }),
  );
  return {
    picker,
    answer: (chosen: Picked) => settle.resolve(chosen),
    fail: () => settle.reject(new Error("IPC")),
  };
}
const pickedPng = file("picked.png", "image/png");
const held = heldPicker();
const pick = held.picker;
const paths = fn();

export const PickReplacesTheFileDialog: Story = {
  args: { onPick: pick, onPaths: paths, accept: ".png,.csv" },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const open = spyOn(nativeInput(canvasElement), "click").mockImplementation(() => {});
    // The button asks the app (an Electron dialog over IPC, say) instead of opening the browser's file dialog, and is
    // busy until the picker answers.
    const button = canvas.getByRole("button", { name: "Choose files" });
    await userEvent.click(button);
    await expect(pick).toHaveBeenCalledTimes(1);
    await expect(open).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await expect(pick).toHaveBeenCalledTimes(1);
    held.answer([pickedPng, "/home/me/data.csv"]);
    // Chosen files are checked and arrive in onFiles (and the form); chosen paths arrive in onPaths.
    await waitFor(() => expect(button).not.toHaveAttribute("aria-busy"));
    await expect(args.onFiles).toHaveBeenLastCalledWith([pickedPng]);
    await expect(paths).toHaveBeenLastCalledWith(["/home/me/data.csv"]);
    await expect(submitted(canvasElement)).toEqual(["picked.png"]);
    await expect(canvas.getByRole("status")).toHaveTextContent("2 files added");
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(pick).toHaveBeenCalledTimes(2);
    open.mockRestore();
  },
};

const onlyPaths = fn();
const cancelled = heldPicker();
const failing = heldPicker();
const pathsOnly = heldPicker();
const unheard = heldPicker();
export const PickCancelledFailedOrPathsOnly: Story = {
  render: (args) => (
    <Stack gap="4" style={{ maxWidth: 420 }}>
      <FileDrop {...args} onPick={cancelled.picker} labels={{ choose: "Cancelled" }} />
      <FileDrop {...args} onPick={failing.picker} labels={{ choose: "Failing" }} />
      <FileDrop {...args} onPick={pathsOnly.picker} onPaths={onlyPaths} labels={{ choose: "Paths" }} />
      {/* Without onPaths, chosen paths are dropped quietly. */}
      <FileDrop {...args} onPick={unheard.picker} labels={{ choose: "Unheard" }} />
    </Stack>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const unhandled: unknown[] = [];
    const listen = (event: PromiseRejectionEvent) => unhandled.push(event.reason);
    window.addEventListener("unhandledrejection", listen);
    try {
      // A cancel and a failure both leave the button free again and change nothing, and the failure is handled.
      const ends = [
        ["Cancelled", () => cancelled.answer(null)],
        ["Failing", failing.fail],
        ["Unheard", () => unheard.answer(["/b.csv"])],
      ] as const;
      for (const [name, end] of ends) {
        const button = canvas.getByRole("button", { name });
        await userEvent.click(button);
        await expect(button).toHaveAttribute("aria-busy", "true");
        end();
        await waitFor(() => expect(button).not.toHaveAttribute("aria-busy"));
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
      await expect(args.onFiles).not.toHaveBeenCalled();
      await expect(unhandled).toEqual([]);
      // Only paths: they arrive in onPaths and are announced as added.
      await userEvent.click(canvas.getByRole("button", { name: "Paths" }));
      pathsOnly.answer(["/a.csv"]);
      await waitFor(() => expect(onlyPaths).toHaveBeenLastCalledWith(["/a.csv"]));
      await expect(canvas.getAllByRole("status")[2]).toHaveTextContent("1 file added");
    } finally {
      window.removeEventListener("unhandledrejection", listen);
    }
  },
};

/** A FileDrop whose chosen files and paths live in the app: browse adds a path, the remove buttons take items out. */
function Chosen({ dir, ...args }: Parameters<typeof FileDrop>[0] & { dir?: "rtl" }) {
  const [items, setItems] = useState<(File | string)[]>([
    "/home/me/report.pdf",
    file("photo.png", "image/png"),
    "/home/me/notes.txt",
  ]);
  return (
    <div dir={dir} style={{ maxWidth: 420 }}>
      <FileDrop
        {...args}
        value={items}
        onPick={async () => ["/home/me/new.csv"]}
        onPaths={(picked) => setItems((all) => [...all, ...picked])}
        onFiles={(files) => setItems((all) => [...all, ...files])}
        onRemove={(item, index) => {
          removed(item, index);
          setItems((all) => all.filter((_, i) => i !== index));
        }}
      />
    </div>
  );
}
const removed = fn();
const shown = (el: Element) => [...el.querySelectorAll(".cy-file-drop-file-name")].map((n) => n.textContent);

export const ControlledListOfChosenFiles: Story = {
  tags: ["visual"],
  render: (args) => <Chosen {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The chosen files and paths are listed by name, each with a remove button.
    const list = canvas.getByRole("list", { name: "Chosen files" });
    await expect(list).toBeVisible();
    await expect(shown(canvasElement)).toEqual(["/home/me/report.pdf", "photo.png", "/home/me/notes.txt"]);
    // Browsing and dropping both add to the list through the app.
    await userEvent.click(canvas.getByRole("button", { name: "Choose files" }));
    await waitFor(() => expect(shown(canvasElement)).toHaveLength(4));
    const dropped = file("drop.png", "image/png");
    drag(zone(canvasElement), [dropped])();
    await waitFor(() => expect(shown(canvasElement)).toHaveLength(5));
    // A press on a remove button reports the item and its index; the app takes it out, and it is announced.
    await userEvent.click(canvas.getByRole("button", { name: "Remove photo.png" }));
    await expect(removed).toHaveBeenLastCalledWith(expect.objectContaining({ name: "photo.png" }), 1);
    await expect(shown(canvasElement)).not.toContain("photo.png");
    await expect(canvas.getByRole("status")).toHaveTextContent("photo.png removed");
    // Focus moves to the next remove button, so several can be removed in a row from the keyboard.
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Remove /home/me/notes.txt" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Remove /home/me/new.csv" })).toHaveFocus(),
    );
    // Removing the last item moves focus to the one before it, and removing the only one to the button.
    await userEvent.click(canvas.getByRole("button", { name: "Remove drop.png" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Remove /home/me/new.csv" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Enter}");
    await expect(shown(canvasElement)).toEqual([]);
    await expect(canvas.queryByRole("list", { name: "Chosen files" })).toBeNull();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Choose files" })).toHaveFocus());
  },
};

export const ChosenFilesWithoutRemoveOrDisabled: Story = {
  render: (args) => (
    <Stack gap="4">
      <FileDrop {...args} value={["/a/one.txt"]} />
      <FileDrop {...args} value={["/a/two.txt"]} onRemove={fn()} disabled />
    </Stack>
  ),
  play: async ({ canvas }) => {
    // Without onRemove, or disabled, the list shows the items and offers no remove buttons.
    await expect(canvas.getByText("/a/one.txt")).toBeVisible();
    await expect(canvas.getByText("/a/two.txt")).toBeVisible();
    await expect(canvas.queryAllByRole("button", { name: /^Remove/ })).toEqual([]);
  },
};

export const ChosenFilesRightToLeftAndLabels: Story = {
  render: (args) => (
    <Chosen
      {...args}
      dir="rtl"
      labels={{
        files: "Gewählt",
        remove: (name) => `${name} entfernen`,
        removed: (name) => `${name} entfernt`,
      }}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    // The remove button ends the row: on the left in right-to-left text.
    const remove = canvas.getByRole("button", { name: "photo.png entfernen" });
    const name = canvas.getByText("photo.png");
    await expect(remove.getBoundingClientRect().right).toBeLessThanOrEqual(name.getBoundingClientRect().left);
    await expect(canvas.getByRole("list", { name: "Gewählt" })).toBeVisible();
    await userEvent.click(remove);
    await expect(canvas.getByRole("status")).toHaveTextContent("photo.png entfernt");
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

const overlayOf = (el: Element) => el.querySelector(".cy-file-drop-overlay") as HTMLElement;

export const WholeWindowTarget: Story = {
  args: { target: "window" },
  play: async ({ args, canvas, canvasElement }) => {
    const overlay = overlayOf(canvasElement);
    await expect(overlay).not.toBeVisible();
    // Files dragged in anywhere on the page cover it with the overlay; the zone lights up too.
    const elsewhere = canvasElement.ownerDocument.documentElement;
    const files = [file("a.png", "image/png")];
    drag(elsewhere, files);
    await waitFor(() => expect(overlay).toBeVisible());
    await expect(overlay).toHaveTextContent("Drop to add");
    await expect(overlay).toHaveAttribute("aria-hidden", "true");
    await expect(zone(canvasElement)).toHaveAttribute("data-over");
    // The overlay covers the viewport.
    const box = overlay.getBoundingClientRect();
    await expect(box.width).toBeCloseTo(window.innerWidth, -1);
    // Dropping on it takes the files once (the zone itself does not take them a second time).
    const data = new DataTransfer();
    for (const f of files) data.items.add(f);
    overlay.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
    await waitFor(() => expect(overlay).not.toBeVisible());
    await expect(args.onFiles).toHaveBeenCalledTimes(1);
    await expect(args.onFiles).toHaveBeenLastCalledWith(files);
    await expect(canvas.getByRole("status")).toHaveTextContent("1 file added");
    await expect(submitted(canvasElement)).toEqual(["a.png"]);
  },
};

export const WholeWindowLeaveAndNonFiles: Story = {
  args: { target: "window" },
  play: async ({ args, canvasElement }) => {
    const overlay = overlayOf(canvasElement);
    const page = canvasElement.ownerDocument.documentElement;
    const leave = drag(page, [file("a.png", "image/png")], "dragleave");
    await waitFor(() => expect(overlay).toBeVisible());
    leave();
    await waitFor(() => expect(overlay).not.toBeVisible());
    // Text dragged over the page, and dropped, is left to the page.
    const data = new DataTransfer();
    data.setData("text/plain", "hello");
    const enter = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: data });
    page.dispatchEvent(enter);
    await expect(enter.defaultPrevented).toBe(false);
    const over = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: data });
    page.dispatchEvent(over);
    await expect(over.defaultPrevented).toBe(false);
    const drop = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data });
    page.dispatchEvent(drop);
    await expect(drop.defaultPrevented).toBe(false);
    await expect(overlay).not.toBeVisible();
    await expect(args.onFiles).not.toHaveBeenCalled();
  },
};

export const WholeWindowDisabled: Story = {
  args: { target: "window", disabled: true },
  play: async ({ args, canvasElement }) => {
    drag(canvasElement.ownerDocument.documentElement, [file("a.png", "image/png")])();
    await expect(overlayOf(canvasElement)).not.toBeVisible();
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

export const PlainZoneAndNestedDrags: Story = {
  render: () => (
    <form data-testid="form" style={{ maxWidth: 420 }}>
      <FileDrop className="host-drop" accept=".png" />
    </form>
  ),
  play: async ({ canvas, canvasElement }) => {
    const target = zone(canvasElement);
    await expect(target).toHaveClass("host-drop");
    // No hint: the button has no description. Without callbacks, drops still work and are explained.
    await expect(canvas.getByRole("button", { name: "Choose a file" })).not.toHaveAttribute(
      "aria-describedby",
    );
    // Moving between the zone's own children (enter twice, leave once) keeps it lit until the last leave.
    const data = new DataTransfer();
    data.items.add(file("a.png", "image/png"));
    const fire = (type: string, el: Element) =>
      el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
    const button = canvas.getByRole("button", { name: "Choose a file" });
    fire("dragenter", target);
    fire("dragenter", button);
    fire("dragleave", target);
    await waitFor(() => expect(target).toHaveAttribute("data-over"));
    fire("dragleave", button);
    await waitFor(() => expect(target).not.toHaveAttribute("data-over"));
    // Only refusals: nothing is announced as added.
    const bad = new DataTransfer();
    bad.items.add(file("a.txt", "text/plain"));
    target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: bad }));
    await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent("a.txt"));
    await expect(canvas.getByRole("status")).toHaveTextContent("");
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
  args: { value: ["/home/me/report.pdf"], onRemove: fn() },
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
    for (const selector of [
      ".cy-file-drop",
      ".cy-file-drop-prompt",
      ".cy-file-drop-hint",
      ".cy-file-drop-files",
      ".cy-file-drop-file",
      ".cy-file-drop-file-name",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, props);
      await expect({ selector, ...hostile }).toEqual({ selector, ...clean });
    }
  },
};
