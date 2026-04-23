import {
  Eye,
  FileArchive,
  FileAudio,
  FileCode,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Upload,
  X,
} from 'lucide-react';
import {
  type CSSProperties,
  type DragEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Badge, type BadgeColorScheme } from '../../feedback/Badge/Badge.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { cn } from '../../utils/cn.js';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import {
  dropZoneVariants,
  fileSize,
  iconCircle,
  iconInline,
  iconTile,
  list,
  metaDot,
  orDivider,
  removeButton,
  row,
  thumbnail,
  thumbnailDoc,
  thumbnailIcon,
} from './FileUpload.css.js';
import { FileUploadContext, type FileUploadVariant, useFileUploadContext } from './context.js';

export type { FileUploadVariant } from './context.js';

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
  /**
   * Visual treatment for the default (un-customized) trigger.
   * - `default` — large dashed drop zone with primary Browse button. The main affordance.
   * - `card` — solid bordered surface, horizontal layout. Fits in settings pages.
   * - `compact` — single dashed row. For dense forms.
   * - `minimal` — button-shaped trigger only. For toolbars and chat composers.
   */
  variant?: FileUploadVariant;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

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
      variant = 'default',
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
      () => ({ files, disabled, accept, multiple, inputId, variant, openFileDialog, removeFile }),
      [files, disabled, accept, multiple, inputId, variant, openFileDialog, removeFile],
    );

    return (
      <FileUploadContext.Provider value={context}>
        <Stack
          ref={ref as ForwardedRef<Element>}
          gap="2"
          width="full"
          className={className}
          style={style}
        >
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
              <FileUploadTrigger />
              <FileUploadList />
            </>
          )}
        </Stack>
      </FileUploadContext.Provider>
    );
  },
);

export interface FileUploadTriggerProps {
  /**
   * Override the full trigger contents. When provided, the built-in variant
   * layout is replaced wholesale.
   */
  children?: ReactNode;
  className?: string;
}

/** Drop zone + click-to-browse trigger. Keyboard accessible (Enter/Space). */
export function FileUploadTrigger({ children, className }: FileUploadTriggerProps) {
  const ctx = useFileUploadContext();
  const [over, setOver] = useState(false);
  const hintId = useId();

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

  const acceptHint = buildAcceptHint(ctx.accept);

  const content = children ?? renderVariantContent(ctx.variant, hintId, acceptHint, ctx.disabled);

  return (
    // biome-ignore lint/a11y/useSemanticElements: a native <button> doesn't accept block layout with dropzone drag events; the role+tabindex pair is the documented fallback.
    <div
      role="button"
      tabIndex={ctx.disabled ? -1 : 0}
      aria-disabled={ctx.disabled}
      aria-controls={ctx.inputId}
      aria-describedby={acceptHint ? hintId : undefined}
      data-variant={ctx.variant}
      className={cn(dropZoneVariants[ctx.variant], className)}
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
      {content}
    </div>
  );
}

const buildAcceptHint = (accept?: string): string | null => {
  if (!accept) return null;
  const tokens = accept
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return null;
  const friendly = tokens.map((t) => {
    if (t === 'image/*') return 'images';
    if (t === 'video/*') return 'video';
    if (t === 'audio/*') return 'audio';
    if (t.startsWith('.')) return t.slice(1).toUpperCase();
    const slash = t.indexOf('/');
    if (slash > 0) return t.slice(slash + 1).toUpperCase();
    return t;
  });
  return friendly.join(', ');
};

// The inner Browse <button> in each variant is visual only: it has no onClick
// of its own and is tabIndex=-1 (the outer role="button" owns keyboard focus).
// Mouse clicks bubble up to the drop-zone's onClick, which opens the file
// dialog — one open per click.

function renderVariantContent(
  variant: FileUploadVariant,
  hintId: string,
  acceptHint: string | null,
  disabled: boolean,
): ReactNode {
  if (variant === 'minimal') {
    return (
      <>
        <Upload size={14} aria-hidden="true" />
        <span>Attach file</span>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <span className={iconInline} aria-hidden="true">
          <Upload size={16} />
        </span>
        <Text size="sm" color="fg.default" flex="1" truncate>
          Drop a file, or click to browse
          {acceptHint ? ` · ${acceptHint}` : ''}
        </Text>
        <Button
          type="button"
          variant="outline"
          colorScheme="neutral"
          size="xs"
          disabled={disabled}
          tabIndex={-1}
        >
          Browse
        </Button>
        {acceptHint ? (
          <span id={hintId} hidden>
            {acceptHint}
          </span>
        ) : null}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <span className={iconTile} aria-hidden="true">
          <Upload size={20} />
        </span>
        <Stack gap="0" flex="1" minWidth="0">
          <Text size="sm" weight="semibold" color="fg.default">
            Upload a file
          </Text>
          <Text id={hintId} size="xs" color="fg.muted">
            Drag &amp; drop, or browse{acceptHint ? ` — ${acceptHint}` : ''}
          </Text>
        </Stack>
        <Button
          type="button"
          variant="outline"
          colorScheme="neutral"
          size="sm"
          disabled={disabled}
          tabIndex={-1}
        >
          Browse
        </Button>
      </>
    );
  }

  // default
  return (
    <>
      <span className={iconCircle} aria-hidden="true">
        <Upload size={22} />
      </span>
      <Text size="md" weight="semibold" color="fg.default">
        Drop files to upload
      </Text>
      <span className={orDivider} aria-hidden="true">
        or
      </span>
      <Button
        type="button"
        variant="solid"
        colorScheme="neutral"
        size="sm"
        leftIcon={<Upload size={14} />}
        disabled={disabled}
        tabIndex={-1}
      >
        Browse files
      </Button>
      {acceptHint ? (
        <Text id={hintId} size="xs" color="fg.subtle">
          {acceptHint}
        </Text>
      ) : null}
    </>
  );
}

