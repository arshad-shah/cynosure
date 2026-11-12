import { type CSSProperties, forwardRef, type KeyboardEvent, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { isComposing } from "../../foundations/keys.js";
import { edit } from "../../icons/edit.js";
import { plus } from "../../icons/plus.js";
import { trash } from "../../icons/trash.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { Field } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";
import { SortableList } from "../SortableList/SortableList.js";
import { TextField } from "../TextField/TextField.js";

export interface ChecklistTokens {
  /** Space between rows, and between the rows and the add field. */
  gap: string;
  /** Space between a row's checkbox, name and buttons. */
  rowGap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    checklist: ChecklistTokens;
  }
}

export interface ChecklistItem {
  /** Stable and unique: React keys, focus and reordering follow it. */
  id: string;
  /** The row's name. */
  label: string;
  /** Whether it is ticked. */
  done: boolean;
}

export interface ChecklistLabels {
  /** Name and placeholder of the field that adds a row. Default "Add an item". */
  add: string;
  /** Name of the button next to that field. Default "Add". */
  addButton: string;
  /** Name of a row's rename button, and of the field it opens. Default "Rename Buy milk". */
  rename: (name: string) => string;
  /** Name of a row's remove button. Default "Remove Buy milk". */
  remove: (name: string) => string;
}

