import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { filter } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Stack } from "../Stack/Stack.js";
import { TextField } from "../TextField/TextField.js";
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
    initialFocus: { control: "inline-radio", options: ["first", "panel", "none"] },
    width: { control: "inline-radio", options: ["content", "trigger", "fixed"] },
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

function Growing(args: Parameters<typeof Popover>[0]) {
  const [more, setMore] = useState(false);
  return (
    <div style={{ position: "fixed", insetBlockStart: window.innerHeight - 140, insetInlineStart: 24 }}>
      <Popover {...args} placement="bottom">
        <Button onClick={() => setMore(true)}>Show more</Button>
        {more && <div data-testid="more" style={{ blockSize: 300 }} />}
      </Popover>
    </div>
  );
}

export const FlipsWhenItsContentGrows: Story = {
  render: (args) => <Growing {...args} />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog");
    await shownFully(dialog);
    await expect(dialog).toHaveAttribute("data-placement", "bottom");
    // The content grows while open, with no scroll or resize: no room below any more, so it moves above.
    await userEvent.click(canvas.getByRole("button", { name: "Show more" }));
    await canvas.findByTestId("more");
    await waitFor(() => expect(dialog).toHaveAttribute("data-placement", "top"));
    await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      trigger.getBoundingClientRect().top,
    );
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

function ShadowPopover({ modal = false }: { modal?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <Popover label="Shadow" modal={modal} trigger={(p) => <Button {...p}>Shadow</Button>}>
        <Button>Inside shadow</Button>
        <Button>Second</Button>
      </Popover>,
    );
  }, [modal]);
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

export const ShadowRootKeepsTheTabTrapAndReturnsFocus: Story = {
  render: () => <ShadowPopover modal />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const trigger = root.querySelector("button") as HTMLElement;
    await userEvent.click(trigger);
    const dialog = root.querySelector('[role="dialog"]') as HTMLElement;
    await shownFully(dialog);
    const [first, second] = [...dialog.querySelectorAll("button")] as HTMLElement[];
    await waitFor(() => expect(root.activeElement).toBe(first));
    // user-event cannot Tab inside a shadow root, so press Tab on the focused control itself.
    const tab = (shiftKey = false) => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      root.activeElement?.dispatchEvent(event);
      return event.defaultPrevented;
    };
    // Shift+Tab from the first control wraps to the last, and Tab from the last back to the first.
    await expect(tab(true)).toBe(true);
    await expect(root.activeElement).toBe(second);
    await expect(tab()).toBe(true);
    await expect(root.activeElement).toBe(first);
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
    await expect(root.activeElement).toBe(trigger);
  },
};

export const AnchoredToAnElement: Story = {
  render: () => {
    function Beside() {
      const [target, setTarget] = useState<HTMLElement | null>(null);
      return (
        <>
          <div
            ref={setTarget}
            data-testid="target"
            style={{ inlineSize: 120, blockSize: 40, background: "var(--cy-color-soft)" }}
          />
          <Popover label="Details" anchor={target ?? undefined} open={target !== null} placement="end">
            <p>Beside the box</p>
          </Popover>
        </>
      );
    }
    return <Beside />;
  },
  play: async ({ canvas }) => {
    const dialog = await canvas.findByRole("dialog", { name: "Details" });
    await shownFully(dialog);
    await expect(dialog.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      canvas.getByTestId("target").getBoundingClientRect().right,
    );
  },
};

