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

export interface ToasterProps extends Omit<SonnerToasterProps, 'toastOptions'> {
  /** Override `toastOptions` — merged with Lumen's token-derived class names. */
  toastOptions?: SonnerToasterProps['toastOptions'];
}

/**
 * Re-skinned `sonner` Toaster. Mount once at the app root. The `toast()`
 * function re-exported from this module can be called from anywhere to
 * enqueue a notification.
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
          '--normal-bg': 'var(--lumen-color-background-surface)',
          '--normal-border': 'var(--lumen-color-border-default)',
          '--normal-text': 'var(--lumen-color-foreground-default)',
          '--gray1': 'var(--lumen-color-background-canvas)',
          '--gray2': 'var(--lumen-color-background-surface)',
          '--gray3': 'var(--lumen-color-background-raised)',
          '--gray4': 'var(--lumen-color-border-subtle)',
          '--gray5': 'var(--lumen-color-border-default)',
          '--gray12': 'var(--lumen-color-foreground-default)',
          '--success-bg': 'var(--lumen-color-feedback-success-soft)',
          '--success-border': 'var(--lumen-color-feedback-success-border)',
          '--success-text': 'var(--lumen-color-feedback-success-foreground)',
          '--error-bg': 'var(--lumen-color-feedback-danger-soft)',
          '--error-border': 'var(--lumen-color-feedback-danger-border)',
          '--error-text': 'var(--lumen-color-feedback-danger-foreground)',
          '--warning-bg': 'var(--lumen-color-feedback-warning-soft)',
          '--warning-border': 'var(--lumen-color-feedback-warning-border)',
          '--warning-text': 'var(--lumen-color-feedback-warning-foreground)',
          '--info-bg': 'var(--lumen-color-feedback-info-soft)',
          '--info-border': 'var(--lumen-color-feedback-info-border)',
          '--info-text': 'var(--lumen-color-feedback-info-foreground)',
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
