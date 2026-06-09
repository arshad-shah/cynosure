import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

/**
 * Shared **segmented track** recipe — the tinted, padded container that wraps
 * a row of raised segments. One visual language across every segmented
 * control: `NumberInput`'s `[ − ][ value ][ + ]`, `ToggleGroup`'s `attached`
 * bar (and through it `ThemeToggle`'s `segmented` variant), and
 * `ButtonGroup`'s `attached` mode.
 *
 * The track is a light `subtle` well with a hairline border, `4px` padding,
 * and a `4px` gap; segments float inside it as raised tiles. Consumers add
 * their own segment styling (raise, selected, pressed states) and any state
 * selectors (focus ring, invalid, disabled) on top — those are keyed to each
 * component's data attributes, so they live with the component.
 */
export const segmentedTrack = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  boxSizing: 'border-box',
  padding: vars.space['1'],
  gap: vars.space['1'],
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.background.subtle,
  transitionProperty: 'border-color, box-shadow, background-color',
  transitionDuration: vars.duration.fast,
  '@media': {
    '(prefers-reduced-motion: reduce)': { transitionDuration: '0s' },
  },
});
