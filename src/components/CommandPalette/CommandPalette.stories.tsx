import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, fn, waitFor, within } from "storybook/test";
import { isApple } from "../../foundations/hotkey.js";
import { copy, download, edit, eye, file } from "../../icons/index.js";
import { createStyleSheet } from "../../styles/inline.js";
import { computeUnderHostileHost } from "../../test/hostile.js";
import { shownFully } from "../../test/settle.js";
import { Button } from "../Button/Button.js";
import { Menu } from "../Menu/Menu.js";
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
  title: "Components/Overlays/CommandPalette",
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

/** A small subsequence matcher like an app's own: letters in order, consecutive and early ones score lower. */
function fuzzy(command: Command, query: string) {
  const label = command.label.toLowerCase();
  const positions: number[] = [];
  let from = 0;
  for (const ch of query.toLowerCase().replace(/\s/g, "")) {
    const at = label.indexOf(ch, from);
    if (at < 0) return null;
    positions.push(at);
    from = at + 1;
  }
  const gaps = positions.reduce((sum, p, i) => sum + (i ? p - (positions[i - 1] as number) - 1 : p), 0);
  return { score: gaps, positions };
}
const fuzzySpy = fn(fuzzy);

export const CustomFilterRanksAndMarksItsPositions: Story = {
  args: { defaultOpen: true, filter: fuzzySpy },
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());
    // Nothing typed: the filter is not asked, and every command is listed under its group.
    await expect(fuzzySpy).not.toHaveBeenCalled();
    await expect(canvas.getByRole("group", { name: "Edit" })).toBeInTheDocument();
    const labels = () =>
      canvas.getAllByRole("option").map((o) => o.querySelector(".cy-command-palette-label")?.textContent);
    const marks = () =>
      canvas.getAllByRole("option").map((o) => [...o.querySelectorAll("mark")].map((m) => m.textContent));
    // Only the filter decides what matches: "pv" is a subsequence of "Toggle preview" alone, which the built-in
    // search (whole words) would not find.
    await userEvent.keyboard("pv");
    await expect(fuzzySpy).toHaveBeenCalledWith(expect.objectContaining({ id: "preview" }), "pv");
    await expect(labels()).toEqual(["Toggle preview"]);
    // Its positions feed the marks: exactly those letters.
    await expect(marks()).toEqual([["p", "v"]]);
    // Results come in score order, lowest first: "ee" scores Rename 4, New file 6, Save file 7, Toggle preview 8.
    await userEvent.clear(input);
    await userEvent.keyboard("ee");
    await expect(labels()).toEqual(["Rename", "New file", "Save file", "Toggle preview"]);
    await expect(activeLabel(input)).toMatch(/^Rename/);
  },
};

const acceptAll = fn(() => true);

export const SearchResultsAreFlatWithCategoryTags: Story = {
  args: { defaultOpen: true },
  play: async ({ args, canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());
    const tags = () =>
      canvas.getAllByRole("option").map((o) => o.querySelector(".cy-badge")?.textContent ?? null);
    // Browsing: commands sit under their group's heading, so no row repeats its group.
    await expect(tags().every((t) => t === null)).toBe(true);
    // Searching: one flat list in rank order, no headings, and each row carries its group as a small tag.
    await userEvent.keyboard("e");
    await expect(canvas.queryAllByRole("group", { name: /File|Edit|View/ })).toEqual([]);
    const rows = canvas.getAllByRole("option");
    await expect(rows.length).toBeGreaterThan(3);
    await expect(rows.map((r) => r.querySelector(".cy-badge")?.textContent)).toEqual(
      rows.map((r) => commands.find((c) => r.textContent?.startsWith(c.label))?.group),
    );
    // The tag is smaller than the label and sits between it and the shortcut.
    const save = canvas.getByRole("option", { name: /^Save file/ });
    const badge = save.querySelector(".cy-badge") as HTMLElement;
    await expect(badge.getBoundingClientRect().height).toBeLessThan(save.getBoundingClientRect().height);
    await expect(badge.getBoundingClientRect().left).toBeGreaterThan(
      (save.querySelector(".cy-command-palette-label") as HTMLElement).getBoundingClientRect().left,
    );
    // Run one: it then shows under "Recent", a flat list of mixed groups, tagged too.
    await userEvent.keyboard("{Enter}");
    await expect(args.onRun).toHaveBeenCalled();
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(canvas.getByRole("group", { name: "Recent" })).toBeInTheDocument());
    const recent = canvas.getByRole("group", { name: "Recent" });
    await expect(recent.querySelector(".cy-badge")).not.toBeNull();
  },
};

