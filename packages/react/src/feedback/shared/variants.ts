import {
  ghostDanger,
  ghostInfo,
  ghostSuccess,
  ghostWarning,
  outlineDanger,
  outlineInfo,
  outlineSuccess,
  outlineWarning,
  softDanger,
  softInfo,
  softSuccess,
  softWarning,
  solidDanger,
  solidInfo,
  solidSuccess,
  solidWarning,
} from './surface.css.js';
import type { FeedbackStatus, FeedbackVariant } from './types.js';

export const surfaceVariantClass: Record<FeedbackVariant, Record<FeedbackStatus, string>> = {
  solid: {
    info: solidInfo,
    success: solidSuccess,
    warning: solidWarning,
    danger: solidDanger,
  },
  soft: {
    info: softInfo,
    success: softSuccess,
    warning: softWarning,
    danger: softDanger,
  },
  outline: {
    info: outlineInfo,
    success: outlineSuccess,
    warning: outlineWarning,
    danger: outlineDanger,
  },
  ghost: {
    info: ghostInfo,
    success: ghostSuccess,
    warning: ghostWarning,
    danger: ghostDanger,
  },
};
