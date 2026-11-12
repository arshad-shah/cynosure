import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor } from "storybook/test";
import { isApple } from "../../foundations/hotkey.js";
import { copy, download, edit, eye, file } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { type Command, CommandPalette } from "./CommandPalette.js";

/** The palette's shortcut as the platform running the test has it: Command+K on Apple platforms, Ctrl+K elsewhere. */
const MOD_K = isApple() ? "{Meta>}k{/Meta}" : "{Control>}k{/Control}";

const commands: Command[] = [
  { id: "new", label: "New file", group: "File", icon: file, shortcut: ["Ctrl", "N"] },
  {
    id: "save",
    label: "Save file",
    group: "File",
    icon: download,
    shortcut: ["Ctrl", "S"],
    keywords: ["write", "disk"],
  },
  { id: "export", label: "Export as PDF", group: "File", disabled: true },
  { id: "copy-path", label: "Copy path", group: "Edit", icon: copy },
  { id: "rename", label: "Rename", group: "Edit", icon: edit },
  { id: "preview", label: "Toggle preview", group: "View", icon: eye },
];

const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  args: { commands, onRun: fn(), onOpenChange: fn() },
  argTypes: { shortcut: { control: "text" }, recentLimit: { control: "number" } },
  render: (args) => (
    <>
      <Button>Somewhere on the page</Button>
      <CommandPalette {...args} />
    </>
  ),
} satisfies Meta<typeof CommandPalette>;
export default meta;
type Story = StoryObj<typeof meta>;

const palette = (root: ParentNode = document) =>
  root.querySelector("dialog.cy-command-palette") as HTMLDialogElement;
const settledClosed = (el: HTMLDialogElement) =>
  waitFor(() => {
    expect(el.open).toBe(false);
    expect(getComputedStyle(el).display).toBe("none");
  });
const activeLabel = (input: HTMLElement) =>
  document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;

export const ShortcutOpensSearchRunsAndReturnsFocus: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const before = canvas.getByRole("button", { name: "Somewhere on the page" });
    before.focus();
    // Ctrl+K (Command+K on Apple platforms) opens it from anywhere.
    await userEvent.keyboard(MOD_K);
    const el = palette();
    await waitFor(() => expect(el.open).toBe(true));
    await shownFully(el);
    await expect(canvas.getByRole("dialog", { name: "Command palette" })).toBe(el);
    const input = canvas.getByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("sav");
    await expect(activeLabel(input)).toContain("Save file");
    await userEvent.keyboard("{Enter}");
    await expect(args.onRun).toHaveBeenCalledWith("save");
    await settledClosed(el);
    await expect(before).toHaveFocus();
  },
};

export const KeywordsGroupsAndWrappingArrows: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());
    // Before typing: everything, under its group headings.
    for (const name of ["File", "Edit", "View"])
      await expect(canvas.getByRole("group", { name })).toBeInTheDocument();
    await expect(activeLabel(input)).toContain("New file");
    // Up from the first wraps to the last; disabled commands are skipped.
    await userEvent.keyboard("{ArrowUp}");
    await expect(activeLabel(input)).toContain("Toggle preview");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(activeLabel(input)).toContain("Copy path");
    // Keywords find commands whose label does not contain the words.
    await userEvent.keyboard("disk");
    await expect(canvas.getAllByRole("option").map((o) => o.textContent)).toEqual([
      expect.stringContaining("Save file"),
    ]);
    // Every word must match, in any order.
    await userEvent.clear(input);
    await userEvent.keyboard("file new");
    await expect(canvas.getAllByRole("option")).toHaveLength(1);
  },
};

export const TypedWordsAreMarkedInTheLabels: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());
    const marks = () =>
      canvas.getAllByRole("option").map((o) => [...o.querySelectorAll("mark")].map((m) => m.textContent));
    // Nothing typed: nothing marked.
    await expect(marks().flat()).toEqual([]);
    // Each typed word is marked where it appears in a label, ignoring case; a keyword match marks nothing.
    await userEvent.keyboard("FILE n");
    await expect(marks()).toEqual([["N", "file"]]);
    await userEvent.clear(input);
    await userEvent.keyboard("disk");
    await expect(marks()).toEqual([[]]);
    // The option is still named by its whole label.
    await userEvent.clear(input);
    await userEvent.keyboard("pre");
    await expect(canvas.getByRole("option", { name: /^Toggle preview/ })).toBeInTheDocument();
  },
};

export const RecentCommandsComeFirst: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.keyboard(MOD_K);
    await userEvent.keyboard("rename{Enter}");
    await settledClosed(palette());
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(palette().open).toBe(true));
    const recent = canvas.getByRole("group", { name: "Recent" });
    await expect(recent).toHaveTextContent("Rename");
    const input = canvas.getByRole("combobox");
    await expect(activeLabel(input)).toContain("Rename");
    // The search field starts empty each time.
    await expect(input).toHaveValue("");
  },
};

