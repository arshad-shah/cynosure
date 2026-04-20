import { createContext } from '../../utils/createContext.js';

export type CircularProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CircularProgressColorScheme =
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';
export type CircularProgressCompletionState = 'auto' | 'none';

export interface CircularProgressContextValue {
  value: number;
  max: number;
  size: CircularProgressSize;
  colorScheme: CircularProgressColorScheme;
  thickness: number;
  indeterminate: boolean;
  isComplete: boolean;
  completionState: CircularProgressCompletionState;
  /** viewBox radius — fixed at 16 (leaves 2 units of stroke padding in the 36×36 viewBox). */
  radius: number;
  circumference: number;
}

export const [CircularProgressContextProvider, useCircularProgressContext] =
  createContext<CircularProgressContextValue>('CircularProgressContextProvider');

export const clampProgress = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);
