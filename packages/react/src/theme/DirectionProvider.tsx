import { createContext, useContext, useMemo } from 'react';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect.js';
import type { DirectionContextValue, DirectionProviderProps } from './types.js';

const DirectionContext = createContext<DirectionContextValue>({ dir: 'ltr' });

export function DirectionProvider({
  dir = 'ltr',
  scope = 'document',
  children,
}: DirectionProviderProps) {
  useIsomorphicLayoutEffect(() => {
    if (scope !== 'document') return;
    if (typeof document === 'undefined') return;
    const previous = document.documentElement.getAttribute('dir');
    document.documentElement.setAttribute('dir', dir);
    return () => {
      if (previous === null) {
        document.documentElement.removeAttribute('dir');
      } else {
        document.documentElement.setAttribute('dir', previous);
      }
    };
  }, [dir, scope]);

  const value = useMemo<DirectionContextValue>(() => ({ dir }), [dir]);

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

export const DirectionContextInternal = DirectionContext;

export function useDirectionContext(): DirectionContextValue {
  return useContext(DirectionContext);
}
