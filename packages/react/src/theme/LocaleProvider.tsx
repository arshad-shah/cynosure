import type { ReactNode } from 'react';
import { I18nProvider, useLocale as useAriaLocale } from 'react-aria-components';

export interface LocaleProviderProps {
  /**
   * BCP-47 locale tag (e.g. `"en-IE"`, `"ar-SA"`). When omitted, React Aria
   * falls back to the browser / navigator locale.
   *
   * Default is `"en-IE"` — Lumen's house default.
   */
  locale?: string;
  children: ReactNode;
}

/**
 * Thin wrapper around React Aria's `I18nProvider`. Our components read locale
 * via `useLocale()` (or indirectly through React Aria hooks) so `DatePicker`,
 * `NumberInput`, `Slider` etc. format/parse values correctly for the user's
 * region.
 *
 * Nest under `ThemeProvider` / `DirectionProvider`:
 *
 * ```tsx
 * <ThemeProvider>
 *   <DirectionProvider dir="rtl">
 *     <LocaleProvider locale="ar-SA">
 *       <App />
 *     </LocaleProvider>
 *   </DirectionProvider>
 * </ThemeProvider>
 * ```
 */
export function LocaleProvider({ locale = 'en-IE', children }: LocaleProviderProps) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}

/** Returns the currently active locale + its text direction. */
export function useLocale(): { locale: string; direction: 'ltr' | 'rtl' } {
  return useAriaLocale();
}
