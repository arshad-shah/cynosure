import { checkCircle } from "../icons/check-circle.js";
import { info } from "../icons/info.js";
import type { IconData } from "../icons/types.js";
import { warning } from "../icons/warning.js";
import { xCircle } from "../icons/x-circle.js";
import type { Tone } from "../tokens/schema.js";

/** The icon that goes with a message's tone (Notice, Toast). Neutral messages have none. */
export const TONE_ICONS: Partial<Record<Tone, IconData>> = {
  info,
  success: checkCircle,
  warning,
  danger: xCircle,
  accent: info,
};
