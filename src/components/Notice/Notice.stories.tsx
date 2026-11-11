import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { textContrast } from "../../test/color.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { CynosureTheme } from "../../theme/CynosureTheme.js";
import type { Tone } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { Stack } from "../Stack/Stack.js";
import { Notice } from "./Notice.js";

const TONES: Tone[] = ["info", "success", "warning", "danger", "neutral", "accent"];

const meta = {
  title: "Components/Notice",
  component: Notice,
  args: {
    tone: "info",
    title: "Sync is paused",
    children: "Changes are saved on this device and will upload when you are back online.",
    dismissible: false,
  },
  argTypes: {
    tone: { control: "select", options: TONES },
    title: { control: "text" },
    dismissible: { control: "boolean" },
  },
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RolesByTone: Story = {
  render: (args) => (
    <Stack gap="4">
      {TONES.map((tone) => (
        <Notice key={tone} {...args} tone={tone} title={`${tone} title`} />
      ))}
    </Stack>
  ),
  play: async ({ canvas }) => {
    // Danger interrupts (alert); everything else waits its turn (status).
    await expect(canvas.getByRole("alert")).toHaveTextContent("danger title");
    await expect(canvas.getAllByRole("status")).toHaveLength(TONES.length - 1);
    // The tone icon is decorative.
    const icon = canvas.getByRole("alert").querySelector(".cy-notice-icon");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
  },
};

export const ReadableInEveryToneAndMode: Story = {
  render: (args) => (
    <Stack gap="4">
      {(["light", "dark"] as const).map((mode) => (
        <CynosureTheme key={mode} mode={mode}>
          <Stack gap="2">
            {TONES.map((tone) => (
              <Notice key={tone} {...args} tone={tone} title={`${mode} ${tone}`} />
            ))}
          </Stack>
        </CynosureTheme>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const notice of canvasElement.querySelectorAll(".cy-notice")) {
      const name = notice.querySelector(".cy-notice-title")?.textContent;
      for (const part of [".cy-notice-title", ".cy-notice-body"]) {
        const ratio = textContrast(notice.querySelector(part) as Element);
        await expect({ name, part, readable: ratio >= 4.5 }).toEqual({ name, part, readable: true });
      }
    }
  },
};

export const DismissHidesIt: Story = {
  args: { dismissible: true, labels: { dismiss: "Hide message" } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Hide message" }));
    await expect(canvas.queryByRole("status")).toBeNull();
  },
};

export const ControlledDismiss: Story = {
  args: { dismissible: true, onDismiss: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    // With onDismiss, the parent decides: it stays until unmounted.
    await expect(canvas.getByRole("status")).toBeInTheDocument();
  },
};

export const ActionDropsUnderTheTextWhenNarrow: Story = {
  args: { tone: "warning", title: "Storage almost full", children: "You have used 95% of your space." },
  render: (args) => (
    <Stack gap="4">
      <div data-testid="wide" style={{ width: 640 }}>
        <Notice {...args} action={<Button size="sm">Manage</Button>} dismissible />
      </div>
      <div data-testid="narrow" style={{ width: 260 }}>
        <Notice {...args} action={<Button size="sm">Manage</Button>} dismissible />
      </div>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const parts = (id: string) => {
      const root = canvas.getByTestId(id);
      return {
        root: root.querySelector(".cy-notice") as HTMLElement,
        text: (root.querySelector(".cy-notice-text") as HTMLElement).getBoundingClientRect(),
        action: (root.querySelector(".cy-notice-action") as HTMLElement).getBoundingClientRect(),
      };
    };
    const wide = parts("wide");
    await waitFor(() => expect(wide.action.left).toBeGreaterThanOrEqual(wide.text.right));
    const narrow = parts("narrow");
    await waitFor(() => expect(narrow.action.top).toBeGreaterThanOrEqual(narrow.text.bottom));
    // Nothing spills sideways.
    await expect(narrow.root.scrollWidth).toBeLessThanOrEqual(narrow.root.clientWidth);
    // At both widths the icon, the title and the close button share the first line; nothing stacks vertically.
    for (const id of ["wide", "narrow"]) {
      const root = canvas.getByTestId(id);
      const title = (root.querySelector(".cy-notice-title") as HTMLElement).getBoundingClientRect();
      const mid = title.top + title.height / 2;
      for (const part of [".cy-notice-icon", '[aria-label="Dismiss"] svg']) {
        const box = (root.querySelector(part) as Element).getBoundingClientRect();
        await expect({ id, part, centred: Math.abs(box.top + box.height / 2 - mid) <= 2 }).toEqual({
          id,
          part,
          centred: true,
        });
      }
      // The action lines up with the text, not the icon.
      const text = (root.querySelector(".cy-notice-text") as HTMLElement).getBoundingClientRect();
      if (id === "narrow") await expect(Math.round(narrow.action.left)).toBe(Math.round(text.left));
    }
  },
};

export const CustomOrNoIcon: Story = {
  render: (args) => (
    <Stack gap="4">
      <Notice {...args} icon={null} title="No icon" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".cy-notice-icon")).toBeNull();
  },
};

export const StableUnderHostileHost: Story = {
  args: { dismissible: true, action: <Button size="sm">Retry</Button> },
  play: async ({ canvasElement }) => {
    for (const selector of [".cy-notice", ".cy-notice-title", ".cy-notice-body"]) {
      const { clean, hostile } = computeUnderHostileHost(canvasElement, selector, [
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

export const TouchDismiss: Story = {
  tags: ["touch", "!dev"],
  args: { dismissible: true },
  play: async ({ canvas, userEvent }) => {
    const close = canvas.getByRole("button", { name: "Dismiss" });
    const hit = getComputedStyle(close, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: close });
    await expect(canvas.queryByRole("status")).toBeNull();
  },
};

export const Defaults: Story = {
  render: () => <Notice className="host-notice">Saved on this device.</Notice>,
  play: async ({ canvas, canvasElement }) => {
    // Info tone (polite, with its icon), no close button, className for layout.
    const notice = canvas.getByRole("status");
    await expect(notice).toHaveAttribute("data-tone", "info");
    await expect(notice).toHaveClass("host-notice");
    await expect(canvasElement.querySelector(".cy-notice-icon")).not.toBeNull();
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};