export interface ChecklistProps {
  /** What the rows are ("Subtasks"). Names the list; shown above it unless `labelHidden`. */
  label: string;
  /** Visually hide the label (it still names the list). Default false. */
  labelHidden?: boolean;
  /** The rows, when you control them: `{ id, label, done }`. */
  items?: ChecklistItem[] | undefined;
  /** Starting rows when uncontrolled. */
  defaultItems?: ChecklistItem[];
  /** Called with the full list after each change: a row added, ticked, renamed, removed or moved. */
  onChange?: ((items: ChecklistItem[]) => void) | undefined;
  /** Makes the id of a new row. Default: `crypto.randomUUID()`, or a time-based id where that is missing. */
  createId?: () => string;
  /** The most rows the list may hold; the add field turns off when it is full. */
  maxItems?: number | undefined;
  /** Rows get a grip to drag, or to move with Space and the arrow keys (SortableList). Default false. */
  reorderable?: boolean;
  /** Turns off every checkbox, field and button. Default false. */
  disabled?: boolean;
  /** Shows the rows as they are: nothing can be ticked, added, renamed, removed or moved. Default false. */
  readOnly?: boolean;
  /** Size of the checkboxes, text, fields and buttons. Default "md". */
  size?: "sm" | "md";
  /** Replace the built-in English text. */
  labels?: Partial<ChecklistLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-checklist-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ChecklistLabels = {
  add: "Add an item",
  addButton: "Add",
  rename: (name) => `Rename ${name}`,
  remove: (name) => `Remove ${name}`,
};

let made = 0;
const newId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `item-${Date.now().toString(36)}-${(++made).toString(36)}`;

const CHECK = ".cy-choice input";
const RENAME = ".cy-checklist-rename";
const FIELD = ".cy-text-field-input";
const ADD = `.cy-checklist-add ${FIELD}`;

/**
 * A list of rows people add, tick, rename and remove: a task's subtasks, a packing list, the steps of a recipe.
 * Built from Checkbox, TextField and IconButton; with `reorderable` the rows sit in a SortableList.
 */
export const Checklist = forwardRef<HTMLDivElement, ChecklistProps>(function Checklist(
  {
    label,
    labelHidden = false,
    items,
    defaultItems = [],
    onChange,
    createId = newId,
    maxItems,
    reorderable = false,
    disabled = false,
    readOnly = false,
    size = "md",
    labels,
    className,
    style,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [rows, setRows] = useControllableState(items, defaultItems, onChange);
  const [draft, setDraft] = useState("");
  /** The id of the row being renamed. */
  const [editing, setEditing] = useState<string | null>(null);
  /** Set by Escape, so the blur that follows throws the typed name away. */
  const cancelled = useRef(false);
  const body = useRef<HTMLDivElement>(null);
  /** Selector (inside the body) of what to focus once the rows have rendered. */
  const focusNext = useRef<string | null>(null);
  const full = maxItems !== undefined && rows.length >= maxItems;

  useClientLayoutEffect(() => {
    const selector = focusNext.current;
    if (selector === null) return;
    focusNext.current = null;
    body.current?.querySelector<HTMLElement>(selector)?.focus();
  });

  const inRow = (id: string, part: string) => `[data-item="${CSS.escape(id)}"] ${part}`;
  const update = (id: string, patch: Partial<ChecklistItem>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    const item = { id: createId(), label: name, done: false };
    // Focus stays in the add field for the next row; when the list is now full, it goes to the new row.
    focusNext.current = maxItems !== undefined && rows.length + 1 >= maxItems ? inRow(item.id, CHECK) : ADD;
    setRows([...rows, item]);
    setDraft("");
  };
  const remove = (id: string) => {
    const at = rows.findIndex((r) => r.id === id);
    const rest = rows.filter((r) => r.id !== id);
    // Focus the row that took its place (or the one before it), else the add field.
    const next = rest[at] ?? rest[at - 1];
    focusNext.current = next ? inRow(next.id, CHECK) : ADD;
    setRows(rest);
  };
  const rename = (id: string) => {
    focusNext.current = inRow(id, FIELD);
    setEditing(id);
  };
  /** Enter saves and Escape cancels, both by leaving the field: its blur is the one place a rename ends. */
  const onRenameKey = (item: ChecklistItem) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(event) || (event.key !== "Enter" && event.key !== "Escape")) return;
    // Enter must not submit a form around the list, and Escape must not close a dialog around it.
    event.preventDefault();
    event.stopPropagation();
    cancelled.current = event.key === "Escape";
    focusNext.current = inRow(item.id, RENAME);
    event.currentTarget.blur();
  };
  const endRename = (item: ChecklistItem, typed: string) => {
    const name = typed.trim();
    // An empty name is not saved: the row keeps the name it had.
    if (!cancelled.current && name && name !== item.label) update(item.id, { label: name });
    cancelled.current = false;
    setEditing(null);
  };

  const row = (item: ChecklistItem) => {
    const renaming = editing === item.id;
    return (
      <div
        className="cy-checklist-row cy-reset"
        data-item={item.id}
        data-renaming={renaming ? "" : undefined}
      >
        {/* Done rows are struck through and muted by Checkbox itself. */}
        <Checkbox
          strikeWhenChecked
          label={renaming ? <span className="cy-visually-hidden">{item.label}</span> : item.label}
          checked={item.done}
          disabled={disabled}
          size={size}
          className="cy-checklist-check"
          onChange={(done) => {
            if (!readOnly) update(item.id, { done });
          }}
        />
        {renaming && (
          <TextField
            label={text.rename(item.label)}
            labelHidden
            defaultValue={item.label}
            size={size}
            className="cy-checklist-field"
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={onRenameKey(item)}
            onBlur={(event) => endRename(item, event.currentTarget.value)}
          />
        )}
        {!readOnly && !renaming && (
          <IconButton
            icon={edit}
            label={text.rename(item.label)}
            variant="ghost"
            size={size}
            disabled={disabled}
            className="cy-checklist-rename"
            onClick={() => rename(item.id)}
          />
        )}
        {!readOnly && (
          <IconButton
            icon={trash}
            label={text.remove(item.label)}
            variant="ghost"
            size={size}
            disabled={disabled}
            onClick={() => remove(item.id)}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={className ? `cy-checklist ${className}` : "cy-checklist"}
      data-size={size}
      style={style}
    >
      <Field group label={label} labelHidden={labelHidden} size={size}>
        {(field) => (
          <div ref={body} className="cy-checklist-body cy-reset">
            {rows.length > 0 &&
              (reorderable && !readOnly ? (
                <SortableList
                  label={label}
                  items={rows.map((item) => ({ id: item.id, label: item.label, content: row(item) }))}
                  onReorder={(next) =>
                    setRows(next.map((moved) => rows.find((r) => r.id === moved.id) as ChecklistItem))
                  }
                  disabled={disabled}
                  size={size}
                />
              ) : (
                <ul className="cy-checklist-items cy-reset" aria-labelledby={field.labelId}>
                  {rows.map((item) => (
                    <li key={item.id} className="cy-checklist-item cy-reset">
                      {row(item)}
                    </li>
                  ))}
                </ul>
              ))}
            {!readOnly && (
              <div className="cy-checklist-add cy-reset">
                <TextField
                  label={text.add}
                  labelHidden
                  placeholder={text.add}
                  value={draft}
                  disabled={disabled || full}
                  size={size}
                  className="cy-checklist-field"
                  onChange={setDraft}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" || isComposing(event)) return;
                    // Enter adds a row; it must not submit a form around the list.
                    event.preventDefault();
                    add();
                  }}
                />
                <IconButton
                  icon={plus}
                  label={text.addButton}
                  variant="ghost"
                  size={size}
                  disabled={disabled || full}
                  onClick={add}
                />
              </div>
            )}
          </div>
        )}
      </Field>
    </div>
  );
});
