import { createContext } from '../../utils/createContext.js';

export type LinearProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type LinearProgressColorScheme =
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';
export type LinearProgressVariant = 'solid' | 'ticked';
export type LinearProgressCompletionState = 'auto' | 'none';

export interface LinearProgressContextValue {
  value: number;
  max: number;
  size: LinearProgressSize;
  variant: LinearProgressVariant;
  colorScheme: LinearProgressColorScheme;
  indeterminate: boolean;
  /** `true` once `value >= max` AND `completionState === 'auto'`. */
  isComplete: boolean;
  completionState: LinearProgressCompletionState;
  formatValue?: (value: number, max: number) => string;
}

export const [LinearProgressContextProvider, useLinearProgressContext] =
  createContext<LinearProgressContextValue>('LinearProgressContextProvider');

export const clampProgress = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);
