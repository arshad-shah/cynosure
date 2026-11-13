import {
  type CSSProperties,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDrag } from "../../foundations/drag.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { isComposing } from "../../foundations/keys.js";
import { clamp } from "../../foundations/math.js";
import { TextAreaBase } from "../../foundations/TextAreaBase/TextAreaBase.js";
import { resizeCorner } from "../../icons/resize-corner.js";
import { useListboxLayer } from "../../overlay/listbox-layer.js";
import type { Size } from "../../tokens/schema.js";
import { Field, type FieldLayoutProps } from "../Field/Field.js";
import { OptionList, OptionListItem, OptionListNote } from "../OptionList/OptionList.js";

export interface TextAreaTokens {
  radius: string;
  paddingInline: string;
  paddingBlock: string;
  bg: string;
  border: string;
  softBg: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    textArea: TextAreaTokens;
  }
}

type NativeArea = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange" | "rows" | "className" | "style" | "children"
>;

/** A suggestion offered after the mention `trigger`. */
export interface TextAreaMention {
  /** The text put in place of the trigger and the query (a space follows it), such as "@ada". */
  value: string;
  /** Shown in the list. Default: `value`. A string label is matched by the query too. */
  label?: ReactNode;
  /** A second, muted line under the label. */
  description?: ReactNode;
}

/** Suggestions for a query: a list to filter, or a function of the query returning items or a promise of them. */
export type TextAreaSuggestions =
  | readonly (string | TextAreaMention)[]
  | ((
      query: string,
    ) => readonly (string | TextAreaMention)[] | Promise<readonly (string | TextAreaMention)[]>);

export interface TextAreaLabels {
  /** The character counter. */
  count: (count: number, max?: number) => string;
  /** Name of the suggestion list. Default: "Suggestions". */
  suggestions: string;
  /** Shown in the suggestion list while a promise is pending. Default: "Loading…". */
  loading: string;
}

