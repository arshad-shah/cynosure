import {
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isRtl } from "../../foundations/dir.js";
import { HiddenValue } from "../../foundations/HiddenValue/HiddenValue.js";
import { isComposing } from "../../foundations/keys.js";
import { useActiveOption } from "../../foundations/listbox.js";
import { close } from "../../icons/close.js";
import type { IconData } from "../../icons/types.js";
import { useListboxLayer } from "../../overlay/listbox-layer.js";
import type { Size } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";
import { OptionList, OptionListItem, OptionListNote } from "../OptionList/OptionList.js";
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
  /** Announced when Backspace takes the last tag back into the field to edit. Default: "Editing design". */
  editing: (tag: string) => string;
  duplicate: (tag: string) => string;
  tooMany: (max: number) => string;
  /** Shown in the suggestion list when nothing matches. Default: "No suggestions". */
  empty: string;
}

export interface TagInputProps {
  /** The field's label and accessible name. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the field. */
  description?: ReactNode;
  /** Your own error; it replaces the field's own messages. */
  error?: ReactNode;
  /** The tags (controlled). */
  value?: string[] | undefined;
  /** Starting tags when uncontrolled. */
  defaultValue?: string[];
  /** Called with the full list of tags whenever one is added or removed. */
  onChange?: ((tags: string[]) => void) | undefined;
  /** Offered while typing (and with Arrow Down). Free text is still allowed. */
  suggestions?: string[] | undefined;
  /** Typing one of these adds the text as a tag (Enter always does). Pasted text is split on them. Default: [","]. */
  separators?: string[];
  /** Allows the same tag more than once. Otherwise a tag already in the list (ignoring case) is refused. */
  allowDuplicates?: boolean;
  /** The most tags allowed; more are refused with a message. */
  maxTags?: number | undefined;
  /** Return a message to refuse a tag (shown as the field's error), or null to accept it. */
  validate?: ((tag: string, tags: string[]) => string | null) | undefined;
  /** Form field name; each tag is submitted as its own value under it. */
  name?: string | undefined;
  /** `id` of the form the tags are submitted with, when the field sits outside it. */
  form?: string | undefined;
  /** The form cannot be submitted while there are no tags. */
  required?: boolean | undefined;
  /** Blocks typing and removing tags, and leaves the tags out of the form submission. */
  disabled?: boolean | undefined;
  /** Hint shown in the input while nothing is typed. */
  placeholder?: string | undefined;
  /** Draws a tag's content in place of its text (the remove button is still named by the text). */
  renderTag?: ((tag: string) => ReactNode) | undefined;
  /** Icon at the start of the field, before the input. */
  iconStart?: IconData | undefined;
  /** Field height and text size. Default "md". */
  size?: Size;
  /** `outline` or `soft` (tinted, borderless until focus). Default "outline". */
  variant?: "outline" | "soft";
  /** Replace the built-in English text: the tag list's name, the remove buttons, announcements and refusals. */
  labels?: Partial<TagInputLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-tag-input-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: TagInputLabels = {
  tags: "Tags",
  remove: (tag) => `Remove ${tag}`,
  added: (tag) => `${tag} added`,
  removed: (tag) => `${tag} removed`,
  editing: (tag) => `Editing ${tag}`,
  duplicate: (tag) => `${tag} is already added`,
  tooMany: (max) => `Up to ${max} tags`,
  empty: "No suggestions",
};

/** Left and Right as they would be in left-to-right text: in right-to-left text the tags lie to the right. */
const inlineKey = (key: string, el: Element) =>
  (key === "ArrowLeft" || key === "ArrowRight") && isRtl(el)
    ? key === "ArrowLeft"
      ? "ArrowRight"
      : "ArrowLeft"
    : key;

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
  renderTag,
  iconStart,
  size = "md",
  variant = "outline",
  labels,
  className,
  style,
}: TagInputProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const listId = `${id}-list`;
  const [tags, update, resetTags] = useControllableState(value, defaultValue, onChange);
  const [typed, setTyped] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const [open, setOpen] = useState(false);
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
  const { active, activeId, optionId, setActive, first, last, move } = useActiveOption({
    id: listId,
    list,
    open: listOpen,
    count: matches.length,
  });

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
  useClientLayoutEffect(() => {
    anchor.current = input.current?.closest<HTMLElement>(".cy-text-field") ?? null;
  });
  useListboxLayer({ anchor, list, open: listOpen, onClose: () => setOpen(false) });

  const removeButtons = () => [...(chips.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(event)) return;
    const el = event.currentTarget;
    if (separators.includes(event.key)) {
      event.preventDefault();
      commitTyped();
      return;
    }
    switch (inlineKey(event.key, el)) {
      case "Enter": {
        const pick = listOpen ? matches[active] : undefined;
        if (pick) {
          event.preventDefault();
          if (add([pick])) setTyped("");
        } else if (commitTyped()) event.preventDefault();
        return;
      }
      case "Backspace":
        // In an empty field, the last tag comes back into it to be edited (Enter or leaving puts it back).
        if (el.value === "" && tags.length) {
          event.preventDefault();
          const tag = tags[tags.length - 1] as string;
          setProblem(null);
          setSaid(text.editing(tag));
          update(tags.slice(0, -1));
          setTyped(tag);
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
          setActive(event.key === "ArrowUp" ? last() : first());
        } else move(event.key === "ArrowDown" ? 1 : -1);
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
    switch (inlineKey(event.key, event.currentTarget)) {
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
        iconStart={iconStart}
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
              "aria-activedescendant": activeId,
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
              <span className="cy-tag-input-text cy-reset">{renderTag ? renderTag(tag) : tag}</span>
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
        <OptionList ref={list} id={listId} label={typeof label === "string" ? label : undefined}>
          {matches.length === 0 ? (
            <OptionListNote>{text.empty}</OptionListNote>
          ) : (
            matches.map((s, index) => (
              <OptionListItem
                key={s}
                id={optionId(index)}
                label={s}
                selected={index === active}
                active={index === active}
                onPointerMove={() => setActive(index)}
                onClick={() => {
                  if (add([s])) setTyped("");
                  setOpen(false);
                }}
              />
            ))
          )}
        </OptionList>
      )}
      <span className="cy-visually-hidden" role="status">
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
          resetTags(defaultValue);
        }}
      />
    </div>
  );
}
