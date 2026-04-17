import { Toaster as SonnerToaster, type ToasterProps as SonnerToasterProps, toast } from 'sonner';
import {
  toastActionButton,
  toastBase,
  toastCancelButton,
  toastDescription,
  toastError,
  toastInfo,
  toastSuccess,
  toastTitle,
  toastWarning,
} from './Toaster.css.js';

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
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: toastBase,
          title: toastTitle,
          description: toastDescription,
          actionButton: toastActionButton,
          cancelButton: toastCancelButton,
          success: toastSuccess,
          error: toastError,
          warning: toastWarning,
          info: toastInfo,
          ...toastOptions?.classNames,
        },
      }}
      {...rest}
    />
  );
}

export { toast };
