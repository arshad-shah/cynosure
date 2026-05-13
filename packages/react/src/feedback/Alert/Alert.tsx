import {
  type HTMLAttributes,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
} from 'react';
import { IconButton } from '../../forms/IconButton/IconButton.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import { cn } from '../../utils/cn.js';
import { CloseIcon, StatusIcon } from '../shared/icons.js';
import { surfaceClose, surfaceIcon, surfaceRoot, surfaceSize } from '../shared/surface.css.js';
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
        <Stack gap="1" style={{ flex: '1 1 auto', minWidth: 0 }}>
          {children}
        </Stack>
        {closable ? (
          <IconButton
            variant="bare"
            label={closeLabel}
            icon={<CloseIcon />}
            className={surfaceClose}
            onClick={onClose}
          />
        ) : null}
      </div>
    </AlertContext.Provider>
  );
});

export interface AlertTitleProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export const AlertTitle = forwardRef<HTMLElement, AlertTitleProps>(function AlertTitle(
  { as = 'p', id, children, ...rest },
  ref,
) {
  const ctx = useContext(AlertContext);
  return (
    <Text
      ref={ref as never}
      as={as as never}
      size="md"
      weight="semibold"
      id={id ?? ctx?.titleId}
      {...rest}
    >
      {children}
    </Text>
  );
});

export interface AlertDescriptionProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, 'color'> {}

export const AlertDescription = forwardRef<HTMLElement, AlertDescriptionProps>(
  function AlertDescription({ id, children, ...rest }, ref) {
    const ctx = useContext(AlertContext);
    return (
      <Text ref={ref as never} as="p" size="sm" id={id ?? ctx?.descriptionId} {...rest}>
        {children}
      </Text>
    );
  },
);