/**
 * Pick a lucide glyph for a non-image file based on MIME type, falling back to
 * the file-extension when the type is missing (drag/drop from some sources,
 * or exotic types the browser doesn't recognise).
 */
const iconForFile = (file: File): React.ComponentType<{ size?: number | string }> => {
  const type = file.type.toLowerCase();
  const ext = getExt(file);

  if (type.startsWith('video/')) return FileVideo;
  if (type.startsWith('audio/')) return FileAudio;
  if (type === 'application/pdf' || ext === 'pdf') return FileText;
  if (
    type === 'application/zip' ||
    type === 'application/x-tar' ||
    type === 'application/x-7z-compressed' ||
    type === 'application/x-rar-compressed' ||
    type === 'application/gzip' ||
    ['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)
  )
    return FileArchive;
  if (
    type === 'text/csv' ||
    type.includes('spreadsheetml') ||
    type === 'application/vnd.ms-excel' ||
    ['csv', 'xls', 'xlsx', 'numbers'].includes(ext)
  )
    return FileSpreadsheet;
  if (
    type === 'application/json' ||
    type.startsWith('application/javascript') ||
    type.startsWith('text/') ||
    ['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'md', 'py', 'rb', 'go', 'rs'].includes(ext)
  )
    return FileCode;
  if (type.startsWith('application/') || type.startsWith('text/')) return FileText;
  return FileIcon;
};

const getExt = (file: File): string => {
  const dot = file.name.lastIndexOf('.');
  if (dot === -1 || dot === file.name.length - 1) return '';
  return file.name.slice(dot + 1).toLowerCase();
};

const extColor = (ext: string): BadgeColorScheme => {
  if (ext === 'pdf') return 'danger';
  if (['doc', 'docx', 'rtf'].includes(ext)) return 'info';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'success';
  if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return 'warning';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'warning';
  return 'neutral';
};

const typeDescriptor = (file: File): string => {
  const type = file.type.toLowerCase();
  const ext = getExt(file);
  if (type.startsWith('image/')) {
    const sub = type.slice(6).toUpperCase();
    return sub ? `Image · ${sub}` : 'Image';
  }
  if (type.startsWith('video/')) return 'Video';
  if (type.startsWith('audio/')) return 'Audio';
  if (type === 'application/pdf' || ext === 'pdf') return 'Document';
  if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return 'Archive';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'Spreadsheet';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'Presentation';
  if (['doc', 'docx', 'rtf'].includes(ext)) return 'Document';
  if (
    type === 'application/json' ||
    type.startsWith('application/javascript') ||
    type.startsWith('text/') ||
    ['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'md', 'py', 'rb', 'go', 'rs'].includes(ext)
  )
    return 'Code';
  return 'File';
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export interface FileUploadListProps {
  className?: string;
  renderItem?: (file: File, index: number) => ReactNode;
  /**
   * When provided, a preview `IconButton` is rendered before the remove button
   * on each row. The consumer owns the preview UI (opens a lightbox, new tab,
   * etc.). Invoked with the file and its list index on click.
   */
  onPreview?: (file: File, index: number) => void;
}

/** Accessible list of currently-selected files. */
export function FileUploadList({ className, renderItem, onPreview }: FileUploadListProps) {
  const ctx = useFileUploadContext();
  if (ctx.files.length === 0) return null;

  return (
    <Stack as="ul" gap="2" className={cn(list, className)} aria-live="polite">
      {ctx.files.map((file, index) => {
        if (renderItem) return renderItem(file, index);
        const isImage = file.type.startsWith('image/');
        const url = isImage ? URL.createObjectURL(file) : undefined;
        const ext = getExt(file);
        return (
          <Inline
            as="li"
            key={`${file.name}-${index}`}
            gap="3"
            align="center"
            paddingX="3"
            paddingY="2"
            wrap={false}
            className={row}
          >
            {isImage ? (
              <img
                src={url}
                alt=""
                className={thumbnail}
                onLoad={() => url && URL.revokeObjectURL(url)}
              />
            ) : ext ? (
              <span className={thumbnailDoc} aria-hidden="true">
                <Badge size="xs" variant="soft" colorScheme={extColor(ext)}>
                  {ext.toUpperCase()}
                </Badge>
              </span>
            ) : (
              <span className={cn(thumbnailDoc, thumbnailIcon)} aria-hidden="true">
                {(() => {
                  const Icon = iconForFile(file);
                  return <Icon size={20} />;
                })()}
              </span>
            )}
            <Stack gap="0" flex="1" minWidth="0">
              <Text size="sm" weight="medium" truncate>
                {file.name}
              </Text>
              <Inline gap="1" align="center" wrap={false}>
                <Badge size="xs" variant="soft" colorScheme="neutral" className={fileSize}>
                  {formatSize(file.size)}
                </Badge>
                <span className={metaDot} aria-hidden="true" />
                <Text size="xs" color="fg.muted" truncate>
                  {typeDescriptor(file)}
                </Text>
              </Inline>
            </Stack>
            <Inline gap="1" align="center" wrap={false}>
              {onPreview ? (
                <IconButton
                  size="xs"
                  variant="ghost"
                  colorScheme="neutral"
                  label={`Preview ${file.name}`}
                  onClick={() => onPreview(file, index)}
                  icon={<Eye />}
                />
              ) : null}
              <IconButton
                size="xs"
                variant="ghost"
                colorScheme="neutral"
                label={`Remove ${file.name}`}
                onClick={() => ctx.removeFile(index)}
                className={removeButton}
                icon={<X />}
              />
            </Inline>
          </Inline>
        );
      })}
    </Stack>
  );
}
