import type { MutableRefObject } from 'react';
import { createContext } from '../../utils/createContext.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';

export type TextareaResizeMode = 'vertical' | 'horizontal' | 'both' | 'none';

export interface TextareaContextValue {
  id: string;
  name?: string;
  value: string;
  setValue: (next: string) => void;
  fieldRef: MutableRefObject<HTMLTextAreaElement | null>;
  rootRef: MutableRefObject<HTMLDivElement | null>;

  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  /** `invalid` flows from explicit prop OR an over-limit counter. */
  invalid: boolean;
  overLimit: boolean;

  size: FormControlSize;
  variant: FormControlVariant;

  /** Limit forwarded from Root to any nested Counter that doesn't override it. */
  limit?: number;
  autoResize: boolean;
  maxRows?: number;
  resize: TextareaResizeMode;

  /** Set by `<TextareaClearButton>` so `<TextareaField>` can reserve right padding. */
  hasClearButton: boolean;
  setHasClearButton: (has: boolean) => void;
  /**
   * Set by a visible `<TextareaResizeHandle>`. Combined with `hasFooter`, this
   * decides where the grip reserves its slot:
   * - footer present → footer reserves right-padding, field unchanged
   * - no footer → field reserves bottom-padding
   * Either way, consumer content can't slide under the grip.
   */
  hasResizeHandle: boolean;
  setHasResizeHandle: (has: boolean) => void;
  /** Set by `<TextareaFooter>` so the grip's reserved slot moves into the footer's right edge. */
  hasFooter: boolean;
  setHasFooter: (has: boolean) => void;
  /** Set by `<TextareaCounter>` when the count exceeds the limit. */
  setOverLimit: (over: boolean) => void;

  /** For aria-describedby pass-through from FormControl etc. */
  ariaDescribedBy?: string;
}

export const [TextareaContextProvider, useTextareaContext] =
  createContext<TextareaContextValue>('TextareaContextProvider');
