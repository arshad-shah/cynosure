import type { Meta, StoryObj } from "@storybook/react-vite";
import { Component, type ReactNode } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import { createTheme } from "../../tokens/index.js";
import { Button } from "../Button/Button.js";
import { Inline } from "../Inline/Inline.js";
import { Toaster, type ToasterProps, type ToastOptions, useToast } from "./Toast.js";

/** Buttons that raise toasts, so the stories exercise the real `useToast()` path. */
function Demo({ options }: { options: Record<string, ToastOptions> }) {
  const { toast, dismiss } = useToast();
  return (
    <Inline gap="3" wrap>
      {Object.entries(options).map(([name, o]) => (
        <Button key={name} onClick={() => toast(o)}>
          {name}
        </Button>
      ))}
      <Button onClick={() => dismiss()}>Clear all</Button>
    </Inline>
  );
}

const saved: ToastOptions = { title: "Saved", description: "Your changes are live.", tone: "success" };

const meta = {
  title: "Components/Toast",
  component: Toaster,
  args: { position: "bottom-end", max: 3 },
  argTypes: {
    position: {
      control: "select",
      options: ["top-start", "top-center", "top-end", "bottom-start", "bottom-center", "bottom-end"],
    },
    max: { control: { type: "number", min: 1, max: 6 } },
  },
  render: (args) => (
    <Toaster {...args}>
      <Demo
        options={{
          Save: saved,
          Fail: { title: "Upload failed", description: "The file is larger than 10 MB.", tone: "danger" },
          Note: { title: "Sync paused", tone: "info", duration: Number.POSITIVE_INFINITY },
        }}
      />
    </Toaster>
  ),
} satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

const toasts = () => [...document.querySelectorAll<HTMLElement>(".cy-toast")];
const gone = (el: HTMLElement) => waitFor(() => expect(el.isConnected).toBe(false), { timeout: 3000 });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const withToaster = (options: Record<string, ToastOptions>, props: Partial<ToasterProps> = {}) => (
  <Toaster {...props}>
    <Demo options={options} />
  </Toaster>
);

export const ShowsAndAutoDismisses: Story = {
  render: (args) => withToaster({ Save: { ...saved, duration: 400 } }, args),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = await canvas.findByRole("status");
    await waitFor(() => expect(toast).toHaveTextContent("SavedYour changes are live."));
    await expect(toast).toHaveAttribute("data-tone", "success");
    // It sits in a named region in the top layer.
    const region = canvas.getByRole("region", { name: "Notifications" });
    await expect(region.matches(":popover-open")).toBe(true);
    await expect(region).toContainElement(toast);
    await gone(toast);
  },
};

export const PausesOnHoverAndFocus: Story = {
  render: (args) => withToaster({ Save: { ...saved, duration: 300 } }, args),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = await canvas.findByRole("status");
    await userEvent.hover(toast);
    await sleep(600);
    await expect(toast.isConnected).toBe(true);
    // Moving away resumes the timer.
    await userEvent.unhover(toast);
    await gone(toast);
    // Focus inside a toast pauses it too.
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const next = await canvas.findByRole("status");
    await userEvent.unhover(next);
    (next.querySelector('[aria-label="Dismiss"]') as HTMLElement).focus();
    await sleep(600);
    await expect(next.isConnected).toBe(true);
    canvas.getByRole("button", { name: "Save" }).focus();
    await gone(next);
  },
};

export const MaxVisibleOlderCollapse: Story = {
  args: { max: 2 },
  render: (args) =>
    withToaster(
      {
        One: { title: "One", duration: Number.POSITIVE_INFINITY },
        Two: { title: "Two", duration: Number.POSITIVE_INFINITY },
        Three: { title: "Three", duration: Number.POSITIVE_INFINITY },
      },
      args,
    ),
  play: async ({ canvas, userEvent }) => {
    for (const name of ["One", "Two", "Three"]) await userEvent.click(canvas.getByRole("button", { name }));
    await waitFor(() => expect(toasts()).toHaveLength(3));
    const [one, two, three] = toasts() as [HTMLElement, HTMLElement, HTMLElement];
    // Only the newest two show; the oldest folds away and cannot be focused.
    await expect(one).toHaveAttribute("data-collapsed");
    await expect(one).toHaveAttribute("inert");
    await waitFor(() => expect(one.getBoundingClientRect().height).toBe(0));
    await expect(two).not.toHaveAttribute("data-collapsed");
    await expect(three).not.toHaveAttribute("data-collapsed");
    // Closing the newest brings the oldest back: the same element (so it is not announced again).
    await userEvent.click(three.querySelector('[aria-label="Dismiss"]') as HTMLElement);
    await gone(three);
    await expect(one.isConnected).toBe(true);
    await expect(one).not.toHaveAttribute("data-collapsed");
    await waitFor(() => expect(one.getBoundingClientRect().height).toBeGreaterThan(0));
    // dismiss() without an id clears everything.
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await gone(one);
    await gone(two);
  },
};

const undo = fn();

