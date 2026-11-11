import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CopyButton } from "./CopyButton.js";

const meta = {
  title: "Components/CopyButton",
  component: CopyButton,
  args: {
    value: "npm i @arshad-shah/cynosure",
    timeout: 400,
    size: "md",
    variant: "ghost",
    copy: fn(async () => {}),
    onCopy: fn(),
    onError: fn(),
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["ghost", "soft", "outline", "solid"] },
    timeout: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof CopyButton>;
export default meta;
type Story = StoryObj<typeof meta>;

const root = (el: HTMLElement) => el.closest(".cy-copy-button") as HTMLElement;

export const CopiesAnnouncesAndReverts: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy" });
    const status = canvas.getByRole("status");
    // The live region exists (empty) before anything happens, so the result is announced.
    await expect(status).toHaveTextContent("");
    await userEvent.click(button);
    await expect(args.copy).toHaveBeenCalledWith("npm i @arshad-shah/cynosure");
    await expect(args.onCopy).toHaveBeenCalledWith("npm i @arshad-shah/cynosure");
    await waitFor(() => expect(status).toHaveTextContent("Copied"));
    await expect(button).toHaveAccessibleName("Copied");
    await expect(root(button)).toHaveAttribute("data-state", "copied");
    // Back to the copy state after the timeout.
    await waitFor(() => expect(button).toHaveAccessibleName("Copy"), { timeout: 1500 });
    await expect(status).toHaveTextContent("");
    await expect(root(button)).toHaveAttribute("data-state", "idle");
  },
};

export const KeyboardAndValueFunction: Story = {
  args: { value: () => "computed at click time" },
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Copy" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.copy).toHaveBeenCalledWith("computed at click time");
    await userEvent.keyboard(" ");
    await waitFor(() => expect(args.copy).toHaveBeenCalledTimes(2));
  },
};

export const RejectedClipboardShowsFailure: Story = {
  args: {
    copy: fn(async () => {
      throw new DOMException("Write permission denied.", "NotAllowedError");
    }),
    labels: { failed: "Copy blocked" },
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy" });
    await userEvent.click(button);
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Copy blocked"));
    await expect(button).toHaveAccessibleName("Copy blocked");
    await expect(root(button)).toHaveAttribute("data-state", "failed");
    await expect(args.onError).toHaveBeenCalledTimes(1);
    await expect(args.onCopy).not.toHaveBeenCalled();
    await waitFor(() => expect(button).toHaveAccessibleName("Copy"), { timeout: 1500 });
  },
};

export const SynchronousThrowShowsFailure: Story = {
  args: {
    copy: fn(() => {
      throw new Error("no clipboard in this context");
    }),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Could not copy"));
  },
};

export const ThrowingValueShowsFailure: Story = {
  args: {
    value: () => {
      throw new Error("editor not ready");
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Could not copy"));
    await expect(args.copy).not.toHaveBeenCalled();
    await expect(args.onError).toHaveBeenCalledTimes(1);
  },
};

export const RepeatedCopyIsAnnouncedAgain: Story = {
  args: { timeout: 2000 },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status");
    const seen: string[] = [];
    const watch = new MutationObserver(() => seen.push(status.textContent ?? ""));
    watch.observe(status, { childList: true, characterData: true, subtree: true });
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(status).toHaveTextContent("Copied"));
    await userEvent.click(canvas.getByRole("button", { name: "Copied" }));
    await waitFor(() => expect(seen.filter((t) => t === "Copied")).toHaveLength(2));
    watch.disconnect();
  },
};

/** Swaps navigator.clipboard for the duration of a story. */
async function withClipboard(clipboard: unknown, run: () => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, get: () => clipboard });
  try {
    await run();
  } finally {
    delete (navigator as { clipboard?: unknown }).clipboard;
    if (!original) Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  }
}

export const DefaultUsesTheClipboardApi: Story = {
  render: (args) => <CopyButton value={args.value} timeout={400} />,
  play: async ({ canvas, userEvent }) => {
    const writeText = fn(async () => {});
    await withClipboard({ writeText }, async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
      await expect(writeText).toHaveBeenCalledWith("npm i @arshad-shah/cynosure");
      await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Copied"));
    });
  },
};

export const MissingClipboardNeverThrows: Story = {
  render: (args) => <CopyButton value={args.value} timeout={400} />,
  play: async ({ canvas, userEvent }) => {
    // Insecure context or an extension page without the API: navigator.clipboard is undefined.
    await withClipboard(undefined, async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
      await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Could not copy"));
    });
  },
};

export const LabelsAndDisabled: Story = {
  args: { labels: { copy: "Copy link" }, disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy link" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.copy).not.toHaveBeenCalled();
  },
};

export const StableUnderHostileHost: Story = {
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-copy-button", ".cy-copy-button-status"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
        "display",
        "position",
        "font-size",
        "box-sizing",
        "width",
        "height",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchCopies: Story = {
  tags: ["touch", "!dev"],
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy" });
    const hit = getComputedStyle(button, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: button });
    await expect(args.copy).toHaveBeenCalledTimes(1);
  },
};

export const Defaults: Story = {
  render: () => (
    <CopyButton value="x" copy={async () => {}} className="host-copy" tooltipPlacement="bottom" />
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Copy" });
    await expect(button).toHaveAttribute("data-size", "md");
    await expect(button).toHaveAttribute("data-variant", "ghost");
    await expect(canvasElement.querySelector(".cy-copy-button")).toHaveClass("host-copy");
    // The default timeout keeps the result for two seconds.
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAccessibleName("Copied"));
    await new Promise((r) => setTimeout(r, 1000));
    await expect(button).toHaveAccessibleName("Copied");
  },
};
