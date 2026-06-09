import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Free-form tag entry row. Unlike `MultiSelect` (a fixed-height trigger that
 * collapses overflow into a `+N` badge), `TagsInput` is a composer: it wraps
 * to as many lines as needed and keeps an inline text field for typing the
 * next tag.
 */
export const tagsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['1.5'],
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  paddingBlock: vars.space['1'],
});

export const inlineInput = style({
  flex: 1,
  minWidth: '4rem',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: 0,
  cursor: 'text',
  selectors: {
    '&:disabled': { cursor: 'not-allowed' },
  },
});
