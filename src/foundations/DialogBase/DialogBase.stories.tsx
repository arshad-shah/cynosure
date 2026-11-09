import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { DialogBase, type DialogBaseProps } from "./DialogBase.js";

/** DialogBase driven by state, with buttons to open and close it from outside and inside. */
function Harness(props: Partial<DialogBaseProps>) {
  const [open, setOpen] = useState(props.open ?? false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <DialogBase
        {...props}
        aria-label="Base"
        open={open}
        onCancel={() => {
          props.onCancel?.();
        }}
        onClose={() => {
          setOpen(false);
          props.onClose?.();
        }}
      >
        <button type="button" onClick={() => setOpen(false)}>
          Done
        </button>
      </DialogBase>
    </>
  );
}

const meta = {
  title: "Foundations/DialogBase",
  component: DialogBase,
  args: { open: false, modal: true, onCancel: fn(), onClose: fn() },
  argTypes: { open: { control: "boolean" }, modal: { control: "boolean" } },
  render: (args) => <Harness {...args} />,
} satisfies Meta<typeof DialogBase>;
export default meta;
type Story = StoryObj<typeof meta>;

const dialogEl = (root: ParentNode) => root.querySelector("dialog") as HTMLDialogElement;

export const OpenPropDrivesShowModalAndClose: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const dialog = dialogEl(canvasElement);
    await expect(dialog.open).toBe(false);
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    await waitFor(() => expect(dialog.open).toBe(true));
    await expect(dialog.matches(":modal")).toBe(true);
    await expect(canvas.getByRole("dialog", { name: "Base" })).toBe(dialog);
    await userEvent.click(canvas.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog.open).toBe(false));
    // A close the page asked for is not reported as the browser closing it.
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const NotModal: Story = {
  args: { modal: false },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const dialog = dialogEl(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    await waitFor(() => expect(dialog.open).toBe(true));
    await expect(dialog.matches(":modal")).toBe(false);
  },
};

export const CancelBecomesOnCancelAndStaysOpen: Story = {
  args: { open: true },
  play: async ({ args, canvasElement }) => {
    const dialog = dialogEl(canvasElement);
    await waitFor(() => expect(dialog.open).toBe(true));
    const event = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(event);
    await expect(event.defaultPrevented).toBe(true);
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(dialog.open).toBe(true);
  },
};

export const BrowserCloseBecomesOnClose: Story = {
  args: { open: true },
  play: async ({ args, canvasElement }) => {
    const dialog = dialogEl(canvasElement);
    await waitFor(() => expect(dialog.open).toBe(true));
    // An uncancelable close request (or any close the page did not ask for) is reported so state can follow.
    dialog.close();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
    await expect(dialog.open).toBe(false);
  },
};
