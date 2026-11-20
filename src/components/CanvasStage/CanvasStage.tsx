import { type CSSProperties, type DragEvent, forwardRef, type ReactNode, useRef, useState } from "react";
import { acceptsFile } from "../../foundations/accept-file.js";
import type { RootAttributes } from "../../foundations/attributes.js";

export interface CanvasStageTokens {
  /** Behind the drawing surface (the letterbox around a canvas that does not fill the stage). */
  background: string;
  /** Corner radius of the stage. */
  radius: string;
  /** Smallest height of a stage without `ratio`. */
  minHeight: string;
  /** Over the stage while files are dragged over it. */
  dropBackground: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    canvasStage: CanvasStageTokens;
  }
}

export interface CanvasStageLabels {
  /** Shown over the stage while files are dragged over it. Default "Drop to open". */
  drop: string;
}

export interface CanvasStageProps extends RootAttributes {
  /** Names the stage, a group ("Animation"). Name the canvas inside it for what it shows. */
  label: string;
  /**
   * Width divided by height (`16 / 9`, `"4/3"`): the stage keeps it at any width. Without it the stage fills its
   * parent's height (give the parent one), at least `--cy-canvas-stage-min-height` tall.
   */
  ratio?: number | string | undefined;
  /** The drawing surface (a `<canvas>`, an engine's element): stretched to fill the stage. */
  children?: ReactNode;
  /**
   * Centred over the surface: a file picker before anything is open, progress while loading, a message. It takes
   * presses; around it, presses reach the surface.
   */
  overlay?: ReactNode;
  /** Makes the whole stage a drop target: called with the dropped files that pass `accept` (and `multiple`). */
  onFiles?: ((files: File[]) => void) | undefined;
  /** Called with the dropped files that were turned away (wrong type, or more than one without `multiple`). */
  onReject?: ((files: File[]) => void) | undefined;
  /** File types taken on a drop, as for `<input accept>`: ".riv,image/*". Default: any. */
  accept?: string | undefined;
  /** Take more than one file in a drop. Default false: the first accepted file only. */
  multiple?: boolean;
  /** Turns off dropping. */
  disabled?: boolean;
  /** Replace the built-in English text shown while files are dragged over the stage. */
  labels?: Partial<CanvasStageLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only (width, placement). Restyle through --cy-canvas-stage-* tokens. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: CanvasStageLabels = { drop: "Drop to open" };
const hasFiles = (event: DragEvent) => [...(event.dataTransfer?.types ?? [])].includes("Files");

/**
 * A host for a product's own drawing surface (a canvas an engine paints, a player): a sized stage, a drop target for
 * files over the whole of it, and a centred overlay slot for a picker or progress. The product keeps its drawing.
 */
export const CanvasStage = forwardRef<HTMLDivElement, CanvasStageProps>(function CanvasStage(
  {
    label,
    ratio,
    children,
    overlay,
    onFiles,
    onReject,
    accept,
    multiple = false,
    disabled = false,
    labels,
    className,
    style,
    ...rest
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [over, setOver] = useState(false);
  // dragenter and dragleave fire for every child crossed: count them so leaving a child is not leaving the stage.
  const depth = useRef(0);
  const droppable = onFiles !== undefined && !disabled;
  const leave = () => {
    depth.current = 0;
    setOver(false);
  };
  const take = (files: File[]) => {
    const fits = files.filter((f) => !accept || acceptsFile(f, accept));
    const taken = multiple ? fits : fits.slice(0, 1);
    const turned = files.filter((f) => !taken.includes(f));
    if (taken.length) onFiles?.(taken);
    if (turned.length) onReject?.(turned);
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: a stage around a drawing surface, not form controls (fieldset)
    <div
      ref={ref}
      {...rest}
      role="group"
      aria-label={label}
      className={className ? `cy-canvas-stage ${className}` : "cy-canvas-stage"}
      data-ratio={ratio === undefined ? undefined : ""}
      data-over={over ? "" : undefined}
      style={ratio === undefined ? style : ({ "--_ratio": ratio, ...style } as CSSProperties)}
      {...(droppable && {
        onDragEnter: (event: DragEvent<HTMLDivElement>) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          depth.current += 1;
          setOver(true);
        },
        onDragOver: (event: DragEvent<HTMLDivElement>) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: () => {
          depth.current -= 1;
          if (depth.current <= 0) leave();
        },
        onDrop: (event: DragEvent<HTMLDivElement>) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          leave();
          take([...event.dataTransfer.files]);
        },
      })}
    >
      <div className="cy-canvas-stage-surface cy-reset">{children}</div>
      {/* Kept in the page while files are over the stage, only hidden: a drag that came in over the overlay gets
          its leave, which the browser never sends to a removed element, so the drop hint ends with the drag. */}
      {overlay != null && (
        <div className="cy-canvas-stage-overlay" data-hidden={over ? "" : undefined}>
          <div className="cy-canvas-stage-slot cy-reset">{overlay}</div>
        </div>
      )}
      {over && (
        <div className="cy-canvas-stage-overlay" data-drop="">
          <span className="cy-canvas-stage-drop">{text.drop}</span>
        </div>
      )}
    </div>
  );
});
