import {
  type HTMLAttributes,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
} from 'react';
import { cn } from '../../utils/cn.js';
import { CloseIcon, StatusIcon } from '../shared/icons.js';
import {
  surfaceClose,
  surfaceContent,
  surfaceDescription,
  surfaceIcon,
  surfaceRoot,
  surfaceSize,
  surfaceTitle,
} from '../shared/surface.css.js';
import type { FeedbackStatus, FeedbackVariant } from '../shared/types.js';
import { surfaceVariantClass } from '../shared/variants.js';

export type AlertStatus = FeedbackStatus;
export type AlertVariant = FeedbackVariant;
export type AlertSize = 'sm' | 'md' | 'lg';
export type AlertRole = 'alert' | 'status' | 'none';

interface AlertContextValue {
  titleId: string;
  descriptionId: string;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  status?: AlertStatus;
  variant?: AlertVariant;
  size?: AlertSize;
  /** Render custom icon; pass `false` to hide the default status icon. */
  icon?: ReactNode | false;
  closable?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  /**
   * ARIA role. Defaults to `alert` for danger/warning (interruptive) and
   * `status` otherwise. `none` suppresses both.
   */
  role?: AlertRole;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    status = 'info',
    variant = 'soft',
    size = 'md',
    icon,
    closable,
    onClose,
    closeLabel = 'Dismiss',
    role,
    className,
    children,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const context = useMemo<AlertContextValue>(
    () => ({ titleId, descriptionId }),
    [titleId, descriptionId],
  );

  const resolvedRole: AlertRole =
    role ?? (status === 'danger' || status === 'warning' ? 'alert' : 'status');

  const showIcon = icon !== false;
  const iconNode = icon === false || icon === undefined ? <StatusIcon status={status} /> : icon;

  return (
    <AlertContext.Provider value={context}>
      <div
        ref={ref}
        {...(resolvedRole !== 'none' ? { role: resolvedRole } : {})}
        data-status={status}
        aria-live={resolvedRole === 'status' ? 'polite' : undefined}
        aria-labelledby={ariaLabelledByProp}
        aria-describedby={ariaDescribedByProp}
        className={cn(
          surfaceRoot,
          surfaceSize[size],
          surfaceVariantClass[variant][status],
          className,
        )}
        {...rest}
      >
        {showIcon ? <span className={surfaceIcon}>{iconNode}</span> : null}
        <div className={surfaceContent}>{children}</div>
        {closable ? (
          <button type="button" aria-label={closeLabel} className={surfaceClose} onClick={onClose}>
            <CloseIcon />
          </button>
        ) : null}
      </div>
    </AlertContext.Provider>
  );
});

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(function AlertTitle(
  { as: As = 'p', className, id, ...rest },
  ref,
) {
  const ctx = useContext(AlertContext);
  return (
    <As
      ref={ref as never}
      id={id ?? ctx?.titleId}
      className={cn(surfaceTitle, className)}
      {...rest}
    />
  );
});

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  function AlertDescription({ className, id, ...rest }, ref) {
    const ctx = useContext(AlertContext);
    return (
      <p
        ref={ref}
        id={id ?? ctx?.descriptionId}
        className={cn(surfaceDescription, className)}
        {...rest}
      />
    );
  },
);
