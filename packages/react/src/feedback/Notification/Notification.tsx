import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
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

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  actions?: ReactNode;
  unread?: boolean;
  onRead?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
}

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
        <button
          type="button"
          aria-label={dismissLabel}
          className={cn(surfaceClose, notificationDismiss)}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          <CloseIcon />
        </button>
      ) : null}
      {unread ? <span aria-hidden="true" className={notificationUnreadDot} /> : null}
    </div>
  );
});
