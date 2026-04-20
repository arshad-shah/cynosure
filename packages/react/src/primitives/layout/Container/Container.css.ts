import { style } from '@vanilla-extract/css';
import { buildResponsiveRules, layoutPropsStyle } from '../shared/layoutStyle.css.js';

/**
 * Named container widths. Consumed via the `--cynosure-container-maxw-{bp}`
 * custom property chain so `size` can be responsive without switching classes.
 */
export const CONTAINER_MAX_WIDTHS = {
  sm: '40rem', //  640px
  md: '48rem', //  768px
  lg: '64rem', // 1024px (default)
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
  prose: '65ch',
  full: '100%',
} as const;

const CONTAINER_ENTRIES: Array<[string, string]> = [['max-width', 'cynosure-container-maxw']];

const CONTAINER_RULES = buildResponsiveRules(CONTAINER_ENTRIES);

export const containerBase = style([
  layoutPropsStyle,
  {
    width: '100%',
    marginInline: 'auto',
    ...CONTAINER_RULES.base,
    '@media': CONTAINER_RULES.media,
  },
]);
