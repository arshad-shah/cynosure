import { type ReactElement, type ReactNode, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import { footer, footerSize } from './Textarea.css.js';
import { useTextareaContext } from './TextareaContext.js';

export interface TextareaFooterProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Horizontal row inside the card, separated from the field by a hairline
 * divider. Houses `<TextareaActions>` on the left and `<TextareaCounter>` on
 * the right by default (via `justify-content: space-between`). Registers
 * itself with Root so the grip's reserved slot shifts from field-bottom to
 * footer-right when both are present.
 */
export function TextareaFooter({ children, className }: TextareaFooterProps): ReactElement {
  const ctx = useTextareaContext();
  useEffect(() => {
    ctx.setHasFooter(true);
    return () => ctx.setHasFooter(false);
  }, [ctx.setHasFooter]);
  return <div className={cn(footer, footerSize[ctx.size], className)}>{children}</div>;
}