export const FilterMayAnswerTrueOrNothing: Story = {
  args: {
    defaultOpen: true,
    commands: [...commands, { id: "about", label: "About" }],
    filter: (command, query) =>
      command.id === "about" ? acceptAll() : command.label.includes(query) ? {} : null,
  },
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox", { name: "Command palette" });
    await waitFor(() => expect(input).toHaveFocus());
    // `true` and a match without positions keep the command and mark nothing; null drops it. A command without a
    // group carries no tag.
    await userEvent.keyboard("Re");
    const rows = canvas.getAllByRole("option");
    await expect(rows.map((r) => r.textContent)).toEqual([expect.stringMatching(/^Rename/), "About"]);
    await expect(rows[1]?.querySelector(".cy-badge")).toBeNull();
    await expect(rows.map((r) => r.querySelector("mark"))).toEqual([null, null]);
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

/* Commands built from the query: a number offers "Go to line N". */
function GoToLine({
  onRun,
  onQueryChange,
}: {
  onRun: (id: string) => void;
  onQueryChange: (q: string) => void;
}) {
  const [query, setQuery] = useState("");
  const line = /^\d+$/.test(query.trim()) ? query.trim() : "";
  const built: Command[] = line ? [{ id: `line:${line}`, label: `Go to line ${line}`, group: "Go" }] : [];
  return (
    <CommandPalette
      defaultOpen
      commands={[...built, ...commands]}
      filter={(command, q) => command.id.startsWith("line:") || command.label.toLowerCase().includes(q)}
      onRun={onRun}
      onQueryChange={(q) => {
        onQueryChange(q);
        setQuery(q);
      }}
    />
  );
}

export const CommandsBuiltFromTheQuery: Story = {
  render: (args) => <GoToLine onRun={args.onRun} onQueryChange={args.onQueryChange as (q: string) => void} />,
  args: { onQueryChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("42");
    // Every change of the query is reported, and the commands made from it are listed and run like any other.
    await expect(args.onQueryChange).toHaveBeenCalledWith("4");
    await expect(args.onQueryChange).toHaveBeenLastCalledWith("42");
    await waitFor(() => expect(activeLabel(input)).toContain("Go to line 42"));
    await userEvent.keyboard("{Backspace}");
    await waitFor(() => expect(activeLabel(input)).toContain("Go to line 4"));
    await userEvent.keyboard("{Enter}");
    await expect(args.onRun).toHaveBeenCalledWith("line:4");
  },
};

const RECENT_KEY = "cy-story-recent-commands";
const recentStored = () => JSON.parse(localStorage.getItem(RECENT_KEY) ?? "null");

function Remountable(
  props: Partial<ComponentProps<typeof CommandPalette>> & { onRun: (id: string) => void },
) {
  const [mount, setMount] = useState(0);
  return (
    <>
      <Button onClick={() => setMount((m) => m + 1)}>Reload</Button>
      <CommandPalette key={mount} commands={commands} {...props} />
    </>
  );
}

export const RecentCommandsPersistUnderAKey: Story = {
  beforeEach: () => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(["preview", "gone"]));
    return () => localStorage.removeItem(RECENT_KEY);
  },
  render: (args) => <Remountable onRun={args.onRun} recentKey={RECENT_KEY} />,
  play: async ({ canvas, userEvent }) => {
    // What was saved comes back (ids no command has any more are skipped).
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(palette().open).toBe(true));
    await waitFor(() =>
      expect(canvas.getByRole("group", { name: "Recent" })).toHaveTextContent("Toggle preview"),
    );
    await userEvent.keyboard("rename{Enter}");
    await settledClosed(palette());
    await expect(recentStored()).toEqual(["rename", "preview", "gone"]);
    // A new palette (a reload) reads them again, newest first.
    await userEvent.click(canvas.getByRole("button", { name: "Reload" }));
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(palette().open).toBe(true));
    const recent = canvas.getByRole("group", { name: "Recent" });
    await waitFor(() =>
      expect(
        within(recent)
          .getAllByRole("option")
          .map((o) => o.textContent),
      ).toEqual([expect.stringContaining("Rename"), expect.stringContaining("Toggle preview")]),
    );
  },
};

const asyncStore = new Map<string, string>([["recent", JSON.stringify(["copy-path"])]]);
const asyncStorage = {
  get: async (key: string) => asyncStore.get(key) ?? null,
  set: async (key: string, value: string) => {
    asyncStore.set(key, value);
  },
};
const brokenStorage = {
  get: () => {
    throw new Error("blocked");
  },
  set: () => {
    throw new Error("blocked");
  },
};

