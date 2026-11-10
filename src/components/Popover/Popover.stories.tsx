import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { filter } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Stack } from "../Stack/Stack.js";
import { Popover } from "./Popover.js";

const meta = {
  title: "Components/Popover",
  component: Popover,
  args: {
    label: "Filters",
    placement: "bottom",
    size: "md",
    onOpenChange: fn(),
    trigger: (props) => <Button {...props}>Filters</Button>,
    children: (
      <Stack gap="4">
        <Checkbox label="Only errors" />
        <Checkbox label="Show line numbers" />
        <Button variant="solid" tone="accent">
          Apply
        </Button>
      </Stack>
    ),
  },
  argTypes: {
    placement: { control: "inline-radio", options: ["top", "bottom", "start", "end"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    modal: { control: "boolean" },
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

const isOpen = (el: Element | null) => !!el?.matches(":popover-open");
/** Closed and finished fading out (so later checks, such as the accessibility scan, see the final state). */
const settledClosed = (el: Element) =>
  waitFor(() => {
    expect(isOpen(el)).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });

export const OpensFocusesAndReturnsFocus: Story = {
  tags: ["visual"],
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog", { name: "Filters" });
    await waitFor(() => expect(isOpen(dialog)).toBe(true));
    await shownFully(dialog);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
    // Focus moves to the first control inside.
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Only errors" })).toHaveFocus());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const OutsideClickCloses: Story = {
  render: (args) => (
    <>
      <Popover {...args} />
      <p data-testid="outside">Somewhere else on the page</p>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    const dialog = await canvas.findByRole("dialog");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Only errors" }));
    await expect(isOpen(dialog)).toBe(true);
    await userEvent.click(canvas.getByTestId("outside"));
    await settledClosed(dialog);
    // Clicking the trigger toggles it.
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await waitFor(() => expect(isOpen(dialog)).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await settledClosed(dialog);
  },
};

export const NestedCloseOneAtATime: Story = {
  render: (args) => (
    <Popover {...args} label="Outer" trigger={(p) => <Button {...p}>Outer</Button>}>
      <Popover label="Inner" placement="end" trigger={(p) => <Button {...p}>Inner</Button>}>
        <IconButton icon={filter} label="Inner action" />
      </Popover>
    </Popover>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Outer" }));
    const outer = await canvas.findByRole("dialog", { name: "Outer" });
    await userEvent.click(await canvas.findByRole("button", { name: "Inner" }));
    const inner = await canvas.findByRole("dialog", { name: "Inner" });
    await waitFor(() => expect(isOpen(inner)).toBe(true));
    // Clicking inside the inner one keeps both.
    await userEvent.click(canvas.getByRole("button", { name: "Inner action" }));
    await expect(isOpen(outer)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(inner);
    await expect(isOpen(outer)).toBe(true);
    await expect(canvas.getByRole("button", { name: "Inner" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await settledClosed(outer);
    await expect(canvas.getByRole("button", { name: "Outer" })).toHaveFocus();
  },
};

export const TooltipInsideClosesFirst: Story = {
  render: (args) => (
    <Popover {...args} label="Tools" trigger={(p) => <Button {...p}>Tools</Button>}>
      <IconButton icon={filter} label="Filter rows" />
    </Popover>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Tools" }));
    const dialog = await canvas.findByRole("dialog", { name: "Tools" });
    // Focus lands on the icon button, whose tooltip opens on keyboard focus.
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    const tip = canvasElement.ownerDocument.querySelector(".cy-tooltip") as HTMLElement;
    await waitFor(() => expect(isOpen(tip)).toBe(true));
    await userEvent.keyboard("{Escape}");
    await settledClosed(tip);
    await expect(isOpen(dialog)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
  },
};

export const ModalKeepsTabInside: Story = {
  args: { modal: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await waitFor(() => expect(canvas.getByRole("checkbox", { name: "Only errors" })).toHaveFocus());
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Apply" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox", { name: "Only errors" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole("button", { name: "Apply" })).toHaveFocus();
  },
};

export const FlipsAtTheViewportEdge: Story = {
  render: (args) => (
    <div style={{ position: "fixed", insetBlockEnd: 8, insetInlineStart: 24 }}>
      <Popover {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog");
    await waitFor(() =>
      expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top),
    );
    await expect(dialog).toHaveAttribute("data-placement", "top");
  },
};

export const ControlledAndContentWithoutControls: Story = {
  args: { open: true, children: "Saved 2 minutes ago." },
  play: async ({ canvas }) => {
    const dialog = await canvas.findByRole("dialog");
    await waitFor(() => expect(isOpen(dialog)).toBe(true));
    // Nothing focusable inside: the panel itself takes focus so screen readers land in it.
    await waitFor(() => expect(dialog).toHaveFocus());
  },
};

function ShadowPopover() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <Popover label="Shadow" trigger={(p) => <Button {...p}>Shadow</Button>}>
        <Button>Inside shadow</Button>
      </Popover>,
    );
  }, []);
  return <div data-testid="host" ref={host} style={{ paddingBlockEnd: 160 }} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowPopover />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const trigger = root.querySelector("button") as HTMLElement;
    await userEvent.click(trigger);
    const dialog = root.querySelector('[role="dialog"]') as HTMLElement;
    await waitFor(() => expect(isOpen(dialog)).toBe(true));
    // A click inside the shadow panel is inside; Escape still closes.
    await userEvent.click(root.querySelector('[role="dialog"] button') as HTMLElement);
    await expect(isOpen(dialog)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
  },
};
