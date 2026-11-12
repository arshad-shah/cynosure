import { type CSSProperties, useEffect, useRef, useState } from "react";
import { check } from "../../icons/check.js";
import { copy as copyIcon } from "../../icons/copy.js";
import { xCircle } from "../../icons/x-circle.js";
import type { Placement } from "../../overlay/position.js";
import type { Size } from "../../tokens/schema.js";
import type { ButtonVariant } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface CopyButtonLabels {
  /** Name and tooltip before copying. */
  copy: string;
  /** Name, tooltip and announcement after a successful copy. */
  copied: string;
  /** Name, tooltip and announcement when the clipboard refused. */
  failed: string;
}

export interface CopyButtonProps {
  /** The text to copy (or a function that returns it when clicked). */
  value: string | (() => string);
  /** Replace the built-in English text: the button's name before copying, after a copy and after a failure. */
  labels?: Partial<CopyButtonLabels>;
  /** Milliseconds before the button goes back to its copy state (default 2000). */
  timeout?: number;
  /**
   * Writes to the clipboard. Defaults to `navigator.clipboard.writeText`; pass your own for extensions (an offscreen
   * document, `chrome.runtime` messaging) or tests. A rejection or throw shows the failed state.
   */
  copy?: (text: string) => Promise<void> | void;
  /** Called after a successful copy, with the text that was copied. */
  onCopy?: (text: string) => void;
  /** Called when copying fails, with the error. */
  onError?: (error: unknown) => void;
  /** Size of the button. Default "md". */
  size?: Size;
  /** Fill style of the button. Default "ghost". */
  variant?: ButtonVariant;
  /** Where the label tooltip appears. Default "top". */
  tooltipPlacement?: Placement;
  /** The button cannot be pressed. */
  disabled?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

type State = "idle" | "copied" | "failed";
const DEFAULT_LABELS: CopyButtonLabels = { copy: "Copy", copied: "Copied", failed: "Could not copy" };

const writeClipboard = (text: string) => {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
  return navigator.clipboard.writeText(text);
};

/** An IconButton that copies a value, swaps to a check (or an error) and announces the result. Never throws. */
export function CopyButton({
  value,
  labels,
  timeout = 2000,
  copy = writeClipboard,
  onCopy,
  onError,
  size = "md",
  variant = "ghost",
  tooltipPlacement,
  disabled,
  className,
  style,
}: CopyButtonProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const settle = (next: State) => {
    setState(next);
    setMessage(next === "copied" ? text.copied : text.failed);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState("idle");
      setMessage("");
    }, timeout);
  };

  const run = async () => {
    // Clear the live region first, so copying again while it still says "Copied" is announced again.
    setMessage("");
    try {
      const content = typeof value === "function" ? value() : value;
      await copy(content);
      await new Promise((resolve) => setTimeout(resolve));
      settle("copied");
      onCopy?.(content);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve));
      settle("failed");
      onError?.(error);
    }
  };

  const label = state === "copied" ? text.copied : state === "failed" ? text.failed : text.copy;
  return (
    <span
      className={className ? `cy-copy-button ${className}` : "cy-copy-button"}
      data-state={state}
      style={style}
    >
      <IconButton
        icon={state === "copied" ? check : state === "failed" ? xCircle : copyIcon}
        label={label}
        size={size}
        variant={variant}
        iconColor={
          state === "copied"
            ? "var(--cy-color-success-text)"
            : state === "failed"
              ? "var(--cy-color-danger-text)"
              : undefined
        }
        disabled={disabled}
        onClick={() => void run()}
        {...(tooltipPlacement ? { tooltipPlacement } : {})}
      />
      <span className="cy-copy-button-status cy-reset cy-visually-hidden" role="status">
        {message}
      </span>
    </span>
  );
}
