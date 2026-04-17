import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LocaleProvider, useLocale } from '../LocaleProvider.js';

function Probe() {
  const { locale, direction } = useLocale();
  return (
    <div data-testid="probe" data-locale={locale} data-direction={direction}>
      {locale}/{direction}
    </div>
  );
}

describe('LocaleProvider', () => {
  it('defaults to en-IE / ltr', () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    const probe = screen.getByTestId('probe');
    expect(probe.dataset.locale).toBe('en-IE');
    expect(probe.dataset.direction).toBe('ltr');
  });

  it('forwards the supplied locale and resolves rtl direction', () => {
    render(
      <LocaleProvider locale="ar-SA">
        <Probe />
      </LocaleProvider>,
    );
    const probe = screen.getByTestId('probe');
    expect(probe.dataset.locale).toBe('ar-SA');
    expect(probe.dataset.direction).toBe('rtl');
  });
});
