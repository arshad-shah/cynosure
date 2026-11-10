import {
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { isComposing } from "../../foundations/keys.js";
import { close } from "../../icons/close.js";
import { useListboxLayer } from "../../overlay/listbox-layer.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";
import { TextField } from "../TextField/TextField.js";

export interface TagInputTokens {
  /** Background of a tag. */
  tagBackground: string;
  /** Corner radius of a tag. */
  tagRadius: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    tagInput: TagInputTokens;
  }
}

export interface TagInputLabels {
  /** Name of the list of tags. Default: "Tags". */
  tags: string;
  remove: (tag: string) => string;
  added: (tag: string) => string;
  removed: (tag: string) => string;
  duplicate: (tag: string) => string;
  tooMany: (max: number) => string;
  /** Shown in the suggestion list when nothing matches. Default: "No suggestions". */
  empty: string;
}

export interface TagInputProps {
  label: ReactNode;
  labelHidden?: boolean | undefined;
  description?: ReactNode;
  error?: ReactNode;
  value?: string[] | undefined;
  defaultValue?: string[];
  onChange?: ((tags: string[]) => void) | undefined;
  /** Offered while typing (and with Arrow Down). Free text is still allowed. */
  suggestions?: string[] | undefined;
  /** Typing one of these adds the text as a tag (Enter always does). Pasted text is split on them. Default: [","]. */
  separators?: string[];
  allowDuplicates?: boolean;
  maxTags?: number | undefined;
  /** Return a message to refuse a tag (shown as the field's error), or null to accept it. */
  validate?: ((tag: string, tags: string[]) => string | null) | undefined;
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  placeholder?: string | undefined;
  size?: Size;
  variant?: "outline" | "soft";
  labels?: Partial<TagInputLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-tag-input-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: TagInputLabels = {
  tags: "Tags",
  remove: (tag) => `Remove ${tag}`,
  added: (tag) => `${tag} added`,
  removed: (tag) => `${tag} removed`,
  duplicate: (tag) => `${tag} is already added`,
  tooMany: (max) => `Up to ${max} tags`,
  empty: "No suggestions",
};

/**
 * Several short values in one field: type and press Enter (or a comma), pick a suggestion, or paste a list. Tags can
 * be removed with their buttons, Backspace, or the arrow keys. Each tag is submitted under `name`.
 */
export function TagInput({
  label,
  labelHidden,
  description,
  error,
  value,
  defaultValue = [],
  onChange,
  suggestions,
  separators = [","],
  allowDuplicates = false,
  maxTags,
  validate,
  name,
  form,
  required,
  disabled,
  placeholder,
  size = "md",
  variant = "outline",
  labels,
  className,
  style,
}: TagInputProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const listId = `${id}-list`;
  const controlled = value !== undefined;
  const [own, setOwn] = useState(defaultValue);
  const tags = controlled ? value : own;
  const [typed, setTyped] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLUListElement>(null);

  const same = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase();
  const query = typed.trim();
  const matches = (suggestions ?? []).filter(
    (s) => !tags.some((t) => same(t, s)) && s.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const listOpen = open && suggestions !== undefined && !disabled;

  const update = (next: string[]) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  /** Adds each candidate that passes the checks; reports the first problem. Returns whether all were added. */
  const add = (candidates: string[]) => {
    let next = [...tags];
    let issue: string | null = null;
    for (const raw of candidates) {
      const tag = raw.trim();
      if (!tag) continue;
      if (!allowDuplicates && next.some((t) => same(t, tag))) issue ??= text.duplicate(tag);
      else if (maxTags !== undefined && next.length >= maxTags) issue ??= text.tooMany(maxTags);
      else {
        const refusal = validate?.(tag, next) ?? null;
        if (refusal) issue ??= refusal;
        else next = [...next, tag];
      }
    }
    setProblem(issue);
    if (next.length !== tags.length) {
      setSaid(text.added(next.slice(tags.length).join(", ")));
      update(next);
    }
    return issue === null;
  };

  const remove = (index: number) => {
    const tag = tags[index] as string;
    setProblem(null);
    setSaid(text.removed(tag));
    update(tags.filter((_, i) => i !== index));
  };

  const commitTyped = () => {
    if (!query) return false;
    if (add([query])) setTyped("");
    return true;
  };

  const split = (s: string) =>
    [...separators, "\n"].reduce<string[]>((parts, sep) => parts.flatMap((p) => p.split(sep)), [s]);

  // The list drops from the whole field (chips and input), found before the layer shows.
  useLayoutEffect(() => {
    anchor.current = input.current?.closest<HTMLElement>(".cy-text-field") ?? null;
  });
  useListboxLayer({ anchor, list, open: listOpen, onClose: () => setOpen(false) });
  useEffect(() => {
    if (active >= matches.length) setActive(Math.max(0, matches.length - 1));
  }, [active, matches.length]);

  const removeButtons = () => [...(chips.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(event)) return;
    const el = event.currentTarget;
    if (separators.includes(event.key)) {
      event.preventDefault();
      commitTyped();
      return;
    }
    switch (event.key) {
      case "Enter": {
        const pick = listOpen ? matches[active] : undefined;
        if (pick) {
          event.preventDefault();
          if (add([pick])) setTyped("");
        } else if (commitTyped()) event.preventDefault();
        return;
      }
      case "Backspace":
        if (el.value === "" && tags.length) {
          event.preventDefault();
          remove(tags.length - 1);
        }
        return;
      case "ArrowLeft":
        if (el.selectionStart === 0 && el.selectionEnd === 0 && tags.length) {
          event.preventDefault();
          removeButtons().at(-1)?.focus();
        }
        return;
      case "ArrowDown":
      case "ArrowUp":
        if (!suggestions) return;
        event.preventDefault();
        if (!listOpen) {
          setOpen(true);
          setActive(event.key === "ArrowUp" ? Math.max(0, matches.length - 1) : 0);
        } else
          setActive((a) =>
            Math.min(Math.max(a + (event.key === "ArrowDown" ? 1 : -1), 0), Math.max(0, matches.length - 1)),
          );
        return;
      case "Escape":
        if (listOpen) {
          event.preventDefault();
          setOpen(false);
        }
        return;
    }
  };

  const onTagKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const buttons = removeButtons();
    const toInput = () => input.current?.focus();
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        buttons[Math.max(0, index - 1)]?.focus();
        return;
      case "ArrowRight":
        event.preventDefault();
        if (index >= buttons.length - 1) toInput();
        else buttons[index + 1]?.focus();
        return;
      case "Backspace":
      case "Delete":
        event.preventDefault();
        remove(index);
        // Focus the tag before it, or the input when none is left on that side.
        requestAnimationFrame(() => {
          const left = removeButtons();
          if (left.length && index > 0) left[index - 1]?.focus();
          else toInput();
        });
        return;
      case "Escape":
        toInput();
        return;
    }
  };

