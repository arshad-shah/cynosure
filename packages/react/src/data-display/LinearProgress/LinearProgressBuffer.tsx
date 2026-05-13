import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { cn } from '../../utils/cn.js';
import { linearProgressBuffer } from './LinearProgress.css.js';
import { clampProgress, useLinearProgressContext } from './LinearProgressContext.js';

/** Props for the {@link LinearProgressBuffer} pre-load layer. The `style` prop is reserved for the internal transform. */
export interface LinearProgressBufferProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  /**
   * Buffered / preloaded progress — shown as a lighter bar behind the
   * indicator. Shares the root's `max`, so `50` on a root with `max=100`
   * paints half the track.
   */
  value: number;
}

/**
 * YouTube-style buffer bar. Sits behind `<LinearProgressIndicator>` in the
 * same track (higher z-index on the indicator), so consumers can compose
 * "this much is downloaded, this much has played" without styling by hand.
 */
export function LinearProgressBuffer({
  value,
  className,
  ...rest
}: LinearProgressBufferProps): ReactElement {
  const { max, indeterminate } = useLinearProgressContext();
  if (indeterminate) return <span aria-hidden="true" hidden />;

  const pct = max > 0 ? clampProgress(value, 0, max) / max : 0;
  const style: CSSProperties = { transform: `scaleX(${pct.toString()})` };

  return (
    <span
      aria-hidden="true"
      className={cn(linearProgressBuffer, className)}
      style={style}
      {...rest}
    />
  );
}
