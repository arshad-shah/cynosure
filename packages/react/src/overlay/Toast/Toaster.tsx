import { CircleAlert, CircleCheck, CircleX, Info, Loader2 } from 'lucide-react';
import { Toaster as SonnerToaster, type ToasterProps as SonnerToasterProps, toast } from 'sonner';
import {
  toastActionButton,
  toastBase,
  toastCancelButton,
  toastDescription,
  toastIcon,
  toastTitle,
} from './Toaster.css.js';

const DEFAULT_ICONS = {
  success: <CircleCheck size={18} strokeWidth={2.25} aria-hidden />,
  error: <CircleX size={18} strokeWidth={2.25} aria-hidden />,
  warning: <CircleAlert size={18} strokeWidth={2.25} aria-hidden />,
  info: <Info size={18} strokeWidth={2.25} aria-hidden />,
  loading: <Loader2 size={18} strokeWidth={2.25} aria-hidden className={toastIcon} />,
};

export type ToasterPosition = SonnerToasterProps['position'];
export type ToasterTheme = NonNullable<SonnerToasterProps['theme']>;

/**
 * Props for the toast portal host. Inherits every Sonner `ToasterProps`
 * field (position, theme, expand, hotkey, gap, etc.) except `toastOptions`,
 * which is overridden so Cynosure's class names always win.
 */
export interface ToasterProps extends Omit<SonnerToasterProps, 'toastOptions'> {
  /**
   * Sonner `toastOptions`. Merged with Cynosure's token-derived class
   * names — consumer `classNames` are applied on top of the defaults, so
   * any key you set wins for that slot.
   */
  toastOptions?: SonnerToasterProps['toastOptions'];
}

/**
 * Re-skinned `sonner` Toaster. Mount once at the app root. The `toast()`
 * function re-exported from this module can be called from anywhere to
 * enqueue a notification. Notifications are announced via Sonner's
 * `aria-live` region with semantic icons mapped to success/error/warning/
 * info/loading states.
 *
 * `position` defaults to `"bottom-right"`, `theme` to `"system"` (respects
 * the user's `prefers-color-scheme`), and `closeButton` to `true`.
 */
export function Toaster({
  position = 'bottom-right',
  theme = 'system',
  closeButton = true,
  toastOptions,
  ...rest
}: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      theme={theme}
      closeButton={closeButton}
      richColors
      icons={DEFAULT_ICONS}
      style={
        {
          '--normal-bg': 'var(--cynosure-color-background-surface)',
          '--normal-border': 'var(--cynosure-color-border-default)',
          '--normal-text': 'var(--cynosure-color-foreground-default)',
          '--gray1': 'var(--cynosure-color-background-canvas)',
          '--gray2': 'var(--cynosure-color-background-surface)',
          '--gray3': 'var(--cynosure-color-background-raised)',
          '--gray4': 'var(--cynosure-color-border-subtle)',
          '--gray5': 'var(--cynosure-color-border-default)',
          '--gray12': 'var(--cynosure-color-foreground-default)',
          '--success-bg': 'var(--cynosure-color-feedback-success-soft)',
          '--success-border': 'var(--cynosure-color-feedback-success-border)',
          '--success-text': 'var(--cynosure-color-feedback-success-foreground)',
          '--error-bg': 'var(--cynosure-color-feedback-danger-soft)',
          '--error-border': 'var(--cynosure-color-feedback-danger-border)',
          '--error-text': 'var(--cynosure-color-feedback-danger-foreground)',
          '--warning-bg': 'var(--cynosure-color-feedback-warning-soft)',
          '--warning-border': 'var(--cynosure-color-feedback-warning-border)',
          '--warning-text': 'var(--cynosure-color-feedback-warning-foreground)',
          '--info-bg': 'var(--cynosure-color-feedback-info-soft)',
          '--info-border': 'var(--cynosure-color-feedback-info-border)',
          '--info-text': 'var(--cynosure-color-feedback-info-foreground)',
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: toastBase,
          title: toastTitle,
          description: toastDescription,
          actionButton: toastActionButton,
          cancelButton: toastCancelButton,
          ...toastOptions?.classNames,
        },
      }}
      {...rest}
    />
  );
}

export { toast };
