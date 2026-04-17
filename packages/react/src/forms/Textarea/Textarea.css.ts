import { style } from '@vanilla-extract/css';

/**
 * Textarea field. The wrapper is the same `controlWrapperBase` shared with
 * `<Input>` — only the raw `<textarea>` itself needs tweaking for vertical
 * resize and the larger default height.
 */
export const textareaField = style({
  resize: 'vertical',
  minHeight: '4rem',
  paddingBlock: '0.5rem',
});

/**
 * `field-sizing: content` is Chromium-only right now and absent from the
 * csstype map vanilla-extract pulls in, so the rule is declared on the
 * class with an explicit cast. The fallback for non-supporting browsers is
 * just the default textarea size + consumer's `rows`.
 */
export const textareaAutoResize = style({
  resize: 'none',
  fieldSizing: 'content',
});