export const OpenAtAPoint: Story = {
  render: () => {
    function Canvas() {
      const [at, setAt] = useState<{ x: number; y: number } | null>(null);
      return (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: a stand-in for a drawing canvas that opens a popover where it is pressed */}
          <div
            tabIndex={-1}
            data-testid="canvas"
            style={{ inlineSize: 400, blockSize: 240, background: "var(--cy-color-soft)" }}
            onClick={(e) => setAt({ x: e.clientX, y: e.clientY })}
          />
          <Popover
            label="Add a note"
            anchor={at ?? undefined}
            open={at !== null}
            onOpenChange={(o) => !o && setAt(null)}
          >
            <TextField label="Note" />
          </Popover>
        </>
      );
    }
    return <Canvas />;
  },
  play: async ({ canvas, userEvent }) => {
    const area = canvas.getByTestId("canvas");
    area.focus();
    const r = area.getBoundingClientRect();
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: area,
      coords: { clientX: r.left + 120, clientY: r.top + 80 },
    });
    const dialog = await canvas.findByRole("dialog", { name: "Add a note" });
    await shownFully(dialog);
    // Placed just below the point, starting at it; focus moves inside.
    await waitFor(() => expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(r.top + 80));
    await expect(Math.abs(dialog.getBoundingClientRect().left - (r.left + 120))).toBeLessThan(2);
    await expect(canvas.getByRole("textbox", { name: "Note" })).toHaveFocus();
    // Escape closes it and focus goes back to where it was.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(area).toHaveFocus();
  },
};

export const InitialFocusOnThePanel: Story = {
  args: { initialFocus: "panel" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    const dialog = await canvas.findByRole("dialog", { name: "Filters" });
    await shownFully(dialog);
    // The panel itself takes focus (screen readers read it from the top); Tab then reaches the first control.
    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox", { name: "Only errors" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
    await expect(canvas.getByRole("button", { name: "Filters" })).toHaveFocus();
  },
};

export const InitialFocusNoneLeavesFocusOnTheTrigger: Story = {
  args: { initialFocus: "none" },
  render: (args) => (
    <>
      <Popover {...args} />
      <p data-testid="outside">Somewhere else on the page</p>
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog", { name: "Filters" });
    await shownFully(dialog);
    await expect(trigger).toHaveFocus();
    // The panel follows its trigger in the document, so Tab goes straight into it.
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox", { name: "Only errors" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
    await expect(trigger).toHaveFocus();
    // Opened by keyboard, focus still stays on the trigger; an outside press closes it.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(isOpen(dialog)).toBe(true));
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByTestId("outside"));
    await settledClosed(dialog);
  },
};

function TypingHint(args: Parameters<typeof Popover>[0]) {
  const [text, setText] = useState("");
  const [area, setArea] = useState<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  return (
    <>
      <TextField
        label="Query"
        ref={setArea}
        value={text}
        onChange={(v) => {
          setText(v);
          setDismissed(false);
        }}
      />
      <Popover
        {...args}
        trigger={undefined}
        label="Hint"
        anchor={area ?? undefined}
        open={text.includes("join") && !dismissed}
        onOpenChange={(o) => !o && setDismissed(true)}
        initialFocus="none"
      >
        <p>Joins need an ON clause.</p>
        <Button>Insert ON</Button>
      </Popover>
      <p data-testid="outside">Somewhere else on the page</p>
    </>
  );
}

export const InitialFocusNoneKeepsTheCaretWhileTyping: Story = {
  render: (args) => <TypingHint {...args} />,
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole("textbox", { name: "Query" });
    await userEvent.type(field, "a join");
    const dialog = await canvas.findByRole("dialog", { name: "Hint" });
    await shownFully(dialog);
    // Focus never left the field: typing carries on.
    await expect(field).toHaveFocus();
    await userEvent.type(field, " b");
    await expect(field).toHaveValue("a join b");
    // Pressing in the anchor is not an outside press.
    await userEvent.click(field);
    await expect(isOpen(dialog)).toBe(true);
    // Tab reaches the panel, which follows the field in the document.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Insert ON" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(field).toHaveFocus();
    // Escape from the field closes it and leaves focus where it is.
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
    await expect(field).toHaveFocus();
    // An outside press closes it too.
    await userEvent.type(field, "!");
    await waitFor(() => expect(isOpen(dialog)).toBe(true));
    await userEvent.click(canvas.getByTestId("outside"));
    await settledClosed(dialog);
  },
};

