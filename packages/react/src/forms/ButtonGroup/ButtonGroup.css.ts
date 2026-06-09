import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';
import { segmentedTrack } from '../shared/segmented.css.js';

export const buttonGroup = style({
  display: 'inline-flex',
  gap: vars.space['2'],
});

/**
 * Attached mode renders the buttons inside the shared segmented-track
 * container (tinted `subtle` well, hairline border, 4px padding/gap) used by
 * `NumberInput` and `ToggleGroup`'s attached bar, so every segmented control
 * in the library reads the same. Buttons keep their own radius and variant
 * surface — they float in the track as raised tiles.
 */
export const buttonGroupAttached = style([segmentedTrack]);
