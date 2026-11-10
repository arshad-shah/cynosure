import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { copy as copyIcon } from "../../icons/copy.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu } from "../Menu/Menu.js";
import { Stack } from "../Stack/Stack.js";
import { TextField } from "../TextField/TextField.js";
import { Dialog, type DialogProps } from "./Dialog.js";

/** A page with a button that opens the dialog, plus something outside it to aim at. */
function Page(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit profile</Button>
      <Button>Outside</Button>
      <Dialog
        title="Edit profile"
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

const form = (
  <Stack gap="4">
    <TextField label="Name" defaultValue="Ada" />
    <TextField label="Email" defaultValue="ada@example.com" />
  </Stack>
);

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  args: {
    title: "Edit profile",
    description: "Changes are saved to your account.",
    size: "md",
    dismissible: true,
    onOpenChange: fn(),
    children: form,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    dismissible: { control: "boolean" },
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
  render: (args) => (
    <Page
      {...args}
      actions={
        <>
          <Button>Cancel</Button>
          <Button variant="solid" tone="accent">
            Save
          </Button>
        </>
      }
    />
  ),
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

const dialogEl = (root: ParentNode = document) => root.querySelector("dialog.cy-dialog") as HTMLDialogElement;
const settledClosed = (el: HTMLDialogElement) =>
  waitFor(() => {
    expect(el.open).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });
const openWith = async (
  canvas: { getByRole: (r: string, o: object) => HTMLElement },
  click: (e: Element) => unknown,
) => {
  await click(canvas.getByRole("button", { name: "Edit profile" }));
  const el = dialogEl();
  await waitFor(() => expect(el.open).toBe(true));
  return el;
};

export const OpensModalMovesFocusInAndReturnsIt: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Edit profile" });
    const el = await openWith(canvas, (e) => userEvent.click(e));
    await expect(el.matches(":modal")).toBe(true);
    const dialog = canvas.getByRole("dialog", { name: "Edit profile" });
    await expect(dialog).toHaveAccessibleDescription("Changes are saved to your account.");
    await waitFor(() =>
      expect(canvas.getByRole("heading", { level: 2, name: "Edit profile" })).toBeVisible(),
    );
    // Focus starts on the first control of the content, not the close button.
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger).toHaveFocus();
  },
};

export const TabStaysInside: Story = {
  play: async ({ canvas, userEvent }) => {
    await openWith(canvas, (e) => userEvent.click(e));
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus());
    // Content, then the actions; Shift+Tab from the first field reaches the close button in the header.
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Save" })).toHaveFocus();
    canvas.getByRole("textbox", { name: "Name" }).focus();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole("button", { name: "Close" })).toHaveFocus();
    // The page behind is inert (the browser keeps Tab inside): it cannot even be focused from script.
    const outside = canvas.getByRole("button", { name: "Outside", hidden: true });
    outside.focus();
    await expect(outside).not.toHaveFocus();
  },
};

export const CloseButtonAndLabels: Story = {
  args: { labels: { close: "Fermer" } },
  play: async ({ args, canvas, userEvent }) => {
    const el = await openWith(canvas, (e) => userEvent.click(e));
    await userEvent.click(canvas.getByRole("button", { name: "Fermer" }));
    await settledClosed(el);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(canvas.getByRole("button", { name: "Edit profile" })).toHaveFocus();
  },
};

export const BackdropClickCloses: Story = {
  play: async ({ canvas, userEvent }) => {
    const el = await openWith(canvas, (e) => userEvent.click(e));
    // Inside the panel (text, a field) keeps it open.
    await userEvent.click(canvas.getByText("Changes are saved to your account."));
    await userEvent.click(canvas.getByRole("textbox", { name: "Email" }));
    await expect(el.open).toBe(true);
    // The dialog element itself, around the panel, is the backdrop.
    await userEvent.click(el);
    await settledClosed(el);
  },
};

export const NotDismissible: Story = {
  args: { dismissible: false, description: "Choose one to continue." },
  render: (args) => {
    function Confirm() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog
          {...args}
          title="Discard changes?"
          open={open}
          onOpenChange={setOpen}
          actions={
            <>
              <Button onClick={() => setOpen(false)}>Keep editing</Button>
              <Button variant="solid" tone="danger" onClick={() => setOpen(false)}>
                Discard
              </Button>
            </>
          }
        >
          {null}
        </Dialog>
      );
    }
    return <Confirm />;
  },
  play: async ({ args, canvas, userEvent }) => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    // No close button; focus lands on the first action.
    await expect(canvas.queryByRole("button", { name: "Close" })).toBeNull();
    await waitFor(() => expect(canvas.getByRole("button", { name: "Keep editing" })).toHaveFocus());
    // Escape (repeatedly: browsers stop letting a page cancel repeated close requests) and the backdrop do nothing.
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(el);
    await new Promise((r) => setTimeout(r, 50));
    await expect(el.open).toBe(true);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Discard" }));
    await settledClosed(el);
  },
};

