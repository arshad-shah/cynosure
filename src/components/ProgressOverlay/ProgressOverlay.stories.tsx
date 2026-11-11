import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { ProgressOverlay, type ProgressOverlayProps } from "./ProgressOverlay.js";

/** A page that starts a job of four steps, one every 80ms, as a product wires it. */
function Job({ cancellable = true, onCancel }: { cancellable?: boolean; onCancel?: () => void }) {
  const [done, setDone] = useState<number | null>(null);
  useEffect(() => {
    if (done === null || done >= 4) return;
    const timer = setTimeout(() => setDone(done + 1), 80);
    return () => clearTimeout(timer);
  }, [done]);
  return (
    <>
      <Button onClick={() => setDone(0)}>Export</Button>
      <output data-testid="done">{done === null ? "idle" : done}</output>
      <ProgressOverlay
        open={done !== null && done < 4}
        title="Exporting pages"
        value={done ?? 0}
        max={4}
        onCancel={
          cancellable
            ? () => {
                setDone(null);
                onCancel?.();
              }
            : undefined
        }
      />
    </>
  );
}

const meta = {
  title: "Components/ProgressOverlay",
  component: ProgressOverlay,
  args: { open: true, title: "Compressing the PDF", value: 3, max: 12 },
} satisfies Meta<typeof ProgressOverlay>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ShowsHowFarItHasGot: Story = {
  tags: ["visual"],
  play: async ({ canvas }) => {
    const dialog = await canvas.findByRole("dialog", { name: "Compressing the PDF" });
    await shownFully(dialog);
    const bar = canvas.getByRole("progressbar", { name: "Compressing the PDF" });
    await expect(bar).toHaveAttribute("aria-valuenow", "3");
    await expect(bar).toHaveAttribute("aria-valuetext", "3 of 12");
    await expect(dialog).toHaveTextContent("3 of 12");
    // Without onCancel there is nothing to press and Escape does not close it.
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

export const RunsAndClosesWhenDone: Story = {
  render: () => <Job />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    const dialog = await canvas.findByRole("dialog", { name: "Exporting pages" });
    await waitFor(() => expect(dialog).toHaveTextContent("2 of 4"));
    // The status line is a polite live region.
    await expect(dialog.querySelector('[aria-live="polite"]')).toHaveTextContent(/\d of 4/);
    await waitFor(() => expect(canvas.getByTestId("done")).toHaveTextContent("4"));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};

export const CancelAndEscapeStopTheWork: Story = {
  render: () => {
    const spy = fn();
    (window as unknown as { cancels: typeof spy }).cancels = spy;
    return <Job onCancel={spy} />;
  },
  play: async ({ canvas, userEvent }) => {
    const cancels = (window as unknown as { cancels: ReturnType<typeof fn> }).cancels;
    const start = canvas.getByRole("button", { name: "Export" });
    await userEvent.click(start);
    await userEvent.click(await canvas.findByRole("button", { name: "Cancel" }));
    await expect(cancels).toHaveBeenCalledTimes(1);
    await expect(canvas.getByTestId("done")).toHaveTextContent("idle");
    await waitFor(() => expect(start).toHaveFocus());
    await userEvent.click(start);
    await canvas.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await expect(cancels).toHaveBeenCalledTimes(2);
  },
};

export const NoCancelNoClose: Story = {
  render: () => <Job cancellable={false} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    const dialog = await canvas.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    // Still open and the work still running.
    await expect(canvas.getByRole("dialog")).toBe(dialog);
    await expect(canvas.getByTestId("done")).not.toHaveTextContent("idle");
    await expect(canvas.queryByRole("button", { name: "Cancel" })).toBeNull();
    // It closes itself when the work is done.
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};

export const UnknownAmount: Story = {
  args: { value: undefined, max: undefined, title: "Reading the file" } as Partial<ProgressOverlayProps>,
  play: async ({ canvas }) => {
    const bar = await canvas.findByRole("progressbar", { name: "Reading the file" });
    await expect(bar).toHaveAttribute("aria-busy", "true");
    await expect(bar).not.toHaveAttribute("aria-valuenow");
    await expect(canvas.getByRole("dialog")).toHaveTextContent("Working…");
  },
};

export const StatusAndLabels: Story = {
  args: {
    value: 40,
    max: 200,
    status: "Seite 40: Bilder",
    onCancel: fn(),
    labels: { cancel: "Abbrechen", count: (v: number, m: number) => `${v} von ${m}` },
    className: "product-progress",
    style: { maxInlineSize: "30rem" },
  },
  play: async ({ args, canvas, userEvent }) => {
    const dialog = await canvas.findByRole("dialog");
    await expect(dialog.closest(".product-progress, dialog")).not.toBeNull();
    await expect(dialog).toHaveTextContent("Seite 40: Bilder");
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "40 von 200");
    await userEvent.click(canvas.getByRole("button", { name: "Abbrechen" }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole("dialog");
    const props = ["font-size", "margin-top", "color", "letter-spacing", "text-transform"];
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-progress-overlay-status", props);
    await expect(hostile).toEqual(clean);
  },
};
