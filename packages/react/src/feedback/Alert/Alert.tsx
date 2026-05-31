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
  size: AlertSize;
}

// Scale the title / description text with the alert size so `sm`, `md`, and
// `lg` are visibly distinct (previously every size rendered identical
// typography, so the size prop had almost no effect).
const TITLE_SIZE: Record<AlertSize, 'sm' | 'md' | 'lg'> = { sm: 'sm', md: 'md', lg: 'lg' };
const DESCRIPTION_SIZE: Record<AlertSize, 'xs' | 'sm' | 'md'> = { sm: 'xs', md: 'sm', lg: 'md' };

const AlertContext = createContext<AlertContextValue | null>(null);

/**
 * Props for the {@link Alert} root component.
 */
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Semantic status that drives colour, default icon, and ARIA role. One of
   * `info`, `success`, `warning`, `danger`, `neutral`.
   * @default "info"
   */
  status?: AlertStatus;
  /**
   * Visual style. `soft` reads as a tinted surface; `solid` is high-contrast;
   * `outline` is bordered; `ghost` is borderless.
   * @default "soft"
   */
  variant?: AlertVariant;
  /**
   * Controls padding and typographic scale. One of `sm`, `md`, `lg`.
   * @default "md"
   */
  size?: AlertSize;
  /** Render custom icon; pass `false` to hide the default status icon. */
  icon?: ReactNode | false;
  /** Show a trailing close button that triggers `onClose`. */
  closable?: boolean;
  /** Invoked when the user activates the close button. */
  onClose?: () => void;
  /**
   * Accessible label for the close button.
   * @default "Dismiss"
   */
  closeLabel?: string;
  /**
   * ARIA role. Defaults to `alert` for danger/warning (interruptive) and
   * `status` otherwise. `none` suppresses both.
   */
  role?: AlertRole;
}

/**
 * Inline message that communicates the result of an action or the state of a
 * region. Use Alert for non-blocking feedback like form-level errors, success
 * confirmations, or contextual warnings. The default role is `status` for
 * polite announcements and `alert` for danger/warning statuses so assistive
 * tech interrupts the user appropriately.
 */
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
    () => ({ titleId, descriptionId, size }),
    [titleId, descriptionId, size],
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

/**
 * Props for the {@link AlertTitle} heading slot.
 */
export interface AlertTitleProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /**
   * HTML element used to render the title. Choose a heading level that fits
   * the document outline.
   * @default "p"
   */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

/**
 * Heading slot for {@link Alert}. Renders semibold copy and is automatically
 * referenced by the alert's `aria-labelledby` when present.
 */
export const AlertTitle = forwardRef<HTMLElement, AlertTitleProps>(function AlertTitle(
  { as = 'p', id, children, ...rest },
  ref,
) {
  const ctx = useContext(AlertContext);
  return (
    <Text
      ref={ref as never}
      as={as as never}
      size={TITLE_SIZE[ctx?.size ?? 'md']}
      weight="semibold"
      id={id ?? ctx?.titleId}
      {...rest}
    >
      {children}
    </Text>
  );
});

/**
 * Props for the {@link AlertDescription} body slot.
 */
export interface AlertDescriptionProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, 'color'> {}

/**
 * Body copy slot for {@link Alert}. Renders at the small text size and is
 * automatically referenced by the alert's `aria-describedby` when present.
 */
export const AlertDescription = forwardRef<HTMLElement, AlertDescriptionProps>(
  function AlertDescription({ id, children, ...rest }, ref) {
    const ctx = useContext(AlertContext);
    return (
      <Text
        ref={ref as never}
        as="p"
        size={DESCRIPTION_SIZE[ctx?.size ?? 'md']}
        id={id ?? ctx?.descriptionId}
        {...rest}
      >
        {children}
      </Text>
    );
  },
);