export const ContentScrollsInside: Story = {
  args: {
    size: "sm",
    children: (
      <Stack gap="4">
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} style={{ margin: 0 }}>
            Clause {i + 1}: the quick brown fox jumps over the lazy dog.
          </p>
        ))}
        <TextField label="Signature" />
      </Stack>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const el = await openWith(canvas, (e) => userEvent.click(e));
    const body = el.querySelector(".cy-dialog-body") as HTMLElement;
    const panel = el.querySelector(".cy-dialog-panel") as HTMLElement;
    // Let the opening transition finish before measuring.
    await waitFor(() => expect(getComputedStyle(el).opacity).toBe("1"));
    await waitFor(() => expect(body.scrollHeight).toBeGreaterThan(body.clientHeight));
    // The panel fits the viewport; the header and the actions stay visible while the content scrolls.
    await expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    // The actions are laid out inside the panel and inside the viewport (geometry, not computed opacity: see
    // PROGRESS, WebKit reported the button as not visible here while every rect was in place).
    await waitFor(() => {
      const save = canvas.getByRole("button", { name: "Save" }).getBoundingClientRect();
      expect(save.height).toBeGreaterThan(0);
      expect(save.bottom).toBeLessThanOrEqual(
        Math.min(panel.getBoundingClientRect().bottom, window.innerHeight),
      );
    });
    body.scrollTo({ top: body.scrollHeight, behavior: "instant" });
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0), { timeout: 2000 });
    await expect(
      canvas.getByRole("heading", { name: "Edit profile" }).getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(panel.getBoundingClientRect().top);
    // Focusing a field low in the content brings it fully into view inside the scrolling body.
    canvas.getByRole("button", { name: "Save" }).focus();
    body.scrollTo({ top: 0, behavior: "instant" });
    await waitFor(() => expect(body.scrollTop).toBe(0), { timeout: 2000 });
    const signature = canvas.getByRole("textbox", { name: "Signature" });
    signature.focus();
    await waitFor(
      () => {
        const field = signature.getBoundingClientRect();
        const view = body.getBoundingClientRect();
        expect(field.top).toBeGreaterThanOrEqual(view.top - 1);
        expect(field.bottom).toBeLessThanOrEqual(view.bottom + 1);
      },
      { timeout: 2000 },
    );
  },
};

export const NarrowContainerBecomesBottomSheet: Story = {
  args: { defaultOpen: true },
  render: (args) => <Page {...args} />,
  play: async () => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    const panel = el.querySelector(".cy-dialog-panel") as HTMLElement;
    const wide = el.getBoundingClientRect().width >= 576;
    if (wide) {
      // Centred with room around it.
      await waitFor(() =>
        expect(Math.abs(panel.getBoundingClientRect().bottom - window.innerHeight)).toBeGreaterThan(8),
      );
    }
    // Narrow the dialog's container (as an extension popup or a phone would) and it docks to the bottom edge.
    el.style.inlineSize = "360px";
    await waitFor(() => {
      const box = panel.getBoundingClientRect();
      expect(Math.round(box.bottom)).toBe(Math.round(el.getBoundingClientRect().bottom));
      expect(Math.round(box.width)).toBe(360);
    });
  },
};

export const NestedMenuClosesFirst: Story = {
  args: {
    children: (
      <Menu
        label="More"
        trigger={(p) => <Button {...p}>More</Button>}
        items={[
          { value: "duplicate", label: "Duplicate" },
          { value: "archive", label: "Archive" },
        ]}
        onSelect={() => {}}
      />
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const el = await openWith(canvas, (e) => userEvent.click(e));
    const more = canvas.getByRole("button", { name: "More" });
    await waitFor(() => expect(more).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    const menu = await canvas.findByRole("menu", { name: "More" });
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    // Escape closes the menu only and returns focus to its button.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(false));
    await expect(el.open).toBe(true);
    await expect(more).toHaveFocus();
    // A backdrop click with the menu open closes just the menu, too.
    await userEvent.click(more);
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await userEvent.click(el);
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(false));
    await expect(el.open).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
  },
};

function MenuOpensDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Before the Menu in the tree, so showModal runs while the menu item still has focus. */}
      <Dialog title="Rename" open={open} onOpenChange={setOpen}>
        {form}
      </Dialog>
      <Menu
        label="File"
        trigger={(p) => <Button {...p}>File</Button>}
        items={[{ value: "rename", label: "Rename" }]}
        onSelect={() => setOpen(true)}
      />
    </>
  );
}

