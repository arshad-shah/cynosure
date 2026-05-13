import { CheckCircleIcon, CircleAlert, TriangleAlert, XIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import type { FeedbackStatus } from './types.js';

/** Decorative close icon used by dismissible feedback components. */
export const CloseIcon = (): ReactElement => <XIcon size="0.875em" aria-hidden="true" />;

/** Decorative SVG icon shared by Alert / Notification status dots. */
export const StatusIcon = ({ status }: { status: FeedbackStatus }): ReactElement => {
  switch (status) {
    case 'success':
      return <CheckCircleIcon size="1em" aria-hidden="true" />;
    case 'warning':
      return <TriangleAlert size="1em" aria-hidden="true" />;
    case 'danger':
      return <CircleAlert size="1em" aria-hidden="true" />;
    default:
      return <CircleAlert size="1em" aria-hidden="true" />;
  }
};
