import { type CSSProperties, Fragment, type KeyboardEvent, useId, useMemo, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { DialogBase } from "../../foundations/DialogBase/DialogBase.js";
import { deepActiveElement } from "../../foundations/focus.js";
import { useHotkey } from "../../foundations/hotkey.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { InputBase } from "../../foundations/InputBase/InputBase.js";
import { isComposing } from "../../foundations/keys.js";
import { useActiveOption } from "../../foundations/listbox.js";
import { search } from "../../icons/search.js";
import type { IconData } from "../../icons/types.js";
import { useDismiss } from "../../overlay/dismiss.js";
import { Badge } from "../Badge/Badge.js";
import { HighlightedText } from "../HighlightedText/HighlightedText.js";
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

/** What a `filter` says about a command that matches: how well, and which letters of its label. */
export interface CommandMatch {
  /** Lower ranks first, as fuzzy matchers score. Matches without a score count as 0; ties keep `commands`' order. */
  score?: number | undefined;
  /** Indices of the matched characters in the label: they are marked (HighlightedText `positions`). */
  positions?: readonly number[] | undefined;
}

export interface CommandPaletteLabels {
  /** Accessible name of the palette. */
  title: string;
  placeholder: string;
  empty: string;
  /** Heading of the recently run commands, shown before you type. */
  recent: string;
}

/** The commands a custom filter keeps, lowest score first (a stable sort), with the positions it marked. */
function filtered(
  commands: Command[],
  query: string,
  filter: (command: Command, query: string) => CommandMatch | boolean | null | undefined,
): { found: Command[]; positions: Map<string, readonly number[]> } {
  const kept: { command: Command; score: number }[] = [];
  const positions = new Map<string, readonly number[]>();
  for (const command of commands) {
    const match = filter(command, query);
    if (!match) continue;
    const found: CommandMatch = match === true ? {} : match;
    kept.push({ command, score: found.score ?? 0 });
    positions.set(command.id, found.positions ?? []);
  }
  kept.sort((a, b) => a.score - b.score);
  return { found: kept.map((k) => k.command), positions };
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
  /**
   * Your own search, called for each command while there is a query: return a `CommandMatch` (`{ score, positions }`,
   * as fuzzy matchers return it), `true` to keep the command unmarked, or `null`/`false` to leave it out. Default:
   * every word of the query in the label or keywords, label prefixes first, the words marked.
   */
  filter?: ((command: Command, query: string) => CommandMatch | boolean | null | undefined) | undefined;
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

/** The words of a query. */
const wordsOf = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean);

/** Every word of the query must appear in the label or keywords; label prefix matches rank first. */
function rank(commands: Command[], words: string[]): Command[] {
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
  filter,
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
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useHotkey(shortcut, () => setOpen(!isOpen));

  // Each typed word is marked where it appears in a label (unless a custom filter gives the positions).
  const words = useMemo(() => wordsOf(query), [query]);
  // Rows. Browsing (no query): recent commands first, then every command under its group's heading, in first-seen
  // order. Searching: one flat list in rank order. `tagged` sections show each command's group as a tag.
  const { sections, positions } = useMemo(() => {
    const out: { name: string | undefined; items: Command[]; tagged: boolean }[] = [];
    if (words.length) {
      const { found, positions } = filter
        ? filtered(commands, query.trim(), filter)
        : { found: rank(commands, words), positions: undefined };
      out.push({ name: undefined, items: found, tagged: true });
      return { sections: out, positions };
    }
    if (recentLimit > 0) {
      const recents = recent
        .map((r) => commands.find((c) => c.id === r))
        .filter((c): c is Command => !!c)
        .slice(0, recentLimit);
      if (recents.length) out.push({ name: text.recent, items: recents, tagged: true });
    }
    const byGroup = new Map<string | undefined, Command[]>();
    for (const c of commands) byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    for (const [name, items] of byGroup) out.push({ name, items, tagged: false });
    return { sections: out, positions: undefined };
  }, [commands, query, words, filter, recent, recentLimit, text.recent]);
  const rows = sections.flatMap((s) => s.items.map((c) => ({ command: c, section: s.name })));
  // Arrows wrap around, so the last command is one key away.
  const { active, activeId, optionId, setActive, move } = useActiveOption({
    id,
    list,
    open: isOpen,
    count: rows.length,
    usable: (i) => !rows[i]?.command.disabled,
    wrap: true,
  });

  // Opening: remember where focus was, start fresh, and focus the search field.
  useClientLayoutEffect(() => {
    if (!isOpen) return;
    returnTo.current = deepActiveElement();
    setQuery("");
    setActive(0);
    input.current?.focus();
  }, [isOpen]);
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
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
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
            aria-activedescendant={activeId}
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
                      id={optionId(i)}
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
                      <span className="cy-command-palette-label cy-reset">
                        <HighlightedText
                          text={command.label}
                          query={words}
                          positions={positions?.get(command.id)}
                        />
                      </span>
                      {section.tagged && command.group && (
                        <Badge size="sm" className="cy-command-palette-tag">
                          {command.group}
                        </Badge>
                      )}
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
