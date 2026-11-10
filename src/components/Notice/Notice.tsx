import { type CSSProperties, type ReactNode, useState } from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { checkCircle } from "../../icons/check-circle.js";
import { close as closeIcon } from "../../icons/close.js";
import { info } from "../../icons/info.js";
import type { IconData } from "../../icons/types.js";
import { warning } from "../../icons/warning.js";
import { xCircle } from "../../icons/x-circle.js";
import type { Tone } from "../../tokens/schema.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface NoticeTokens {
  radius: string;
  padding: string;
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
  title?: ReactNode;
  /** One or two Buttons; they move under the text in narrow containers. */
  action?: ReactNode;
  /** Shows a close button. The Notice hides itself unless you control it with `onDismiss` and unmount it. */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Replace the tone's icon, or `null` for none. */
  icon?: IconData | null;
  labels?: Partial<NoticeLabels>;
  className?: string;
  /** Layout only. Restyle through --cy-notice-* tokens. */
  style?: CSSProperties;
  children?: ReactNode;
}

const ICONS: Partial<Record<Tone, IconData>> = {
  info,
  success: checkCircle,
  warning,
  danger: xCircle,
  accent: info,
};

/** An inline message about part of the page: a status, a warning or an error that stays until it is resolved. */
export function Notice({
  tone = "info",
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
  const glyph = icon === undefined ? ICONS[tone] : icon;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={className ? `cy-notice ${className}` : "cy-notice"}
      data-tone={tone}
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
