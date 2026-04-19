import type { ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { actions } from './Textarea.css.js';

export interface TextareaActionsProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Inline-flex wrapper for toolbar buttons placed inside `<TextareaFooter>`.
 * Keeps 2px gaps between icon-buttons so they read as a grouped toolbar.
 */
export function TextareaActions({ children, className }: TextareaActionsProps): ReactElement {
  return <div className={cn(actions, className)}>{children}</div>;
}
