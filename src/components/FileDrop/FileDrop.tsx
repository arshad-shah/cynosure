import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { FileInputBase, setInputFiles } from "../../foundations/FileInputBase/FileInputBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { close } from "../../icons/close.js";
import { file as fileIcon } from "../../icons/file.js";
import { upload } from "../../icons/upload.js";
import { usePopover } from "../../overlay/floating.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface FileDropTokens {
  /** Corner radius of the drop zone. */
  radius: string;
  /** Background while files are dragged over it. */
  activeBackground: string;
  /** Behind the whole-window overlay (`target="window"`). */
  overlayBackground: string;
  /** Background of a chosen file's row (`value`). */
  fileBackground: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    fileDrop: FileDropTokens;
  }
}

export type FileRejection = { file: File; reason: "type" | "size" | "count" };

export interface FileDropLabels {
  /** Text in the zone. Default: "Drop files here, or". */
  prompt: string;
  /** The button. Defaults: "Choose files" / "Choose a file". */
  choose: string;
  chooseOne: string;
  /** Text while files are over the zone. Default: "Drop to add". */
  dragging: string;
  /** Announced after files are added. Default: "2 files added". */
  added: (count: number) => string;
  /** Why a file was turned away. */
  rejected: (rejection: FileRejection) => string;
  /** Name of the list of chosen files (`value`). Default: "Chosen files". */
  files: string;
  /** A chosen file's remove button. Default: "Remove report.pdf". */
  remove: (name: string) => string;
  /** Announced after a chosen file is removed. Default: "report.pdf removed". */
  removed: (name: string) => string;
}