export const FocusReturnsToTheMenuButtonAfterAMenuItemOpenedIt: Story = {
  render: () => <MenuOpensDialog />,
  play: async ({ canvas, userEvent }) => {
    const file = canvas.getByRole("button", { name: "File" });
    await userEvent.click(file);
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Rename" }));
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    // The menu item it came from is hidden now; focus lands on the button that opened the menu.
    await waitFor(() => expect(file).toHaveFocus());
  },
};

export const TooltipInsideDoesNotSwallowTheBackdropClick: Story = {
  args: { children: <IconButton icon={copyIcon} label="Copy link" /> },
  play: async ({ canvas, userEvent }) => {
    const el = await openWith(canvas, (e) => userEvent.click(e));
    // Keyboard focus on an IconButton opens its tooltip (a layer that ignores pointer downs).
    await waitFor(() => expect(canvas.getByRole("button", { name: "Copy link" })).toHaveFocus());
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await waitFor(() => expect(document.querySelector(".cy-tooltip:popover-open")).not.toBeNull());
    await userEvent.click(el);
    await settledClosed(el);
  },
};

export const NeverWritesToBody: Story = {
  play: async ({ canvas, userEvent }) => {
    const changes: MutationRecord[] = [];
    const watch = new MutationObserver((records) => changes.push(...records));
    watch.observe(document.documentElement, { attributes: true });
    watch.observe(document.body, { attributes: true, childList: true });
    const before = document.body.getAttribute("style");
    const el = await openWith(canvas, (e) => userEvent.click(e));
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    watch.disconnect();
    await expect(changes).toEqual([]);
    await expect(document.body.getAttribute("style")).toBe(before);
  },
};

export const Controlled: Story = {
  args: { open: true, children: "Saved 2 minutes ago." },
  render: (args) => <Dialog {...args} />,
  play: async ({ args, userEvent }) => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    // Nothing focusable in the content and no actions: the dialog itself takes focus (not the close button, whose
    // tooltip would pop up), and Tab moves on to the close button.
    await waitFor(() => expect(el).toHaveFocus());
    // The parent owns `open`: Escape asks to close but the dialog stays until the prop changes.
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(el.open).toBe(true);
  },
};

export const BrowserCloseUpdatesState: Story = {
  args: { className: "my-panel" },
  play: async ({ args, canvas, userEvent }) => {
    const el = await openWith(canvas, (e) => userEvent.click(e));
    // className lands on the panel, for layout.
    await expect(el.querySelector(".cy-dialog-panel")).toHaveClass("my-panel");
    // A close the browser forces (an uncancelable close request) is reported, so state follows.
    el.close();
    await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
    await settledClosed(el);
    await userEvent.click(canvas.getByRole("button", { name: "Edit profile" }));
    await waitFor(() => expect(el.open).toBe(true));
  },
};

function ShadowDialog() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    createRoot(mount).render(<Page>{form}</Page>);
  }, []);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: () => <ShadowDialog />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    await userEvent.click(root.querySelector("button") as HTMLElement);
    const el = dialogEl(root);
    await waitFor(() => expect(el.open).toBe(true));
    await waitFor(() => expect(root.activeElement).toBe(root.querySelector("input")));
    // A click inside is inside; the backdrop and Escape still close it.
    await userEvent.click(root.querySelector(".cy-dialog-title") as HTMLElement);
    await expect(el.open).toBe(true);
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    await userEvent.click(root.querySelector("button") as HTMLElement);
    await waitFor(() => expect(el.open).toBe(true));
    await userEvent.click(el);
    await settledClosed(el);
  },
};

export const RightToLeft: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div dir="rtl">
      <Page {...args} />
    </div>
  ),
  play: async () => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    const close = el.querySelector(".cy-dialog-header .cy-icon-button") as HTMLElement;
    const title = el.querySelector(".cy-dialog-title") as HTMLElement;
    // The close button sits at the inline end: the left in right-to-left text.
    await waitFor(() =>
      expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(title.getBoundingClientRect().left),
    );
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultOpen: true },
  render: (args) => <Page {...args} />,
  play: async () => {
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    for (const selector of [".cy-dialog", ".cy-dialog-panel", ".cy-dialog-title", ".cy-dialog-body"]) {
      const { clean, hostile } = computeUnderHostileHost(document, selector, [
        "display",
        "padding-top",
        "font-size",
        "box-sizing",
        "color",
        "text-transform",
        "border-top-width",
      ]);
      await expect(hostile).toEqual(clean);
    }
  },
};

export const TouchCloseTarget: Story = {
  tags: ["touch", "!dev"],
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({
      keys: "[TouchA]",
      target: canvas.getByRole("button", { name: "Edit profile" }),
    });
    const el = dialogEl();
    await waitFor(() => expect(el.open).toBe(true));
    const close = canvas.getByRole("button", { name: "Close" });
    const hit = getComputedStyle(close, "::before");
    await expect(Number.parseFloat(hit.blockSize || hit.height)).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: close });
    await settledClosed(el);
  },
};
