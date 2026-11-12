import { type CSSProperties, useRef, useState } from "react";
import { useClientLayoutEffect } from "../../foundations/client-layout-effect.js";
import { useControllableState } from "../../foundations/controllable.js";
import { FileInputBase } from "../../foundations/FileInputBase/FileInputBase.js";
import { close } from "../../icons/close.js";
import { paperclip } from "../../icons/paperclip.js";
import { plus } from "../../icons/plus.js";
import { trash } from "../../icons/trash.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { IconButton } from "../IconButton/IconButton.js";
import { SortableList } from "../SortableList/SortableList.js";
import { TextArea } from "../TextArea/TextArea.js";
import { TextField } from "../TextField/TextField.js";
import { fromBulkText, type KeyValuePair, newPairId, pairName, toBulkText } from "./bulk.js";

export type { KeyValuePair };

export interface KeyValueEditorTokens {
  /** Space between the fields of a row. */
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    keyValueEditor: KeyValueEditorTokens;
  }
}

export interface KeyValueEditorLabels {
  /** Key field. Default "Key". */
  key: string;
  /** Value field. Default "Value". */
  value: string;
  /** How an unnamed row is called. Default "Row 3". */
  row: (position: number) => string;
  /** Add button. Default "Add". */
  add: string;
  /** Remove button. Default "Remove Authorization". */
  remove: (name: string) => string;
  /** On/off checkbox. Default "Use Authorization". */
  enable: (name: string) => string;
  /** With `allowFiles`: the button that picks a file for a row. Default "Attach a file to avatar". */
  attach: (name: string) => string;
  /** With `allowFiles`: the button that takes a row's file away. Default "Remove the file from avatar". */
  detach: (name: string) => string;
  /** Toggle to the text view. Default "Edit as text". */
  bulk: string;
  /** The text view's field. Default "Headers as text: one key: value per line, # turns a line off". */
  bulkField: (label: string) => string;
}

export interface KeyValueEditorProps {
  /** What the pairs are ("Headers", "Query parameters"). Names the list and the text view. */
  label: string;
  /** The pairs, when you control them. */
  pairs?: KeyValuePair[] | undefined;
  /** Starting pairs when uncontrolled. */
  defaultPairs?: KeyValuePair[];
  /** Called with the full list after each change: an edit, a row added, removed, moved or switched off. */
  onChange?: ((pairs: KeyValuePair[]) => void) | undefined;
  /** A checkbox per row to switch it off without deleting it. Default true. */
  toggleable?: boolean;
  /** A toggle to edit every pair as `key: value` lines (paste a block of headers). Default true. */
  bulkEdit?: boolean;
  /** A button per row to make its value a file instead of text (multipart form fields). `accept` limits the types. */
  allowFiles?: boolean;
  /** File types for `allowFiles`, as for `<input accept>`. */
  accept?: string | undefined;
  /** Turns off every field and button. */
  disabled?: boolean;
  /** Size of the fields and buttons. Default "md". */
  size?: Size;
  /** Replace the built-in English text. */
  labels?: Partial<KeyValueEditorLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-key-value-editor-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: KeyValueEditorLabels = {
  key: "Key",
  value: "Value",
  row: (n) => `Row ${n}`,
  add: "Add",
  remove: (name) => `Remove ${name}`,
  enable: (name) => `Use ${name}`,
  attach: (name) => `Attach a file to ${name}`,
  detach: (name) => `Remove the file from ${name}`,
  bulk: "Edit as text",
  bulkField: (label) => `${label} as text: one key: value per line, # turns a line off`,
};

/**
 * Editable key and value pairs: HTTP headers, query parameters, environment variables, metadata. Rows reorder like a
 * SortableList (grip, or Space and arrows on it), switch off without being deleted, and can be edited all at once as
 * `key: value` text. Secret values (`secret: true`) are masked.
 */
export function KeyValueEditor({
  label,
  pairs,
  defaultPairs = [],
  onChange,
  toggleable = true,
  bulkEdit = true,
  allowFiles = false,
  accept,
  disabled = false,
  size = "md",
  labels,
  className,
  style,
}: KeyValueEditorProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [rows, setRows] = useControllableState(pairs, defaultPairs, onChange);
  const [bulk, setBulk] = useState<string | null>(null);
  /** Keys that were secret when the text view opened: they stay masked however the text is retyped. */
  const secretKeys = useRef(new Set<string>());
  const root = useRef<HTMLDivElement>(null);
  /** Where focus goes after the rows change: a row's key field, or the Add button. */
  const focusNext = useRef<string | null>(null);
  /** The row a file is being picked for. One hidden file input serves every row. */
  const picking = useRef<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);

