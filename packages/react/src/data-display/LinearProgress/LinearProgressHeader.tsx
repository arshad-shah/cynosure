import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressHeader } from './LinearProgress.css.js';

/** Props for the {@link LinearProgressHeader} flex row above the track. */
export interface LinearProgressHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Header contents — typically a {@link LinearProgressLabel} followed by a {@link LinearProgressMeta}. */
  children?: ReactNode;
}

/**
 * Flex row above the track. Holds `<LinearProgressLabel>` on the start side
 * and `<LinearProgressMeta>` on the end side (speed / ETA / "12 of 20").
 */
export function LinearProgressHeader({
  children,
  className,
  ...rest
}: LinearProgressHeaderProps): ReactElement {
  return (
    <div className={cn(linearProgressHeader, className)} {...rest}>
      {children}
    </div>
  );
}
