import type { ReactElement } from 'react';
import type { FeedbackStatus } from './types.js';

/** Decorative SVG icon shared by Alert / Banner / Notification status dots. */
export const StatusIcon = ({ status }: { status: FeedbackStatus }): ReactElement => {
  switch (status) {
    case 'success':
      return (
        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m6 10 2.8 2.8L14 7.6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 2.5 18 16H2L10 2.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 8v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.75" fill="currentColor" />
        </svg>
      );
    case 'danger':
      return (
        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 7l6 6M13 7l-6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 9v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="10" cy="6.25" r="0.9" fill="currentColor" />
        </svg>
      );
  }
};

export const CloseIcon = (): ReactElement => (
  <svg width="0.875em" height="0.875em" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
