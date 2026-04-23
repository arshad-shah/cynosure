import { style } from '@vanilla-extract/css';
import { buildResponsiveRules } from '../shared/buildResponsive.js';
import { layoutPropsStyle } from '../shared/layoutStyle.css.js';

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
