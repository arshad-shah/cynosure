import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { DialogBase } from "../../foundations/DialogBase/DialogBase.js";
import { deepActiveElement } from "../../foundations/focus.js";
import { useHotkey } from "../../foundations/hotkey.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { InputBase } from "../../foundations/InputBase/InputBase.js";
import { isComposing } from "../../foundations/keys.js";
import { search } from "../../icons/search.js";
import type { IconData } from "../../icons/types.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { Kbd } from "../Kbd/Kbd.js";

export interface CommandPaletteTokens {
  width: string;
  offset: string;
  listMaxHeight: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    commandPalette: CommandPaletteTokens;
  }
}

export interface Command {
  id: string;
  label: string;
  /** Heading the command is listed under. */
  group?: string;
  /** Keys shown at the end of the row: ["Ctrl", "S"], or "mod+s" for this platform's names. Display only: bind them yourself. */
  shortcut?: string[] | string;
  icon?: IconData;
  /** More words that find it ("save" also finds "Write to disk"). */
  keywords?: string[];
  disabled?: boolean;
}

export interface CommandPaletteLabels {
  /** Accessible name of the palette. */
  title: string;
  placeholder: string;
  empty: string;
  /** Heading of the recently run commands, shown before you type. */
  recent: string;
}

export interface CommandPaletteProps {
  /** The commands to search and run. */
  commands: Command[];
  /** Called with the chosen command's id; the palette then closes. */
  onRun: (id: string) => void;
  /** Controlled: whether the palette is open. */
  open?: boolean;
  /** Open at first, when uncontrolled. */
  defaultOpen?: boolean;
  /**
   * Called when the palette opens or closes (shortcut, Escape, a press outside, running a command), with the new
   * state.
   */
  onOpenChange?: (open: boolean) => void;
  /** Global shortcut that toggles the palette (`mod` is Command on Apple platforms, else Control). `false`: none. */
  shortcut?: string | false;
  /** How many recently run commands to list before you type (default 5, 0 for none). */
  recentLimit?: number;
  /** Replace the built-in English text: the palette's name, the placeholder, the empty note and the recent heading. */
  labels?: Partial<CommandPaletteLabels>;
  /** Added to the panel, for layout. */
  className?: string;
  /** Layout only, applied to the panel. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CommandPaletteLabels = {
  title: "Command palette",
  placeholder: "Search commands",
  empty: "No commands found",
  recent: "Recent",
};

/** Every word of the query must appear in the label or keywords; label prefix matches rank first. */
function rank(commands: Command[], query: string): Command[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return commands;
  const hay = (c: Command) => [c.label, ...(c.keywords ?? [])].join(" ").toLowerCase();
  const found = commands.filter((c) => words.every((w) => hay(c).includes(w)));
  const first = words[0] as string;
  return [
    ...found.filter((c) => c.label.toLowerCase().startsWith(first)),
    ...found.filter((c) => !c.label.toLowerCase().startsWith(first)),
  ];
}

/** Search-and-run list of commands in a modal dialog, opened by a global shortcut (Ctrl or Command + K). */
export function CommandPalette({
  commands,
  onRun,
  open,
  defaultOpen = false,
  onOpenChange,
  shortcut = "mod+k",
  recentLimit = 5,
  labels,
  className,
  style,
}: CommandPaletteProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId().replace(/:/g, "");
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useHotkey(shortcut, () => setOpen(!isOpen));

  // Rows: recent commands first while the query is empty, then the matches grouped by `group` in first-seen order.
  const sections = useMemo(() => {
    const matches = rank(commands, query);
    const out: { name: string | undefined; items: Command[] }[] = [];
    if (!query && recentLimit > 0) {
      const recents = recent
        .map((r) => commands.find((c) => c.id === r))
        .filter((c): c is Command => !!c)
        .slice(0, recentLimit);
      if (recents.length) out.push({ name: text.recent, items: recents });
    }
    const byGroup = new Map<string | undefined, Command[]>();
    for (const c of matches) byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    for (const [name, items] of byGroup) out.push({ name, items });
    return out;
  }, [commands, query, recent, recentLimit, text.recent]);
  const rows = sections.flatMap((s) => s.items.map((c) => ({ command: c, section: s.name })));
  const runnable = rows.map((r, i) => (r.command.disabled ? -1 : i)).filter((i) => i >= 0);

  // Opening: remember where focus was, start fresh, and focus the search field.
  useClientLayoutEffect(() => {
    if (!isOpen) return;
    returnTo.current = deepActiveElement();
    setQuery("");
    setActive(0);
    input.current?.focus();
  }, [isOpen]);
  useEffect(() => {
    if (!runnable.includes(active)) setActive(runnable[0] ?? -1);
  });
  useEffect(() => {
    list.current?.querySelector(`#${id}-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, id]);
  useDismiss({
    open: isOpen,
    onClose: () => setOpen(false),
    inside: [dialog],
    returnFocus: returnTo,
    outside: (event) => event.composedPath()[0] === dialog.current,
  });

  const run = (command: Command | undefined) => {
    if (!command || command.disabled) return;
    setRecent((r) => [command.id, ...r.filter((x) => x !== command.id)].slice(0, 20));
    setOpen(false);
    onRun(command.id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(event)) return;
    const at = runnable.indexOf(active);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      // Arrows wrap around, so the last command is one key away.
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(runnable[(at + step + runnable.length) % runnable.length] ?? -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(rows[active]?.command);
    }
  };

  let index = -1;
  return (
    <DialogBase
      ref={dialog}
      open={isOpen}
      onCancel={() => setOpen(false)}
      onClose={() => setOpen(false)}
      className="cy-command-palette"
      aria-label={text.title}
    >
      <div
        className={
          className ? `cy-command-palette-panel cy-reset ${className}` : "cy-command-palette-panel cy-reset"
        }
        style={style}
      >
        <div className="cy-command-palette-search cy-reset">
          <Icon icon={search} className="cy-command-palette-search-icon" />
          <InputBase
            ref={input}
            className="cy-command-palette-input"
            role="combobox"
            aria-label={text.title}
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={text.placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        <div
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={text.title}
          className="cy-command-palette-list cy-reset"
        >
          {rows.length === 0 && (
            // A listbox may only hold options: the empty message is a disabled one.
            <div
              role="option"
              aria-disabled="true"
              aria-selected="false"
              tabIndex={-1}
              className="cy-command-palette-empty cy-reset"
            >
              {text.empty}
            </div>
          )}
          {sections.map((section, s) => (
            // biome-ignore lint/a11y/useSemanticElements: a listbox may only hold options and role="group" (no fieldset)
            <div
              key={`${s}-${section.name}`}
              role="group"
              aria-labelledby={section.name ? `${id}-g${s}` : undefined}
              className="cy-command-palette-group cy-reset"
            >
              {section.name && (
                <div id={`${id}-g${s}`} className="cy-command-palette-heading cy-reset" role="presentation">
                  {section.name}
                </div>
              )}
              {section.items.map((command) => {
                index++;
                const i = index;
                return (
                  <Fragment key={`${section.name}-${command.id}`}>
                    <div
                      id={`${id}-${i}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected={i === active}
                      aria-disabled={command.disabled || undefined}
                      data-active={i === active || undefined}
                      className="cy-command-palette-item cy-reset"
                      onPointerMove={() => !command.disabled && setActive(i)}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => run(command)}
                      onKeyDown={() => {}}
                    >
                      {command.icon && <Icon icon={command.icon} className="cy-command-palette-icon" />}
                      <span className="cy-command-palette-label cy-reset">{command.label}</span>
                      {command.shortcut && <Kbd keys={command.shortcut} size="sm" />}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </DialogBase>
  );
}
