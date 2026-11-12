import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { Switch } from "../Switch/Switch.js";
import { Sheet, type SheetProps } from "./Sheet.js";

function Page(props: SheetProps) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Settings</Button>
      <Sheet
        {...props}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          props.onOpenChange?.(next);
        }}
      />
    </>
  );
}

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  args: {
    title: "Settings",
    description: "Applies to this device only.",
    size: "md",
    dismissible: true,
    onOpenChange: fn(),
    children: (
      <Stack gap="4">
        <Switch label="Compact rows" />
        <Switch label="Show line numbers" />
      </Stack>
    ),
  },
  argTypes: {
    side: { control: "inline-radio", options: ["bottom", "end", "start"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    dismissible: { control: "boolean" },
    keepMounted: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
  render: (args) => <Page {...args} actions={<Button variant="solid">Done</Button>} />,
} satisfies Meta<typeof Sheet>;
export default meta;
type Story = StoryObj<typeof meta>;

const dialogEl = () => document.querySelector("dialog.cy-dialog") as HTMLDialogElement;
const panelEl = () => dialogEl().querySelector(".cy-dialog-panel") as HTMLElement;
const settledClosed = (el: HTMLDialogElement) =>
  waitFor(() => {
    expect(el.open).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });

export const BottomSheetDocksAndCloses: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Settings" });
    await userEvent.click(trigger);
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    await expect(canvas.getByRole("dialog", { name: "Settings" })).toHaveAccessibleDescription(
      "Applies to this device only.",
    );
    await waitFor(() => expect(canvas.getByRole("switch", { name: "Compact rows" })).toHaveFocus());
    // Full width, flush with the bottom edge.
    await waitFor(() => {
      const box = panelEl().getBoundingClientRect();
      expect(Math.round(box.bottom)).toBe(window.innerHeight);
      expect(Math.round(box.width)).toBe(Math.round(el.getBoundingClientRect().width));
    });
    await userEvent.click(canvas.getByRole("switch", { name: "Compact rows" }));
    await expect(canvas.getByRole("switch", { name: "Compact rows" })).toBeChecked();
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger).toHaveFocus();
  },
};

export const ContentIsMountedOnlyWhileOpen: Story = {
  args: { side: "end" },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Settings" });
    const el = dialogEl();
    // Closed: nothing inside the sheet.
    await expect(el.childElementCount).toBe(0);
    await expect(canvas.queryByRole("switch", { name: "Compact rows", hidden: true })).toBeNull();
    await userEvent.click(trigger);
    await waitFor(() => expect(el.open).toBe(true));
    const first = canvas.getByRole("switch", { name: "Compact rows" });
    await userEvent.click(first);
    await expect(first).toBeChecked();
    // It slides out with its content, which is removed once the sheet has gone.
    let seenClosing = false;
    const watch = new MutationObserver(() => {
      if (!el.open && panelEl()) seenClosing = true;
    });
    watch.observe(el, { attributes: true, attributeFilter: ["open"] });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(el.childElementCount).toBe(0), { timeout: 3000 });
    watch.disconnect();
    await expect(seenClosing).toBe(true);
    await expect(getComputedStyle(el).display).toBe("none");
    await expect(trigger).toHaveFocus();
    // Opened again it starts fresh; the backdrop closes it the same way.
    await userEvent.click(trigger);
    await waitFor(() => expect(el.open).toBe(true));
    await expect(canvas.getByRole("switch", { name: "Compact rows" })).not.toBeChecked();
    await userEvent.click(el);
    await waitFor(() => expect(el.childElementCount).toBe(0), { timeout: 3000 });
    await expect(trigger).toHaveFocus();
  },
};

export const KeepMountedKeepsContentAndState: Story = {
  args: { side: "start", keepMounted: true },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Settings" });
    const el = dialogEl();
    // Closed, with the content already in the DOM.
    const first = canvas.getByRole("switch", { name: "Compact rows", hidden: true });
    await expect(first).not.toBeVisible();
    await userEvent.click(trigger);
    await waitFor(() => expect(el.open).toBe(true));
    await userEvent.click(first);
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    await new Promise((r) => setTimeout(r, 400));
    await expect(first.isConnected).toBe(true);
    await userEvent.click(trigger);
    await waitFor(() => expect(el.open).toBe(true));
    await expect(canvas.getByRole("switch", { name: "Compact rows" })).toBe(first);
    await expect(first).toBeChecked();
  },
};

export const EndSheetDocksToTheInlineEnd: Story = {
  args: { side: "end", size: "sm" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Settings" }));
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    await waitFor(() => {
      const box = panelEl().getBoundingClientRect();
      expect(Math.round(box.right)).toBe(Math.round(el.getBoundingClientRect().right));
      expect(Math.round(box.top)).toBe(0);
      expect(Math.round(box.height)).toBe(window.innerHeight);
    });
    // The backdrop beside it closes it.
    await userEvent.click(el);
    await settledClosed(el);
  },
};

export const EndSheetInRightToLeft: Story = {
  args: { side: "end", defaultOpen: true },
  render: (args) => (
    <div dir="rtl">
      <Page {...args} />
    </div>
  ),
  play: async () => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    await waitFor(() => expect(Math.round(panelEl().getBoundingClientRect().left)).toBe(0));
  },
};

export const StartSheetDocksToTheInlineStart: Story = {
  args: { side: "start", size: "sm" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Settings" }));
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    // A navigation drawer: full height on the left, as wide as the small size.
    await waitFor(() => {
      const box = panelEl().getBoundingClientRect();
      expect(Math.round(box.left)).toBe(0);
      expect(Math.round(box.height)).toBe(window.innerHeight);
      expect(box.width).toBeLessThan(window.innerWidth);
    });
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
  },
};

export const StartSheetInRightToLeft: Story = {
  args: { side: "start", defaultOpen: true },
  render: (args) => (
    <div dir="rtl">
      <Page {...args} />
    </div>
  ),
  play: async () => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    await waitFor(() =>
      expect(Math.round(panelEl().getBoundingClientRect().right)).toBe(
        Math.round(el.getBoundingClientRect().right),
      ),
    );
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await waitFor(() => expect(dialogEl().open).toBe(true));
    const { clean, hostile } = computeUnderHostileHost(document, ".cy-dialog-panel", [
      "display",
      "padding-top",
      "font-size",
      "box-sizing",
      "border-top-left-radius",
      "border-bottom-width",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

export const TouchOpensAndCloses: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({ keys: "[TouchA]", target: canvas.getByRole("button", { name: "Settings" }) });
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    const toggle = canvas.getByRole("switch", { name: "Show line numbers" });
    await userEvent.pointer({ keys: "[TouchA]", target: toggle });
    await expect(toggle).toBeChecked();
    await userEvent.pointer({ keys: "[TouchA]", target: el });
    await settledClosed(el);
  },
};