export interface FileDropProps {
  /** Called with the files that passed the checks. */
  onFiles?: (files: File[]) => void;
  /**
   * Replaces the browser's file dialog: the button calls it instead of opening the file input, for an app with its
   * own picker (Electron's dialog over IPC). Put what was chosen in `value`. Dropped files still arrive in `onFiles`.
   */
  onBrowse?: (() => void) | undefined;
  /**
   * The chosen files or paths, listed in the zone by name (a File's `name`, a path as given), each with a remove
   * button when `onRemove` is set. Controlled: add to it from `onFiles` or your own picker. Display only: the native
   * input (and so a form) holds only files picked or dropped here.
   */
  value?: readonly (File | string)[] | undefined;
  /** Called with a chosen item and its index when its remove button is pressed; take it out of `value`. */
  onRemove?: ((item: File | string, index: number) => void) | undefined;
  /** Called with the files that did not, and why (they are also listed in the zone). */
  onReject?: (rejections: FileRejection[]) => void;
  /** File types, as for `<input accept>`: ".pdf,image/*". */
  accept?: string | undefined;
  /** Take more than one file at a time. */
  multiple?: boolean;
  /** Largest file in bytes. */
  maxSize?: number | undefined;
  /** Most files in one go (with `multiple`). */
  maxFiles?: number | undefined;
  /**
   * `zone` (default): files are dropped on the zone. `window`: files dropped anywhere in the window are taken, and an
   * overlay covers the page while they are dragged in (for an app whose whole page is a drop target).
   */
  target?: "zone" | "window";
  /** Shown under the prompt, e.g. "PNG or JPG, up to 5 MB". */
  hint?: ReactNode;
  /** Name the accepted files are submitted under in a form. */
  name?: string | undefined;
  /** Id of the form it belongs to, when it is not inside that form. */
  form?: string | undefined;
  /** Marks the file input as required for form validation. */
  required?: boolean | undefined;
  /** Turns off dropping and the button. */
  disabled?: boolean | undefined;
  /** Size of the zone and its button. Default "md". */
  size?: Size;
  /** Replace the built-in English text. */
  labels?: Partial<FileDropLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-file-drop-* tokens. */
  style?: CSSProperties;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const DEFAULT_LABELS: FileDropLabels = {
  prompt: "Drop files here, or",
  choose: "Choose files",
  chooseOne: "Choose a file",
  dragging: "Drop to add",
  added: (n) => `${plural(n, "file", "files")} added`,
  rejected: ({ file, reason }) =>
    `${file.name}: ${reason === "type" ? "this type of file is not accepted" : reason === "size" ? "too large" : "too many files"}`,
  files: "Chosen files",
  remove: (name) => `Remove ${name}`,
  removed: (name) => `${name} removed`,
};

/** What a chosen item is called: a File's name, or a path as given. */
const nameOf = (item: File | string) => (typeof item === "string" ? item : item.name);

/** Whether `file` matches an `accept` list (extensions, exact MIME types and `type/*` wildcards), as browsers do. */
export function acceptsFile(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .some((a) =>
      a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a,
    );
}

/**
 * A place to add files: drop them on it, or press its button to pick them. Checks type, size and count, explains
 * what it turned away, and puts the accepted files into a native file input so forms submit them.
 */
export function FileDrop({
  onFiles,
  onBrowse,
  value,
  onRemove,
  onReject,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  hint,
  target = "zone",
  name,
  form,
  required,
  disabled = false,
  size = "md",
  labels,
  className,
  style,
}: FileDropProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [over, setOver] = useState(false);
  const [status, setStatus] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const chooser = useRef<HTMLButtonElement>(null);
  const chosen = useRef<HTMLUListElement>(null);
  // After a remove, the index whose button takes focus once `value` has changed.
  const refocus = useRef<number | null>(null);
  const items = value ?? [];
  const count = items.length;
  useEffect(() => {
    const at = refocus.current;
    if (at === null) return;
    refocus.current = null;
    const buttons = chosen.current?.querySelectorAll<HTMLButtonElement>("button") ?? [];
    (buttons[Math.min(at, buttons.length - 1)] ?? (chooser.current as HTMLButtonElement)).focus();
  }, [count]);

  const take = (files: File[], fromDrop: boolean) => {
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;
    for (const file of files) {
      if (!acceptsFile(file, accept)) rejected.push({ file, reason: "type" });
      else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size" });
      else if (accepted.length >= limit) rejected.push({ file, reason: "count" });
      else accepted.push(file);
    }
    // Keep the native input in step with what was accepted, so the form submits exactly that.
    if (input.current && (fromDrop || rejected.length)) setInputFiles(input.current, accepted);
    setProblems(rejected.map(text.rejected));
    setStatus(accepted.length ? text.added(accepted.length) : "");
    if (accepted.length) onFiles?.(accepted);
    if (rejected.length) onReject?.(rejected);
  };

  const dragging = (event: { dataTransfer: DataTransfer | null }) =>
    [...(event.dataTransfer?.types ?? [])].includes("Files");
  const reset = () => {
    depth.current = 0;
    setOver(false);
  };
  const latest = useRef(take);
  latest.current = take;
  const whole = target === "window";
  const overlay = useRef<HTMLDivElement>(null);
  usePopover(overlay, whole && over);

  // A whole-window target listens on the window: the page under the files is not ours, so nothing is attached to it.
  useEffect(() => {
    if (!whole || disabled) return;
    const enter = (event: globalThis.DragEvent) => {
      if (!dragging(event)) return;
      event.preventDefault();
      depth.current += 1;
      setOver(true);
    };
    const move = (event: globalThis.DragEvent) => {
      if (!dragging(event) || !event.dataTransfer) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const leave = () => {
      depth.current -= 1;
      if (depth.current <= 0) reset();
    };
    const drop = (event: globalThis.DragEvent) => {
      if (!dragging(event) || !event.dataTransfer) return;
      event.preventDefault();
      reset();
      latest.current([...event.dataTransfer.files], true);
    };
    const all = [
      ["dragenter", enter],
      ["dragover", move],
      ["dragleave", leave],
      ["drop", drop],
    ] as const;
    for (const [type, fn] of all) window.addEventListener(type, fn);
    return () => {
      for (const [type, fn] of all) window.removeEventListener(type, fn);
      reset();
    };
  }, [whole, disabled]);
  const local = !whole;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop target; the button inside is the accessible way in
    <div
      className={className ? `cy-file-drop ${className}` : "cy-file-drop"}
      data-size={size}
      data-over={over ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-invalid={problems.length ? "" : undefined}
      style={style}
      onDragEnter={(event) => {
        if (!local || disabled || !dragging(event)) return;
        event.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(event) => {
        if (!local || disabled || !dragging(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        if (!local) return;
        depth.current -= 1;
        if (depth.current <= 0) reset();
      }}
      onDrop={(event) => {
        if (!local || disabled) return;
        event.preventDefault();
        reset();
        take([...event.dataTransfer.files], true);
      }}
    >
      <Icon icon={upload} size="lg" className="cy-file-drop-icon" />
      <span className="cy-file-drop-prompt cy-reset" id={`${id}-prompt`}>
        {over ? text.dragging : text.prompt}
      </span>
      <Button
        ref={chooser}
        variant="outline"
        tone="neutral"
        size={size}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => (onBrowse ? onBrowse() : input.current?.click())}
      >
        {multiple ? text.choose : text.chooseOne}
      </Button>
      {hint && (
        <span className="cy-file-drop-hint cy-reset" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {count > 0 && (
        <ul ref={chosen} className="cy-file-drop-files cy-reset" aria-label={text.files}>
          {items.map((item, index) => (
            <li key={`${nameOf(item)}-${index}`} className="cy-file-drop-file cy-reset">
              <Icon icon={fileIcon} size="sm" className="cy-file-drop-file-icon" />
              <span className="cy-file-drop-file-name cy-reset">
                {/* Isolated, so a path reads left to right in right-to-left text, still at the row's start. */}
                <bdi>{nameOf(item)}</bdi>
              </span>
              {onRemove && !disabled && (
                <IconButton
                  icon={close}
                  label={text.remove(nameOf(item))}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refocus.current = index;
                    setStatus(text.removed(nameOf(item)));
                    onRemove(item, index);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="cy-file-drop-alert cy-reset" role="alert">
        {problems.length > 0 && (
          <ul className="cy-file-drop-problems cy-reset">
            {problems.map((p) => (
              <li key={p} className="cy-reset">
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="cy-file-drop-status cy-reset cy-visually-hidden" role="status">
        {status}
      </span>
      {whole && (
        <div
          ref={overlay}
          className="cy-file-drop-overlay cy-reset"
          aria-hidden="true"
          data-size={size}
          {...{ popover: "manual" }}
        >
          <Icon icon={upload} size="lg" />
          <span className="cy-reset">{text.dragging}</span>
        </div>
      )}
      <FileInputBase
        ref={input}
        className="cy-file-drop-input cy-visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        accept={accept}
        multiple={multiple}
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        onFiles={(files) => take(files, false)}
      />
    </div>
  );
}
