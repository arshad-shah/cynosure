import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { cn } from '../../utils/cn.js';
import { CloseIcon } from '../shared/icons.js';
import { surfaceClose } from '../shared/surface.css.js';
import {
  notificationActions,
  notificationDescription,
  notificationDismiss,
  notificationHeader,
  notificationIcon,
  notificationRoot,
  notificationTimestamp,
  notificationTitle,
  notificationUnreadDot,
} from './Notification.css.js';

/**
 * Props for the {@link Notification} component.
 */
export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Leading icon node. */
  icon?: ReactNode;
  /** Headline content. Mutually composes with `description` and `timestamp`. */
  title?: ReactNode;
  /** Supporting body content rendered below the title. */
  description?: ReactNode;
  /** Right-aligned timestamp shown next to the title. */
  timestamp?: ReactNode;
  /** Inline action row rendered beneath the description. */
  actions?: ReactNode;
  /**
   * Marks the notification as unread; renders an accent dot and triggers
   * `onRead` on the next click.
   * @default false
   */
  unread?: boolean;
  /** Invoked when an unread notification is clicked. */
  onRead?: () => void;
  /**
   * Invoked when the user activates the dismiss control. When omitted, no
   * dismiss button is rendered.
   */
  onDismiss?: () => void;
  /**
   * Accessible label for the dismiss button.
   * @default "Dismiss notification"
   */
  dismissLabel?: string;
}

/**
 * Item in a notification list — for inbox-style surfaces, activity feeds, or
 * a popover from a bell icon. Notification handles read/unread visual state,
 * exposes a dismiss action, and stops dismiss click propagation so list-level
 * `onClick` handlers do not fire when removing an item.
 */
export const Notification = forwardRef<HTMLDivElement, NotificationProps>(function Notification(
  {
    icon,
    title,
    description,
    timestamp,
    actions,
    unread = false,
    onRead,
    onDismiss,
    dismissLabel = 'Dismiss notification',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const hasStructuredContent =
    icon !== undefined ||
    title !== undefined ||
    description !== undefined ||
    timestamp !== undefined ||
    actions !== undefined;

  return (
    <div
      ref={ref}
      data-unread={unread || undefined}
      className={cn(notificationRoot, className)}
      onClick={(e) => {
        onClick?.(e);
        if (unread) onRead?.();
      }}
      {...rest}
    >
      {icon ? <span className={notificationIcon}>{icon}</span> : null}
      {hasStructuredContent ? (
        <>
          <div className={notificationHeader}>
            {title !== undefined ? <p className={notificationTitle}>{title}</p> : <span />}
            {timestamp !== undefined ? (
              <time className={notificationTimestamp}>{timestamp}</time>
            ) : null}
          </div>
          {description !== undefined ? (
            <p className={notificationDescription}>{description}</p>
          ) : null}
          {actions !== undefined ? <div className={notificationActions}>{actions}</div> : null}
        </>
      ) : (
        children
      )}
      {onDismiss ? (
        <IconButton
          variant="bare"
          label={dismissLabel}
          icon={<CloseIcon />}
          className={cn(surfaceClose, notificationDismiss)}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        />
      ) : null}
      {unread ? <span aria-hidden="true" className={notificationUnreadDot} /> : null}
    </div>
  );
});
