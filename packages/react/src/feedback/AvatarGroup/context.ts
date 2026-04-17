import { createContext } from 'react';
import type { AvatarSize } from '../Avatar/Avatar.js';

export interface AvatarGroupContextValue {
  size?: AvatarSize;
  ring?: boolean;
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);
