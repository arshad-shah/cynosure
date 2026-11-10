import { type CSSProperties, type DragEvent, type ReactNode, useId, useRef, useState } from "react";
import { FileInputBase, setInputFiles } from "../../foundations/FileInputBase/FileInputBase.js";
import { Icon } from "../../foundations/Icon/Icon.js";
import { upload } from "../../icons/upload.js";
import type { Size } from "../../tokens/schema.js";
import { Button } from "../Button/Button.js";

export interface FileDropTokens {
  /** Corner radius of the drop zone. */
  radius: string;
  /** Background while files are dragged over it. */
  activeBackground: string;
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
}

export interface FileDropProps {
  /** Called with the files that passed the checks. */
  onFiles?: (files: File[]) => void;
  /** Called with the files that did not, and why (they are also listed in the zone). */
  onReject?: (rejections: FileRejection[]) => void;
  /** File types, as for `<input accept>`: ".pdf,image/*". */
  accept?: string | undefined;
  multiple?: boolean;
  /** Largest file in bytes. */
  maxSize?: number | undefined;
  /** Most files in one go (with `multiple`). */
  maxFiles?: number | undefined;
  /** Shown under the prompt, e.g. "PNG or JPG, up to 5 MB". */
  hint?: ReactNode;
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  size?: Size;
  labels?: Partial<FileDropLabels>;
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
};

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
  onReject,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  hint,
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

  const dragging = (event: DragEvent<HTMLElement>) => [...event.dataTransfer.types].includes("Files");
  const reset = () => {
    depth.current = 0;
    setOver(false);
  };

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
        if (disabled || !dragging(event)) return;
        event.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(event) => {
        if (disabled || !dragging(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current -= 1;
        if (depth.current <= 0) reset();
      }}
      onDrop={(event) => {
        if (disabled) return;
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
        variant="outline"
        tone="neutral"
        size={size}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => input.current?.click()}
      >
        {multiple ? text.choose : text.chooseOne}
      </Button>
      {hint && (
        <span className="cy-file-drop-hint cy-reset" id={`${id}-hint`}>
          {hint}
        </span>
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
      <span className="cy-file-drop-status cy-reset" role="status">
        {status}
      </span>
      <FileInputBase
        ref={input}
        className="cy-file-drop-input"
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