  return (
    <div className={className ? `cy-tag-input ${className}` : "cy-tag-input"} data-size={size} style={style}>
      <TextField
        ref={input}
        label={label}
        labelHidden={labelHidden}
        description={description}
        error={error ?? problem ?? undefined}
        size={size}
        variant={variant}
        placeholder={placeholder}
        disabled={disabled}
        required={required && tags.length === 0}
        form={form}
        autoComplete="off"
        value={typed}
        {...(suggestions
          ? {
              role: "combobox",
              "aria-autocomplete": "list" as const,
              "aria-expanded": listOpen,
              "aria-controls": listId,
              "aria-activedescendant": listOpen && matches.length ? `${listId}-${active}` : undefined,
            }
          : {})}
        onChange={(next) => {
          setTyped(next);
          setProblem(null);
          if (suggestions) setOpen(next.trim() !== "");
        }}
        onKeyDown={onKeyDown}
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => {
          const pasted = event.clipboardData.getData("text");
          const parts = split(pasted);
          if (parts.length < 2) return;
          event.preventDefault();
          add(parts);
        }}
        onBlur={() => {
          setOpen(false);
          commitTyped();
        }}
      />
      {tags.length > 0 && (
        <ul ref={chips} className="cy-tag-input-tags cy-reset" aria-label={text.tags}>
          {tags.map((tag, index) => (
            <li key={`${tag}-${index}`} className="cy-tag-input-tag cy-reset">
              <span className="cy-tag-input-text cy-reset">{tag}</span>
              {!disabled && (
                <IconButton
                  icon={close}
                  label={text.remove(tag)}
                  variant="ghost"
                  size="sm"
                  tabIndex={-1}
                  onClick={() => {
                    remove(index);
                    input.current?.focus();
                  }}
                  onKeyDown={onTagKeyDown(index)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {suggestions && (
        <div
          ref={list}
          id={listId}
          role="listbox"
          aria-label={typeof label === "string" ? label : undefined}
          className="cy-combobox-list"
          {...{ popover: "manual" }}
        >
          {matches.length === 0 ? (
            <div
              role="option"
              aria-disabled="true"
              aria-selected="false"
              tabIndex={-1}
              className="cy-combobox-note"
            >
              {text.empty}
            </div>
          ) : (
            matches.map((s, index) => (
              <div
                key={s}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                data-active={index === active ? "" : undefined}
                className="cy-combobox-option"
                tabIndex={-1}
                onPointerMove={() => setActive(index)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (add([s])) setTyped("");
                  setOpen(false);
                }}
                onKeyDown={() => {}}
              >
                <span className="cy-combobox-option-text">
                  <span className="cy-combobox-option-label">{s}</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}
      <span className="cy-tag-input-status cy-reset" role="status">
        {said}
      </span>
      {tags.map((tag, index) => (
        <HiddenValue key={`${tag}-${index}`} name={name} form={form} value={tag} disabled={disabled} />
      ))}
      {/* Not submitted: only listens for the form's reset to restore defaultValue. */}
      <HiddenValue
        form={form}
        value=""
        disabled
        onReset={() => {
          setTyped("");
          setProblem(null);
          if (!controlled) setOwn(defaultValue);
        }}
      />
    </div>
  );
}
