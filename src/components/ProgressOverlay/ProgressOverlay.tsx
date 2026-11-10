import type { CSSProperties } from "react";
import { Button } from "../Button/Button.js";
import { Dialog } from "../Dialog/Dialog.js";
import { ProgressBar } from "../ProgressBar/ProgressBar.js";

export interface ProgressOverlayLabels {
  /** The Cancel button. Default "Cancel". */
  cancel: string;
  /** Status while the amount is unknown. Default "Working…". */
  working: string;
  /** Status from the counts. Default "3 of 12". */
  count: (value: number, max: number) => string;
}

export interface ProgressOverlayProps {
  /** Show it. */
  open: boolean;
  /** What is happening ("Compressing the PDF"). Names the dialog and the progress bar. */
  title: string;
  /** How far it has got; leave undefined while the amount is unknown. */
  value?: number | undefined;
  max?: number | undefined;
  /** A line under the bar ("Page 3: images"). Default: the count, or "Working…". Read out politely as it changes. */
  status?: string | undefined;
  /** Cancels the work: the Cancel button and Escape. Without it the overlay cannot be closed. */
  onCancel?: (() => void) | undefined;
  labels?: Partial<ProgressOverlayLabels>;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

const DEFAULT_LABELS: ProgressOverlayLabels = {
  cancel: "Cancel",
  working: "Working…",
  count: (value, max) => `${value} of ${max}`,
};

/**
 * Modal progress for long work the page must wait for (exporting, compressing, converting): a Dialog with a
 * ProgressBar and a status line. Escape and Cancel call `onCancel`; with no `onCancel` it stays until the work ends.
 */
export function ProgressOverlay({
  open,
  title,
  value,
  max = 100,
  status,
  onCancel,
  labels,
  className,
  style,
}: ProgressOverlayProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const known = value !== undefined;
  const line = status ?? (known ? text.count(Math.min(Math.max(value, 0), max), max) : text.working);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onCancel?.()}
      title={title}
      size="sm"
      dismissible={!!onCancel}
      actions={onCancel && <Button onClick={onCancel}>{text.cancel}</Button>}
      className={className ? `cy-progress-overlay ${className}` : "cy-progress-overlay"}
      {...(style ? { style } : {})}
    >
      <ProgressBar
        label={title}
        labelHidden
        value={value}
        max={max}
        indeterminate={!known}
        labels={{ value: text.count }}
      />
      <p className="cy-progress-overlay-status cy-reset" aria-live="polite">
        {line}
      </p>
    </Dialog>
  );
}
