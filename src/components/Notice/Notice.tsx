import { type CSSProperties, type ReactNode, useState } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { TONE_ICONS } from "../../foundations/tone-icons.js";
import { close as closeIcon } from "../../icons/close.js";
import type { IconData } from "../../icons/types.js";
import type { Size, Tone } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface NoticeTokens {
  radius: string;
  padding: string;
  /** Padding of a small Notice (`size="sm"`). */
  paddingSm: string;
  softMix: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    notice: NoticeTokens;
  }
}

export interface NoticeLabels {
  /** Accessible name of the dismiss button. */
  dismiss: string;
}

export interface NoticeProps {
  /**
   * Colour and icon. `danger` is `role="alert"` (announced even when it mounts filled); the others are `role="status"`,
   * whose content changes are announced politely.
   */
  tone?: Tone;
  /**
   * `soft` is a tinted panel with a tone edge; `solid` is the tone's solid colour with the readable text that goes on
   * it, for a message that must stand out (an editor's error banner). Default "soft".
   */
  variant?: "soft" | "solid";
  /** `sm`: less padding, and the title and message share one line when they fit (a status strip). Default "md". */
  size?: Extract<Size, "sm" | "md">;
  /** Short heading above the message. */
  title?: ReactNode;
  /** One or two Buttons; they move under the text in narrow containers. */
  action?: ReactNode;
  /** Shows a close button. The Notice hides itself unless you control it with `onDismiss` and unmount it. */
  dismissible?: boolean;
  /** Called when the close button is pressed. With it, hiding the Notice is up to you. */
  onDismiss?: () => void;
  /** Replace the tone's icon, or `null` for none. */
  icon?: IconData | null;
  /** Replace the built-in English text: the dismiss button's name. */
  labels?: Partial<NoticeLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-notice-* tokens. */
  style?: CSSProperties;
  /** The message. */
  children?: ReactNode;
}

/** An inline message about part of the page: a status, a warning or an error that stays until it is resolved. */
export function Notice({
  tone = "info",
  variant = "soft",
  size = "md",
  title,
  action,
  dismissible = false,
  onDismiss,
  icon,
  labels,
  className,
  style,
  children,
}: NoticeProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const glyph = icon === undefined ? TONE_ICONS[tone] : icon;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={className ? `cy-notice ${className}` : "cy-notice"}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      style={style}
    >
      <div className="cy-notice-main cy-reset">
        {glyph && <Icon icon={glyph} className="cy-notice-icon" />}
        <div className="cy-notice-text cy-reset">
          {title && <span className="cy-notice-title cy-reset">{title}</span>}
          {children && <div className="cy-notice-body cy-reset">{children}</div>}
        </div>
        {action && <div className="cy-notice-action cy-reset">{action}</div>}
        {dismissible && (
          <IconButton
            icon={closeIcon}
            label={labels?.dismiss ?? "Dismiss"}
            variant="ghost"
            size="sm"
            // On a fill the close icon takes the fill's text colour; on the soft panel, the button's own.
            {...(variant === "solid" && { iconColor: "var(--_notice-on)" })}
            wrapperClassName="cy-notice-dismiss"
            onClick={() => {
              onDismiss?.();
              if (!onDismiss) setHidden(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