export const ActionButton: Story = {
  render: (args) =>
    withToaster(
      {
        Archive: {
          title: "Archived 3 files",
          action: { label: "Undo", onClick: undo },
          duration: Number.POSITIVE_INFINITY,
        },
      },
      args,
    ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    const toast = await canvas.findByRole("status");
    await userEvent.click(await canvas.findByRole("button", { name: "Undo" }));
    await expect(undo).toHaveBeenCalledTimes(1);
    // The action does not close it by itself; the close button does.
    await expect(toast.isConnected).toBe(true);
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await gone(toast);
  },
};

export const AnnouncedOnceWithTheRightUrgency: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Note" }));
    const status = await canvas.findByRole("status");
    await waitFor(() => expect(status).toHaveTextContent("Sync paused"));
    await expect(status).toHaveAttribute("aria-atomic", "true");
    // The live element existed before its text: the text is inserted once, into one live region.
    const title = status.querySelector(".cy-toast-title") as HTMLElement;
    await expect(document.querySelectorAll('[role="status"], [role="alert"]')).toHaveLength(1);
    // Pausing and resuming does not re-insert the text.
    await userEvent.hover(status);
    await userEvent.unhover(status);
    await expect(status.querySelector(".cy-toast-title")).toBe(title);
    // Danger is assertive.
    await userEvent.click(canvas.getByRole("button", { name: "Fail" }));
    const alert = await canvas.findByRole("alert");
    await waitFor(() => expect(alert).toHaveTextContent("Upload failed"));
    await expect(alert).toHaveAttribute("data-tone", "danger");
  },
};

export const ReducedMotion: Story = {
  render: () => (
    <CynosureTheme theme={createTheme({ motion: "reduced" })}>
      {withToaster({ Save: { ...saved, duration: Number.POSITIVE_INFINITY } })}
    </CynosureTheme>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = await canvas.findByRole("status");
    await expect(Number.parseFloat(getComputedStyle(toast).transitionDuration)).toBe(0);
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await waitFor(() => expect(toast.isConnected).toBe(false), { timeout: 200 });
  },
};

export const PositionsAndRightToLeft: Story = {
  args: { position: "top-start" },
  render: (args) => (
    <div dir="rtl">{withToaster({ Save: { ...saved, duration: Number.POSITIVE_INFINITY } }, args)}</div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = await canvas.findByRole("status");
    await waitFor(() => {
      const box = toast.getBoundingClientRect();
      // Top edge, and the start side: the right in right-to-left text.
      expect(box.top).toBeLessThan(window.innerHeight / 2);
      expect(box.right).toBeGreaterThan(window.innerWidth - 40);
    });
  },
};

export const StableUnderHostileHost: Story = {
  render: (args) => withToaster({ Save: { ...saved, duration: Number.POSITIVE_INFINITY } }, args),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const toast = await canvas.findByRole("status");
    await waitFor(() => expect(toast).toHaveTextContent("Saved"));
    for (const selector of [".cy-toast", ".cy-toast-title", ".cy-toaster"]) {
      const { clean, hostile } = computeUnderHostileHost(document, selector, [
        "display",
        "padding-top",
        "font-size",
        "box-sizing",
        "color",
        "text-transform",
        "letter-spacing",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

class Catch extends Component<{ children: ReactNode }, { error?: string }> {
  override state: { error?: string } = {};
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  override render() {
    return this.state.error ? <p>{this.state.error}</p> : this.props.children;
  }
}
function Orphan() {
  useToast();
  return null;
}

export const NeedsAToaster: Story = {
  render: () => (
    <Catch>
      <Orphan />
    </Catch>
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("useToast() needs a <Toaster> around it.")).toBeVisible();
  },
};

export const SwipeToDismiss: Story = {
  tags: ["touch", "!dev"],
  render: (args) => withToaster({ Save: { ...saved, duration: Number.POSITIVE_INFINITY } }, args),
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Save" }) });
    const toast = await canvas.findByRole("status");
    const box = toast.getBoundingClientRect();
    const y = box.top + box.height / 2;
    // A short drag springs back.
    await userEvent.pointer([
      { keys: "[TouchA>]", target: toast, coords: { clientX: box.left + 40, clientY: y } },
      { pointerName: "TouchA", target: toast, coords: { clientX: box.left + 60, clientY: y } },
      { keys: "[/TouchA]", target: toast, coords: { clientX: box.left + 60, clientY: y } },
    ]);
    await expect(toast.isConnected).toBe(true);
    await expect(toast.style.getPropertyValue("--_dx")).toBe("");
    // A long one dismisses.
    await userEvent.pointer([
      { keys: "[TouchA>]", target: toast, coords: { clientX: box.left + 40, clientY: y } },
      { pointerName: "TouchA", target: toast, coords: { clientX: box.left + 140, clientY: y } },
      { keys: "[/TouchA]", target: toast, coords: { clientX: box.left + 140, clientY: y } },
    ]);
    await gone(toast);
  },
};

export const TouchTargets: Story = {
  tags: ["touch", "!dev"],
  render: (args) => withToaster({ Save: { ...saved, duration: Number.POSITIVE_INFINITY } }, args),
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Save" }) });
    await canvas.findByRole("status");
    const close = canvas.getByRole("button", { name: "Dismiss" });
    const hit = getComputedStyle(close, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
  },
};
