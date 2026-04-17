import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import { CloseIcon, StatusIcon } from '../shared/icons.js';
import { surfaceClose, surfaceIcon } from '../shared/surface.css.js';
import type { FeedbackStatus, FeedbackVariant } from '../shared/types.js';
import { surfaceVariantClass } from '../shared/variants.js';
import { bannerActions, bannerContent, bannerRoot, bannerSize } from './Banner.css.js';

const STORAGE_KEY_PREFIX = 'lumen:banner:';

export type BannerStatus = FeedbackStatus;
export type BannerVariant = FeedbackVariant;
export type BannerSize = 'sm' | 'md' | 'lg';

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  status?: BannerStatus;
  variant?: BannerVariant;
  size?: BannerSize;
  icon?: ReactNode | false;
  closable?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  /** Persists dismissal in localStorage under the given key. */
  dismissKey?: string;
}

const readDismissed = (key: string): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_PREFIX + key) === '1';
  } catch {
    return false;
  }
};

const writeDismissed = (key: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + key, '1');
  } catch {
    /* storage full or disabled — silent no-op */
  }
};

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    status = 'info',
    variant = 'soft',
    size = 'md',
    icon,
    closable,
    onClose,
    closeLabel = 'Dismiss',
    dismissKey,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissKey) setDismissed(readDismissed(dismissKey));
  }, [dismissKey]);

  const handleClose = useCallback(() => {
    if (dismissKey) writeDismissed(dismissKey);
    setDismissed(true);
    onClose?.();
  }, [dismissKey, onClose]);

  if (dismissed) return null;

  const showIcon = icon !== false;
  const iconNode = icon === false || icon === undefined ? <StatusIcon status={status} /> : icon;

  return (
    <div
      ref={ref}
      role={status === 'danger' || status === 'warning' ? 'alert' : 'status'}
      data-status={status}
      className={cn(bannerRoot, bannerSize[size], surfaceVariantClass[variant][status], className)}
      {...rest}
    >
      {showIcon ? <span className={surfaceIcon}>{iconNode}</span> : null}
      {children}
      {closable ? (
        <button
          type="button"
          aria-label={closeLabel}
          className={surfaceClose}
          onClick={handleClose}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
});

export interface BannerContentProps extends HTMLAttributes<HTMLDivElement> {}

export const BannerContent = forwardRef<HTMLDivElement, BannerContentProps>(function BannerContent(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(bannerContent, className)} {...rest} />;
});

export interface BannerActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const BannerActions = forwardRef<HTMLDivElement, BannerActionsProps>(function BannerActions(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(bannerActions, className)} {...rest} />;
});

/** Clear persisted dismissal for the given banner key. Useful for testing. */
export const clearBannerDismissal = (key: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  } catch {
    /* silent */
  }
};
