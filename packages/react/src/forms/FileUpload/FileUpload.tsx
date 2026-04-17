import {
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cn } from '../../utils/cn.js';
import {
  dropZone,
  fileMeta,
  fileName,
  fileSize,
  list,
  listItem,
  removeButton,
  root,
  thumbnail,
} from './FileUpload.css.js';
import { FileUploadContext, useFileUploadContext } from './context.js';

export type FileUploadErrorReason = 'type' | 'size' | 'count';

export interface FileUploadError {
  reason: FileUploadErrorReason;
  message: string;
  file?: File;
}

export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  /** Hard cap on number of files; ignored when `multiple` is false. */
  maxCount?: number;
  multiple?: boolean;
  disabled?: boolean;
  value?: File[];
  defaultValue?: File[];
  onFilesChange?: (files: File[]) => void;
  onError?: (error: FileUploadError) => void;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const XIcon = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const matchesAccept = (file: File, accept?: string): boolean => {
  if (!accept) return true;
  const tokens = accept.split(',').map((t) => t.trim().toLowerCase());
  return tokens.some((token) => {
    if (token === '') return true;
    if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token);
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, token.indexOf('/'));
      return file.type.toLowerCase().startsWith(`${prefix}/`);
    }
    return file.type.toLowerCase() === token;
  });
};

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  function FileUpload(props, ref) {
    const {
      accept,
      maxSize,
      maxCount,
      multiple = false,
      disabled = false,
      value,
      defaultValue,
      onFilesChange,
      onError,
      id: idProp,
      name,
      className,
      style,
      children,
    } = props;

    const fallbackId = useId();
    const inputId = idProp ?? fallbackId;

    const [files, setFiles] = useControllableState<File[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onFilesChange,
    });

    const inputRef = useRef<HTMLInputElement | null>(null);

    const validateAndAdd = useCallback(
      (incoming: FileList | File[]) => {
        const list = Array.from(incoming);
        const kept: File[] = [];
        for (const file of list) {
          if (!matchesAccept(file, accept)) {
            onError?.({
              reason: 'type',
              message: `${file.name} is not an accepted file type.`,
              file,
            });
            continue;
          }
          if (maxSize !== undefined && file.size > maxSize) {
            onError?.({ reason: 'size', message: `${file.name} exceeds the maximum size.`, file });
            continue;
          }
          kept.push(file);
        }
        const combined = multiple ? [...files, ...kept] : kept.slice(0, 1);
        if (maxCount !== undefined && combined.length > maxCount) {
          onError?.({ reason: 'count', message: `Only ${maxCount} files allowed.` });
          setFiles(combined.slice(0, maxCount));
          return;
        }
        setFiles(combined);
      },
      [accept, maxSize, maxCount, multiple, files, onError, setFiles],
    );

    const openFileDialog = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const removeFile = useCallback(
      (index: number) => {
        const next = files.slice();
        next.splice(index, 1);
        setFiles(next);
      },
      [files, setFiles],
    );

    const context = useMemo(
      () => ({ files, disabled, accept, multiple, inputId, openFileDialog, removeFile }),
      [files, disabled, accept, multiple, inputId, openFileDialog, removeFile],
    );

    return (
      <FileUploadContext.Provider value={context}>
        <div ref={ref} className={cn(root, className)} style={style}>
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            hidden
            onChange={(e) => {
              if (e.target.files) validateAndAdd(e.target.files);
              // Reset so the same file can be re-chosen
              e.target.value = '';
            }}
          />
          {children ?? (
            <>
              <FileUploadTrigger>Drop files here, or click to browse</FileUploadTrigger>
              <FileUploadList />
            </>
          )}
        </div>
      </FileUploadContext.Provider>
    );
  },
);

export interface FileUploadTriggerProps {
  children?: ReactNode;
  className?: string;
}

/** Drop zone + click-to-browse trigger. Keyboard accessible (Enter/Space). */
export function FileUploadTrigger({ children, className }: FileUploadTriggerProps) {
  const ctx = useFileUploadContext();
  const [over, setOver] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      ctx.openFileDialog();
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    if (ctx.disabled) return;
    if (!event.dataTransfer?.files?.length) return;
    // Synthesize a change event to reuse the validation pipeline via the
    // underlying input. This preserves a single source of truth.
    const input = document.getElementById(ctx.inputId) as HTMLInputElement | null;
    if (!input) return;
    const dt = new DataTransfer();
    for (const file of Array.from(event.dataTransfer.files)) dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a native <button> doesn't accept block layout with dropzone drag events; the role+tabindex pair is the documented fallback.
    <div
      role="button"
      tabIndex={ctx.disabled ? -1 : 0}
      aria-disabled={ctx.disabled}
      aria-controls={ctx.inputId}
      className={cn(dropZone, className)}
      data-over={over || undefined}
      data-disabled={ctx.disabled || undefined}
      onClick={ctx.openFileDialog}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        if (!ctx.disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export interface FileUploadListProps {
  className?: string;
  renderItem?: (file: File, index: number) => ReactNode;
}

/** Accessible list of currently-selected files. */
export function FileUploadList({ className, renderItem }: FileUploadListProps) {
  const ctx = useFileUploadContext();
  if (ctx.files.length === 0) return null;

  return (
    <ul className={cn(list, className)} aria-live="polite">
      {ctx.files.map((file, index) => {
        if (renderItem) return renderItem(file, index);
        const isImage = file.type.startsWith('image/');
        const url = isImage ? URL.createObjectURL(file) : undefined;
        return (
          <li key={`${file.name}-${index}`} className={listItem}>
            {isImage ? (
              <img
                src={url}
                alt=""
                className={thumbnail}
                onLoad={() => url && URL.revokeObjectURL(url)}
              />
            ) : (
              <span className={thumbnail} aria-hidden="true" />
            )}
            <div className={fileMeta}>
              <span className={fileName}>{file.name}</span>
              <span className={fileSize}>{formatSize(file.size)}</span>
            </div>
            <button
              type="button"
              className={removeButton}
              aria-label={`Remove ${file.name}`}
              onClick={() => ctx.removeFile(index)}
            >
              <XIcon />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