export const RecentCommandsInAsyncOrBrokenStorage: Story = {
  render: (args) => (
    <>
      <Remountable onRun={args.onRun} recentKey="recent" recentStorage={asyncStorage} shortcut="mod+k" />
      <Remountable onRun={args.onRun} recentKey="recent" recentStorage={brokenStorage} shortcut="mod+j" />
    </>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.keyboard(MOD_K);
    await waitFor(() => expect(canvas.getByRole("group", { name: "Recent" })).toHaveTextContent("Copy path"));
    await userEvent.keyboard("save{Enter}");
    await waitFor(() => expect(asyncStore.get("recent")).toBe(JSON.stringify(["save", "copy-path"])));
    // Storage that throws never breaks the palette: it keeps its recent list in memory.
    await userEvent.keyboard(isApple() ? "{Meta>}j{/Meta}" : "{Control>}j{/Control}");
    const second = document.querySelectorAll("dialog.cy-command-palette")[1] as HTMLDialogElement;
    await waitFor(() => expect(second.open).toBe(true));
    await userEvent.keyboard("rename{Enter}");
    await expect(args.onRun).toHaveBeenLastCalledWith("rename");
  },
};

export const ControlledRecentCommands: Story = {
  args: { defaultOpen: true, recent: ["copy-path"], onRecentChange: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "Recent" })).toHaveTextContent("Copy path");
    const input = canvas.getByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("rename{Enter}");
    await expect(args.onRecentChange).toHaveBeenCalledWith(["rename", "copy-path"]);
  },
};

const withReason: Command[] = [
  { id: "open", label: "Open file", group: "File" },
  {
    id: "export",
    label: "Export as PDF",
    group: "File",
    disabled: true,
    disabledReason: "Open a document first",
  },
  { id: "print", label: "Print", group: "File", disabled: true },
  { id: "close", label: "Close file", group: "File" },
];

export const ADisabledCommandSaysWhy: Story = {
  args: { defaultOpen: true, commands: withReason },
  play: async ({ args, canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    const exportRow = canvas.getByRole("option", { name: /Export as PDF/ });
    // The reason is shown in the row and is the option's description.
    await expect(exportRow).toHaveTextContent("Open a document first");
    await expect(exportRow).toHaveAttribute("aria-disabled", "true");
    await expect(exportRow).toHaveAccessibleDescription("Open a document first");
    // Arrows reach a command that says why (a bare disabled one is still skipped), so the reason is read.
    await userEvent.keyboard("{ArrowDown}");
    await expect(activeLabel(input)).toContain("Export as PDF");
    // Enter or a click runs nothing and announces the reason.
    await userEvent.keyboard("{Enter}");
    await expect(args.onRun).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Export as PDF is unavailable: Open a document first",
      ),
    );
    await expect(palette().open).toBe(true);
    await userEvent.click(exportRow);
    await expect(args.onRun).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowDown}");
    await expect(activeLabel(input)).toContain("Close file");
  },
};

export const DisabledReasonLabelsOverride: Story = {
  args: {
    defaultOpen: true,
    commands: withReason,
    labels: { unavailable: (label, reason) => `${label} indisponible : ${reason}` },
  },
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Export as PDF indisponible : Open a document first",
      ),
    );
  },
};

function MenuOpensPalette() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Before the Menu in the tree, so the palette opens while the menu item still has focus. */}
      <CommandPalette commands={commands} onRun={() => {}} open={open} onOpenChange={setOpen} />
      <Menu
        label="Go"
        trigger={(p) => <Button {...p}>Go</Button>}
        items={[{ value: "palette", label: "Command palette" }]}
        onSelect={() => setOpen(true)}
      />
    </>
  );
}

export const FocusReturnsToTheMenuButtonAfterAMenuItemOpenedIt: Story = {
  render: () => <MenuOpensPalette />,
  play: async ({ canvas, userEvent }) => {
    const go = canvas.getByRole("button", { name: "Go" });
    await userEvent.click(go);
    await userEvent.click(await canvas.findByRole("menuitem", { name: "Command palette" }));
    const el = palette();
    await waitFor(() => expect(el.open).toBe(true));
    await waitFor(() => expect(canvas.getByRole("combobox", { name: "Command palette" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await settledClosed(el);
    // The menu item it came from is hidden now; focus lands on the button that opened the menu.
    await waitFor(() => expect(go).toHaveFocus());
  },
};
