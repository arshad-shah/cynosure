import {
  type Context,
  type Provider,
  type ReactNode,
  createContext as reactCreateContext,
  useContext as reactUseContext,
} from 'react';

interface CreateContextOptions<T> {
  /** Value used when the context is read outside a provider (skips the throw). */
  fallback?: T;
  /** Custom error message override (defaults to `"use<Name> must be used within a <Name>"`). */
  errorMessage?: string;
}

export type ContextProvider<T> = (props: { value: T; children: ReactNode }) => ReactNode;

/**
 * Typed context factory used by compound components. Produces a provider and
 * a hook; the hook throws a helpful error when called outside the provider
 * (unless a `fallback` is supplied, in which case it returns that instead).
 *
 * ```ts
 * const [ThemeProvider, useThemeContext] = createContext<ThemeContextValue>('ThemeProvider');
 * ```
 */
export function createContext<T>(
  name: string,
  options: CreateContextOptions<T> = {},
): readonly [Provider<T | undefined>, () => T, Context<T | undefined>] {
  const Context = reactCreateContext<T | undefined>(undefined);
  Context.displayName = name;

  const useNamedContext = (): T => {
    const value = reactUseContext(Context);
    if (value === undefined) {
      if ('fallback' in options) return options.fallback as T;
      const hookName = `use${name.replace(/Provider$/, '')}`;
      throw new Error(options.errorMessage ?? `\`${hookName}\` must be used within a \`${name}\`.`);
    }
    return value;
  };

  return [Context.Provider, useNamedContext, Context] as const;
}