export const WidthMatchesTheTrigger: Story = {
  args: {
    width: "trigger",
    children: "Short.",
    trigger: (props) => (
      <Button {...props} style={{ inlineSize: 380 }}>
        Filters
      </Button>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog");
    await shownFully(dialog);
    await expect(dialog).toHaveAttribute("data-width", "trigger");
    // As wide as the trigger (wider than its short content and its size preset), and lined up with it.
    const t = trigger.getBoundingClientRect();
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().width - t.width)).toBeLessThan(1));
    await expect(Math.abs(dialog.getBoundingClientRect().left - t.left)).toBeLessThan(1);
  },
};

export const WidthMatchesTheTriggerInRtl: Story = {
  args: {
    width: "trigger",
    children: "Short.",
    trigger: (props) => (
      <Button {...props} style={{ inlineSize: 300 }}>
        Filters
      </Button>
    ),
  },
  decorators: [(Story) => <div dir="rtl">{Story()}</div>],
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog");
    await shownFully(dialog);
    const t = trigger.getBoundingClientRect();
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().width - t.width)).toBeLessThan(1));
    // Starts at the trigger's start edge, which is its right edge in right-to-left text.
    await expect(Math.abs(dialog.getBoundingClientRect().right - t.right)).toBeLessThan(1);
  },
};

export const WidthGrowsPastANarrowTrigger: Story = {
  args: {
    width: "trigger",
    size: "sm",
    trigger: (props) => <IconButton {...props} icon={filter} label="Filters" />,
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog");
    await shownFully(dialog);
    // At least the trigger's width: wider content still gets its room, up to the size preset.
    const w = dialog.getBoundingClientRect().width;
    await expect(w).toBeGreaterThan(trigger.getBoundingClientRect().width);
    await expect(w).toBeLessThanOrEqual(241);
  },
};

export const WidthFixedUsesTheSizeToken: Story = {
  args: { width: "fixed", size: "sm", children: "Short." },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    const dialog = await canvas.findByRole("dialog");
    await shownFully(dialog);
    // The sm preset (240px) however short the content is, and the same under a hostile host.
    await expect(Math.round(dialog.getBoundingClientRect().width)).toBe(240);
    const { clean, hostile } = computeUnderHostileHost(canvasElement, ".cy-popover", [
      "width",
      "padding-top",
    ]);
    await expect(hostile).toEqual(clean);
  },
};

function ShadowNone() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(
      <Popover
        label="Shadow"
        initialFocus="none"
        width="trigger"
        trigger={(p) => (
          <Button {...p} style={{ inlineSize: 300 }}>
            Shadow
          </Button>
        )}
      >
        <Button>Inside shadow</Button>
      </Popover>,
    );
  }, []);
  return <div data-testid="host" ref={host} style={{ paddingBlockEnd: 160 }} />;
}

export const InitialFocusNoneInsideAShadowRoot: Story = {
  render: () => <ShadowNone />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    const trigger = root.querySelector("button") as HTMLElement;
    await userEvent.click(trigger);
    const dialog = root.querySelector('[role="dialog"]') as HTMLElement;
    await shownFully(dialog);
    await expect(root.activeElement).toBe(trigger);
    const t = trigger.getBoundingClientRect();
    await waitFor(() => expect(Math.abs(dialog.getBoundingClientRect().width - t.width)).toBeLessThan(1));
    await userEvent.keyboard("{Escape}");
    await settledClosed(dialog);
    await expect(root.activeElement).toBe(trigger);
  },
};

export const TouchOpensWithoutTakingFocus: Story = {
  tags: ["touch", "!dev"],
  args: { initialFocus: "none" },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.pointer({ keys: "[TouchA]", target: trigger });
    const dialog = await canvas.findByRole("dialog");
    await shownFully(dialog);
    // A tap opens it without moving focus into the panel.
    const box = canvas.getByRole("checkbox", { name: "Only errors" });
    await expect(box).not.toHaveFocus();
    await userEvent.pointer({ keys: "[TouchA]", target: box });
    await expect(box).toBeChecked();
  },
};
