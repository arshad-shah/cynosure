import type { CSSProperties } from 'react';
import { resolveColor } from '../../primitives/layout/shared/index.js';
import type { ColorToken } from '../../primitives/layout/shared/index.js';

/**
 * Compute the inline-style payload needed to drive the shared typography
 * classes that read CSS custom properties:
 *  - `--cynosure-typography-decoration-color` feeds `underlineClass` /
 *    `strikethroughClass` so decoration colour can diverge from text colour.
 *  - `--cynosure-typography-line-clamp` feeds `lineClamp` so a single class
 *    handles any line count.
 *
 * Returns `undefined` when nothing needs to be written so downstream
 * `mergeStyles` calls can skip empty objects.
 */
export interface TypographyStyleInput {
  truncate?: boolean | number;
  decorationColor?: ColorToken;
}

export const typographyInlineStyle = (input: TypographyStyleInput): CSSProperties | undefined => {
  const out: Record<string, string> = {};
  if (typeof input.truncate === 'number' && input.truncate > 1) {
    out['--cynosure-typography-line-clamp'] = String(input.truncate);
  }
  if (input.decorationColor !== undefined) {
    out['--cynosure-typography-decoration-color'] = resolveColor(input.decorationColor);
  }
  return Object.keys(out).length > 0 ? (out as CSSProperties) : undefined;
};