  useClientLayoutEffect(() => {
    const id = focusNext.current;
    if (id === null) return;
    focusNext.current = null;
    const target = id
      ? root.current?.querySelector<HTMLElement>(`[data-pair="${CSS.escape(id)}"] .cy-text-field-input`)
      : root.current?.querySelector<HTMLElement>(".cy-key-value-editor-add");
    target?.focus();
  });

  const update = (id: string, patch: Partial<KeyValuePair>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => {
    const pair = { id: newPairId(), key: "", value: "" };
    focusNext.current = pair.id;
    setRows([...rows, pair]);
  };
  const remove = (id: string) => {
    const at = rows.findIndex((r) => r.id === id);
    const rest = rows.filter((r) => r.id !== id);
    // Focus the row that took its place (or the one before it), else Add.
    focusNext.current = (rest[at] ?? rest[at - 1])?.id ?? "";
    setRows(rest);
  };

  const items = rows.map((pair, i) => {
    const name = pairName(pair, i, text.row);
    return {
      id: pair.id,
      label: name,
      content: (
        <div
          className="cy-key-value-editor-row cy-reset"
          data-pair={pair.id}
          data-off={pair.enabled === false ? "" : undefined}
        >
          {toggleable && (
            <Checkbox
              label={<span className="cy-visually-hidden">{text.enable(name)}</span>}
              className="cy-key-value-editor-check"
              checked={pair.enabled !== false}
              disabled={disabled}
              size={size}
              onChange={(on) => update(pair.id, { enabled: on })}
            />
          )}
          <TextField
            label={`${text.key} (${name})`}
            labelHidden
            placeholder={text.key}
            value={pair.key}
            disabled={disabled}
            size={size}
            onChange={(key) => update(pair.id, { key })}
          />
          {pair.file ? (
            <TextField
              label={`${text.value} (${name})`}
              labelHidden
              readOnly
              iconStart={paperclip}
              value={pair.file.name}
              disabled={disabled}
              size={size}
            />
          ) : (
            <TextField
              label={`${text.value} (${name})`}
              labelHidden
              placeholder={text.value}
              type={pair.secret ? "password" : "text"}
              value={pair.value}
              disabled={disabled}
              size={size}
              onChange={(value) => update(pair.id, { value })}
            />
          )}
          {allowFiles &&
            (pair.file ? (
              <IconButton
                icon={close}
                label={text.detach(name)}
                variant="ghost"
                size={size}
                disabled={disabled}
                onClick={() => update(pair.id, { file: undefined, value: "" })}
              />
            ) : (
              <IconButton
                icon={paperclip}
                label={text.attach(name)}
                variant="ghost"
                size={size}
                disabled={disabled}
                onClick={() => {
                  picking.current = pair.id;
                  picker.current?.click();
                }}
              />
            ))}
          <IconButton
            icon={trash}
            label={text.remove(name)}
            variant="ghost"
            size={size}
            disabled={disabled}
            onClick={() => remove(pair.id)}
          />
        </div>
      ),
    };
  });

  return (
    <div
      ref={root}
      className={className ? `cy-key-value-editor ${className}` : "cy-key-value-editor"}
      data-size={size}
      style={style}
    >
      {bulk === null ? (
        rows.length > 0 && (
          <SortableList
            label={label}
            items={items}
            onReorder={(next) =>
              setRows(next.map((item) => rows.find((r) => r.id === item.id) as KeyValuePair))
            }
            disabled={disabled}
            size={size}
          />
        )
      ) : (
        <TextArea
          label={text.bulkField(label)}
          labelHidden
          value={bulk}
          rows={Math.max(4, rows.length + 1)}
          disabled={disabled}
          onChange={(next) => {
            setBulk(next);
            setRows(fromBulkText(next, rows, secretKeys.current));
          }}
        />
      )}
      {allowFiles && (
        <FileInputBase
          ref={picker}
          className="cy-visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          accept={accept}
          onFiles={([file]) => {
            const id = picking.current;
            picking.current = null;
            if (id && file) update(id, { file, value: file.name, secret: false });
            if (picker.current) picker.current.value = "";
          }}
        />
      )}
      <div className="cy-key-value-editor-actions cy-reset">
        {bulk === null && (
          <Button
            icon={plus}
            variant="ghost"
            size={size}
            disabled={disabled}
            className="cy-key-value-editor-add"
            onClick={add}
          >
            {text.add}
          </Button>
        )}
        {bulkEdit && (
          <Button
            variant="ghost"
            size={size}
            pressed={bulk !== null}
            disabled={disabled}
            onClick={() => {
              secretKeys.current = new Set(rows.filter((r) => r.secret).map((r) => r.key));
              setBulk(bulk === null ? toBulkText(rows) : null);
            }}
          >
            {text.bulk}
          </Button>
        )}
      </div>
    </div>
  );
}