export const NothingFound: Story = {
  args: { defaultOpen: true, labels: { empty: "No matching commands" } },
  play: async ({ args, canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("zzz");
    await waitFor(() => expect(canvas.getByText("No matching commands")).toBeVisible());
    await expect(input).not.toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard("{Enter}");
    await expect(args.onRun).not.toHaveBeenCalled();
  },
};

export const EscapeBackdropAndShortcutClose: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.keyboard(MOD_K);
    const el = palette();
    await waitFor(() => expect(el.open).toBe(true));
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(el.open).toBe(true));
    await userEvent.click(el);
    await settledClosed(el);
    // The shortcut toggles it closed, even from its own search field.
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(el.open).toBe(true));
    await waitFor(() => expect(canvas.getByRole("combobox")).toHaveFocus());
    await userEvent.keyboard(MOD_K);
    await settledClosed(el);
    // A click on a command runs it.
    await userEvent.keyboard(MOD_K);
    await userEvent.click(await canvas.findByRole("option", { name: /Copy path/ }));
    await expect(args.onRun).toHaveBeenCalledWith("copy-path");
    // Disabled commands do nothing.
    await userEvent.keyboard(MOD_K);
    await userEvent.click(await canvas.findByRole("option", { name: /Export as PDF/ }));
    await expect(args.onRun).toHaveBeenCalledTimes(1);
  },
};

export const ShortcutCanBeChangedOrOff: Story = {
  args: { shortcut: false },
  render: (args) => (
    <>
      <CommandPalette {...args} />
      <CommandPalette {...args} shortcut="shift+?" labels={{ title: "Help" }} />
    </>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.keyboard(MOD_K);
    await new Promise((r) => setTimeout(r, 100));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("{Shift>}?{/Shift}");
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Help" })).toBeVisible());
  },
};

function ShadowPalette({ onRun, nested = false }: { onRun: (id: string) => void; nested?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    let root = el.attachShadow({ mode: "open" });
    if (nested) {
      // An extension's widget inside another component's shadow root: two hosts deep.
      const inner = document.createElement("div");
      inner.dataset.testid = "inner-host";
      root.append(inner);
      root = inner.attachShadow({ mode: "open" });
    }
    root.adoptedStyleSheets = [createStyleSheet()];
    const mount = document.createElement("div");
    root.append(mount);
    const app = createRoot(mount);
    app.render(
      <>
        <Button>Inside the extension</Button>
        <CommandPalette commands={commands} onRun={onRun} />
      </>,
    );
    // Unmount with the story, or this palette keeps answering the shortcut from a detached host.
    return () => queueMicrotask(() => app.unmount());
  }, [onRun, nested]);
  return <div data-testid="host" ref={host} />;
}

export const WorksInsideAShadowRoot: Story = {
  render: (args) => <ShadowPalette onRun={args.onRun} />,
  play: async ({ args, canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    await waitFor(() => expect(host.shadowRoot?.querySelector("button")).toBeTruthy());
    const root = host.shadowRoot as ShadowRoot;
    (root.querySelector("button") as HTMLElement).focus();
    await userEvent.keyboard(MOD_K);
    const el = palette(root);
    await waitFor(() => expect(el.open).toBe(true));
    const input = root.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(root.activeElement).toBe(input));
    // user-event types into document.activeElement, which is the shadow host here; dispatch on the input itself.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "preview");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await waitFor(() => expect(root.querySelectorAll('[role="option"]')).toHaveLength(1));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await expect(args.onRun).toHaveBeenCalledWith("preview");
  },
};

export const ReturnsFocusInsideNestedShadowRoots: Story = {
  render: (args) => <ShadowPalette onRun={args.onRun} nested />,
  play: async ({ canvas, userEvent }) => {
    const host = await canvas.findByTestId("host");
    const inner = () => host.shadowRoot?.querySelector<HTMLElement>('[data-testid="inner-host"]')?.shadowRoot;
    await waitFor(() => expect(inner()?.querySelector("button")).toBeTruthy());
    const root = inner() as ShadowRoot;
    const button = root.querySelector("button") as HTMLElement;
    button.focus();
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(palette(root).open).toBe(true));
    const input = root.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(root.activeElement).toBe(input));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await waitFor(() => expect(palette(root).open).toBe(false));
    await waitFor(() => expect(root.activeElement).toBe(button));
  },
};

export const StableUnderHostileHost: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await waitFor(() => expect(palette().open).toBe(true));
    for (const selector of [
      ".cy-command-palette-panel",
      ".cy-command-palette-input",
      ".cy-command-palette-item",
      ".cy-command-palette-heading",
    ]) {
      const { clean, hostile } = computeUnderHostileHost(document, selector, [
        "display",
        "height",
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

export const TouchRows: Story = {
  tags: ["touch", "!dev"],
  args: { defaultOpen: true },
  play: async ({ args, canvas, userEvent }) => {
    const row = await canvas.findByRole("option", { name: /Rename/ });
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.pointer({ keys: "[TouchA]", target: row });
    await expect(args.onRun).toHaveBeenCalledWith("rename");
  },
};
