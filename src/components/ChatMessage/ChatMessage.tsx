import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { RowActions } from "../RowActions/RowActions.js";
import { Toolbar } from "../Toolbar/Toolbar.js";

export interface ChatMessageTokens {
  caret: string;
  maxWidth: string;
  userColor: string;
  userBg: string;
  border: string;
  bg: string;
  padding: string;
  radius: string;
  gap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    chatMessage: ChatMessageTokens;
  }
}

export interface ChatMessageLabels {
  /** The name of a message the person wrote. Default "You". */
  user: string;
  /** The name of a message the assistant wrote. Default "Assistant". */
  assistant: string;
  /** The name of the toolbar of `actions`. Default "Message actions". */
  actions: string;
}

export interface ChatMessageProps {
  /** Who wrote it: the person's messages sit at the end, filled; the assistant's at the start, after `avatar`. */
  role: "user" | "assistant";
  /** A picture at the start of the message (end, for the person's), usually a decorative Avatar. */
  avatar?: ReactNode;
  /** "danger" for a message that reports a failure (the request failed, the model refused). Default "neutral". */
  tone?: "neutral" | "danger";
  /** Content that needs the whole row (tables, code): the bubble takes the full width instead of hugging its text. */
  wide?: boolean;
  /**
   * Controls for the message (CopyButton, a retry IconButton), in a toolbar under it: one Tab stop, arrows between
   * them. Shown while the message is hovered or holds focus, and always on screens without hover.
   */
  actions?: ReactNode;
  /** Text is still arriving: a blinking caret follows the content and the message is busy (`aria-busy`). */
  streaming?: boolean;
  /** Replace the built-in English names of the message and its actions. */
  labels?: Partial<ChatMessageLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through --cy-chat-message-* tokens. */
  style?: CSSProperties;
  /** The content. Render markdown into a Prose yourself; plain text keeps its line breaks. */
  children?: ReactNode;
}

const DEFAULT_LABELS: ChatMessageLabels = { user: "You", assistant: "Assistant", actions: "Message actions" };

/**
 * One message in an assistant chat: the person's at the end, filled with the accent; the assistant's at the start with
 * its avatar. Holds any content (markdown rendered into Prose), a caret while it streams, and actions shown on hover.
 */
export const ChatMessage = forwardRef<HTMLElement, ChatMessageProps>(function ChatMessage(
  {
    role,
    avatar,
    tone = "neutral",
    wide = false,
    actions,
    streaming = false,
    labels,
    className,
    style,
    children,
  },
  ref,
) {
  const text = { ...DEFAULT_LABELS, ...labels };
  return (
    <article
      ref={ref}
      className={`cy-chat-message${className ? ` ${className}` : ""}`}
      data-role={role}
      // The whole message is the row its actions show for, not only the bubble beside them.
      data-row-actions-host=""
      data-tone={tone}
      data-wide={wide ? "" : undefined}
      aria-label={role === "user" ? text.user : text.assistant}
      aria-busy={streaming || undefined}
      style={style}
    >
      {avatar && <div className="cy-chat-message-avatar cy-reset">{avatar}</div>}
      <div className="cy-chat-message-body cy-reset">
        <div className="cy-chat-message-bubble">
          {children}
          {streaming && <span className="cy-chat-message-caret cy-reset" aria-hidden="true" />}
        </div>
        {actions && (
          // Messages are not a roving list, so the actions are always in the Tab order: one stop, arrows between them.
          <RowActions className="cy-chat-message-actions">
            <Toolbar label={text.actions}>{actions}</Toolbar>
          </RowActions>
        )}
      </div>
    </article>
  );
});