export interface TextAreaProps extends NativeArea, FieldLayoutProps {
  /** The field's label and accessible name. */
  label: ReactNode;
  /** Visually hide the label (it still names the control). Prefer visible labels. */
  labelHidden?: boolean | undefined;
  /** Help text shown below the field. */
  description?: ReactNode;
  /** Error message shown below the field; it is announced and marks the field invalid. */
  error?: ReactNode;
  /** The text (controlled). */
  value?: string;
  /** Starting text when uncontrolled. */
  defaultValue?: string;
  /** Called with the new text on every edit. */
  onChange?: (value: string) => void;
  /** Show a corner grip to drag the height (pointer and touch). Content growth still applies. */
  resizable?: boolean;
  /** Minimum visible rows. */
  rows?: number;
  /** Auto-grow cap; content beyond scrolls. */
  maxRows?: number;
  /** Shows a live character counter. */
  showCount?: boolean;
  /** Text size of the field and its label. Default "md". */
  size?: Size;
  /** `outline` or `soft` (tinted, borderless until focus). Default "outline". */
  variant?: "outline" | "soft";
  /**
   * Starts a mention: typed at the start of a word (such as "@"), it opens the `suggestions` list for the text that
   * follows, up to the caret.
   */
  trigger?: string | undefined;
  /**
   * What the `trigger` offers: items filtered by the query (their value or string label contains it), or a function
   * of the query returning items or a promise of them (stale answers are ignored).
   */
  suggestions?: TextAreaSuggestions | undefined;
  /** Called with the suggestion chosen, after it is inserted. */
  onMention?: ((item: TextAreaMention) => void) | undefined;
  /** Replace the built-in English text: the character counter, the suggestion list's name and its loading note. */
  labels?: Partial<TextAreaLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: TextAreaLabels = {
  count: (n, max) => (max ? `${n} / ${max}` : `${n} characters`),
  suggestions: "Suggestions",
  loading: "Loading…",
};

const asMention = (item: string | TextAreaMention): TextAreaMention =>
  typeof item === "string" ? { value: item } : item;

/** The mention being typed: a trigger at the start of a word, then no whitespace up to a collapsed caret. */
function mentionAt(area: HTMLTextAreaElement, trigger: string) {
  const caret = area.selectionStart;
  if (caret !== area.selectionEnd) return null;
  const before = area.value.slice(0, caret);
  const start = before.lastIndexOf(trigger);
  if (start < 0) return null;
  const query = before.slice(start + trigger.length);
  if (/\s/.test(query) || /\S/.test(before.charAt(start - 1))) return null;
  return { start, query };
}

/**
 * Multi-line input that grows with its content up to `maxRows`, with an optional announced counter and mentions
 * (`trigger` and `suggestions`).
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    labelHidden,
    layout,
    width,
    description,
    error,
    value,
    defaultValue,
    onChange,
    rows = 3,
    maxRows = 12,
    resizable = true,
    showCount = false,
    size = "md",
    variant = "outline",
    labels,
    trigger,
    suggestions,
    onMention,
    maxLength,
    required,
    disabled,
    id,
    className,
    style,
    onKeyDown,
    onSelect,
    onBlur,
    onCompositionStart,
    onCompositionEnd,
    ...rest
  },
  forwarded,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const inner = useRef<HTMLTextAreaElement | null>(null);
  const [count, setCount] = useState((value ?? defaultValue ?? "").length);
  // Height chosen with the grip: becomes the floor (and lifts the cap) for content-driven sizing.
  const manual = useRef(0);
  const grip = useRef<HTMLSpanElement>(null);
  const dragFrom = useRef({ height: 0, manual: 0 });
  const ref = useCallback(
    (node: HTMLTextAreaElement | null) => {
      inner.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [forwarded],
  );

  const resize = useCallback(() => {
    const area = inner.current;
    if (!area) return;
    const cs = getComputedStyle(area);
    const line = Number.parseFloat(cs.lineHeight) || Number.parseFloat(cs.fontSize) * 1.5;
    const chrome =
      Number.parseFloat(cs.paddingTop) +
      Number.parseFloat(cs.paddingBottom) +
      Number.parseFloat(cs.borderTopWidth) +
      Number.parseFloat(cs.borderBottomWidth);
    const min = Math.max(rows * line + chrome, manual.current);
    const max = Math.max(Math.max(rows, maxRows) * line + chrome, manual.current);
    area.style.height = "auto";
    const wanted =
      area.scrollHeight + Number.parseFloat(cs.borderTopWidth) + Number.parseFloat(cs.borderBottomWidth);
    const height = Math.min(Math.max(wanted, min), max);
    area.style.height = `${height}px`;
    area.style.overflowY = wanted > max ? "auto" : "hidden";
  }, [rows, maxRows]);

  // The grip drags through detent; Escape puts the height back.
  useDrag(grip, {
    onStart: () => {
      dragFrom.current = {
        height: (inner.current as HTMLTextAreaElement).getBoundingClientRect().height,
        manual: manual.current,
      };
    },
    onMove: ({ delta }) => {
      manual.current = dragFrom.current.height + delta.y;
      resize();
      // Below the row minimum the floor wins: remember what is actually shown.
      manual.current = inner.current?.getBoundingClientRect().height ?? manual.current;
    },
    onEnd: (_, cancelled) => {
      if (!cancelled) return;
      manual.current = dragFrom.current.manual;
      resize();
    },
  });

  useLayoutEffect(resize, [resize, value]);
  // A new width rewraps the text: fit the height again. Only width changes count, since fitting sets the height.
  useEffect(() => {
    const area = inner.current;
    if (!area || typeof ResizeObserver === "undefined") return;
    let width = area.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const now = area.getBoundingClientRect().width;
      if (now === width) return;
      width = now;
      resize();
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [resize]);
  useEffect(() => {
    if (value !== undefined) setCount(value.length);
  }, [value]);
  // Mentions: the query being typed, the trigger position dismissed with Escape, and what the suggestions gave.
  const listId = `${useId()}-mentions`;
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [dismissed, setDismissed] = useState(-1);
  const [active, setActive] = useState(0);
  const [found, setFound] = useState<{ items: TextAreaMention[]; loading: boolean }>({
    items: [],
    loading: false,
  });
  const source = useRef(suggestions);
  source.current = suggestions;
  const mentions = trigger && suggestions && !disabled ? trigger : "";

  const sense = (area: HTMLTextAreaElement) => {
    if (!mentions || composing.current) return;
    const now = mentionAt(area, mentions);
    if (!now) setDismissed(-1);
    if (now?.start === mention?.start && now?.query === mention?.query) return;
    setMention(now);
    setActive(0);
  };

  const query = mention && mention.start !== dismissed ? mention.query : null;
  const fromList = Array.isArray(suggestions);
  useEffect(() => {
    const from = source.current;
    if (query === null || typeof from !== "function") return;
    let live = true;
    const answer = from(query);
    const take = (items: readonly (string | TextAreaMention)[]) => {
      if (live) setFound({ items: items.map(asMention), loading: false });
    };
    if (Array.isArray(answer)) take(answer);
    else {
      setFound((f) => ({ ...f, loading: true }));
      (answer as Promise<readonly (string | TextAreaMention)[]>).then(take, () => take([]));
    }
    return () => {
      live = false;
    };
  }, [query]);

  const lower = (query ?? "").toLocaleLowerCase();
  const items = fromList
    ? (suggestions as readonly (string | TextAreaMention)[])
        .map(asMention)
        .filter((m) =>
          `${m.value} ${typeof m.label === "string" ? m.label : ""}`.toLocaleLowerCase().includes(lower),
        )
    : found.items;
  const loading = !fromList && found.loading;
  const listOpen = query !== null && (items.length > 0 || loading);
  const at = clamp(active, 0, items.length - 1);
  const close = () => {
    if (mention) setDismissed(mention.start);
  };
  useListboxLayer({ anchor: box, list, open: listOpen, onClose: close });
  useEffect(() => {
    if (listOpen)
      list.current
        ?.querySelector(`#${CSS.escape(`${listId}-${at}`)}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [listOpen, listId, at]);

  const insert = (item: TextAreaMention) => {
    const area = inner.current as HTMLTextAreaElement;
    const { start, query: typed } = mention as { start: number; query: string };
    const end = start + mentions.length + typed.length;
    const added = `${item.value} `;
    // Typed in as an edit of the trigger and query, so it fires a real input and Undo takes it back.
    area.setSelectionRange(start, end);
    if (!area.ownerDocument.execCommand("insertText", false, added)) {
      // Without editing commands: replace the text and report it as input.
      area.setRangeText(added, start, end, "end");
      area.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setMention(null);
    onMention?.(item);
  };

  /** The list's keys while it is open; returns whether the key was used (then it is not passed on). */
  const mentionKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!listOpen || isComposing(event)) return false;
    const pick = items[at];
    const plain = !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (event.key === "Escape") close();
    else if (!pick) return false;
    else if (event.key === "ArrowDown" || event.key === "ArrowUp")
      setActive(clamp(at + (event.key === "ArrowDown" ? 1 : -1), 0, items.length - 1));
    else if ((event.key === "Enter" || event.key === "Tab") && plain) insert(pick);
    else return false;
    event.preventDefault();
    return true;
  };

  useEffect(() => {
    const form = inner.current?.form;
    if (!form) return;
    const onReset = () =>
      requestAnimationFrame(() => {
        setCount(inner.current?.value.length ?? 0);
        resize();
      });
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [resize]);

  return (
    <Field
      label={label}
      labelHidden={labelHidden}
      layout={layout}
      width={width}
      description={description}
      error={error}
      required={required}
      size={size}
      id={id}
      className={className}
      style={style}
    >
      {(field) => {
        const countId = `${field.id}-count`;
        const describedBy =
          [field.describedBy, showCount ? countId : ""].filter(Boolean).join(" ") || undefined;
        return (
          <div
            className="cy-text-area"
            data-size={size}
            data-variant={variant}
            data-disabled={disabled ? "" : undefined}
          >
            <div ref={box} className="cy-text-area-box">
              <TextAreaBase
                ref={ref}
                {...rest}
                {...(mentions
                  ? {
                      "aria-autocomplete": "list" as const,
                      "aria-haspopup": "listbox" as const,
                      "aria-controls": listOpen ? listId : undefined,
                      "aria-activedescendant": listOpen && items.length ? `${listId}-${at}` : undefined,
                    }
                  : {})}
                id={field.id}
                className="cy-text-area-input"
                rows={rows}
                maxLength={maxLength}
                required={required}
                disabled={disabled}
                invalid={field.invalid}
                aria-describedby={describedBy}
                {...(value !== undefined ? { value } : { defaultValue })}
                onChange={(e) => {
                  setCount(e.currentTarget.value.length);
                  resize();
                  sense(e.currentTarget);
                  onChange?.(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                  if (!mentionKey(e)) onKeyDown?.(e);
                }}
                onSelect={(e) => {
                  sense(e.currentTarget);
                  onSelect?.(e);
                }}
                onBlur={(e) => {
                  close();
                  onBlur?.(e);
                }}
                onCompositionStart={(e) => {
                  composing.current = true;
                  onCompositionStart?.(e);
                }}
                onCompositionEnd={(e) => {
                  composing.current = false;
                  sense(e.currentTarget);
                  onCompositionEnd?.(e);
                }}
              />
              {resizable && !disabled && (
                <span ref={grip} className="cy-text-area-grip" aria-hidden="true">
                  <Icon icon={resizeCorner} />
                </span>
              )}
            </div>
            {showCount && (
              <span id={countId} className="cy-text-area-count" aria-live="polite">
                {text.count(count, maxLength)}
              </span>
            )}
            {mentions && (
              <OptionList ref={list} id={listId} label={text.suggestions} busy={loading}>
                {items.length === 0 ? (
                  <OptionListNote>{text.loading}</OptionListNote>
                ) : (
                  items.map((item, index) => (
                    <OptionListItem
                      key={item.value}
                      id={`${listId}-${index}`}
                      label={item.label ?? item.value}
                      description={item.description}
                      selected={index === at}
                      active={index === at}
                      onPointerMove={() => setActive(index)}
                      onClick={() => insert(item)}
                    />
                  ))
                )}
              </OptionList>
            )}
          </div>
        );
      }}
    </Field>
  );
});
