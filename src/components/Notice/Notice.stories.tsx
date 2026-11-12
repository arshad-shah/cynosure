import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { backdrop, contrast, textContrast } from "../../test/color.js";
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
    variant: { control: "inline-radio", options: ["soft", "filled"] },
    compact: { control: "boolean" },
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

/** The colour `value` resolves to as a background on `el`. */
function resolvedBg(el: Element, value: string): string {
  const probe = document.createElement("i");
  probe.style.background = value;
  el.append(probe);
  const out = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return out;
}

export const FilledReadableInEveryToneAndMode: Story = {
  tags: ["visual"],
  args: { variant: "filled", dismissible: true },
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
    const notices = canvasElement.querySelectorAll<HTMLElement>(".cy-notice");
    await expect(notices).toHaveLength(TONES.length * 2);
    await expect(canvasElement.querySelectorAll(".cy-notice-icon")).toHaveLength((TONES.length - 1) * 2);
    for (const notice of notices) {
      const name = notice.querySelector(".cy-notice-title")?.textContent ?? "";
      const tone = name.split(" ")[1];
      // The fill is the tone itself, not a tint of it.
      const fill = tone === "neutral" ? "var(--cy-color-ink)" : `var(--cy-color-${tone})`;
      await expect({ name, bg: getComputedStyle(notice).backgroundColor }).toEqual({
        name,
        bg: resolvedBg(notice, fill),
      });
      for (const part of [".cy-notice-title", ".cy-notice-body"]) {
        const ratio = textContrast(notice.querySelector(part) as Element);
        await expect({ name, part, readable: ratio >= 4.5 }).toEqual({ name, part, readable: true });
      }
      // The tone icon and the close button's icon read on the fill too (3:1 for graphics).
      for (const part of [".cy-notice-icon", '[aria-label="Dismiss"] svg']) {
        const el = notice.querySelector(part);
        // Neutral messages have no tone icon.
        if (!el) continue;
        const ratio = contrast(getComputedStyle(el).color, backdrop(notice));
        await expect({ name, part, readable: ratio >= 3 }).toEqual({ name, part, readable: true });
      }
    }
  },
};

export const CompactSitsOnOneLineWhenItFits: Story = {
  args: { title: "Offline", children: "Changes will upload later." },
  render: (args) => (
    <Stack gap="4">
      <div data-testid="regular" style={{ width: 640 }}>
        <Notice {...args} dismissible />
      </div>
      <div data-testid="compact" style={{ width: 640 }}>
        <Notice {...args} compact dismissible />
      </div>
      <div data-testid="narrow" style={{ width: 220 }}>
        <Notice {...args} compact dismissible />
      </div>
      <div data-testid="filled" style={{ width: 640 }}>
        <Notice {...args} compact variant="filled" tone="danger" />
      </div>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const part = (id: string, selector: string) =>
      (canvas.getByTestId(id).querySelector(selector) as HTMLElement).getBoundingClientRect();
    const root = (id: string) => canvas.getByTestId(id).querySelector(".cy-notice") as HTMLElement;
    // Compact: less padding, so a shorter box than the regular Notice.
    const pad = (id: string) => Number.parseFloat(getComputedStyle(root(id)).paddingTop);
    await expect(pad("compact")).toBeLessThan(pad("regular"));
    await expect(part("compact", ".cy-notice").height).toBeLessThan(part("regular", ".cy-notice").height);
    // When it fits, the title and the message share one line, the message after the title.
    for (const id of ["compact", "filled"]) {
      const title = part(id, ".cy-notice-title");
      const body = part(id, ".cy-notice-body");
      await expect({ id, sameLine: Math.abs(body.top - title.top) <= 1 }).toEqual({ id, sameLine: true });
      await expect(body.left).toBeGreaterThan(title.right);
    }
    // The regular Notice keeps the message under the title.
    await expect(part("regular", ".cy-notice-body").top).toBeGreaterThanOrEqual(
      part("regular", ".cy-notice-title").bottom,
    );
    // Narrow: the message wraps under the title and nothing spills sideways.
    await expect(part("narrow", ".cy-notice-body").top).toBeGreaterThanOrEqual(
      part("narrow", ".cy-notice-title").bottom,
    );
    await expect(root("narrow").scrollWidth).toBeLessThanOrEqual(root("narrow").clientWidth);
    // The icon and the close button stay centred on the line.
    const title = part("compact", ".cy-notice-title");
    const mid = title.top + title.height / 2;
    for (const selector of [".cy-notice-icon", '[aria-label="Dismiss"] svg']) {
      const box = part("compact", selector);
      await expect({ selector, centred: Math.abs(box.top + box.height / 2 - mid) <= 2 }).toEqual({
        selector,
        centred: true,
      });
    }
    // In right-to-left text the message follows the title leftwards.
    root("compact").setAttribute("dir", "rtl");
    await expect(part("compact", ".cy-notice-body").right).toBeLessThan(
      part("compact", ".cy-notice-title").left,
    );
    root("compact").removeAttribute("dir");
    // Host CSS cannot undo the compact or the filled look.
    for (const id of ["compact", "filled"]) {
      for (const selector of [".cy-notice", ".cy-notice-text", ".cy-notice-title"]) {
        const { clean, hostile } = computeUnderHostileHost(canvas.getByTestId(id), selector, [
          "padding-top",
          "flex-direction",
          "background-color",
          "color",
          "font-size",
        ]);
        await expect({ id, selector, ...hostile }).toEqual({ id, selector, ...clean });
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
