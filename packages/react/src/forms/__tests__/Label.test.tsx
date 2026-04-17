import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorText } from '../ErrorText/index.js';
import { Fieldset } from '../Fieldset/index.js';
import { HelperText } from '../HelperText/index.js';
import { Label } from '../Label/index.js';

describe('Label', () => {
  it('renders a <label> and associates via htmlFor', () => {
    render(<Label htmlFor="x">Email</Label>);
    const el = screen.getByText('Email').closest('label') as HTMLLabelElement;
    expect(el).not.toBeNull();
    expect(el.htmlFor).toBe('x');
  });

  it('appends a decorative required indicator', () => {
    render(<Label required>Email</Label>);
    const indicator = screen.getByText('*');
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('HelperText', () => {
  it('renders a paragraph with the provided id for describedby', () => {
    render(<HelperText id="hint">Helpful context</HelperText>);
    const p = screen.getByText('Helpful context');
    expect(p.tagName).toBe('P');
    expect(p.id).toBe('hint');
  });
});

describe('ErrorText', () => {
  it('renders with role="alert" for assistive-tech announcement', () => {
    render(<ErrorText>Required</ErrorText>);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});

describe('Fieldset', () => {
  it('renders a fieldset/legend pair with the disabled attribute', () => {
    render(
      <Fieldset legend="Profile" disabled>
        <input aria-label="Name" />
      </Fieldset>,
    );
    expect(screen.getByText('Profile').tagName).toBe('LEGEND');
    const fs = screen.getByText('Profile').parentElement as HTMLFieldSetElement;
    expect(fs.tagName).toBe('FIELDSET');
    expect(fs.disabled).toBe(true);
    expect(fs.getAttribute('data-disabled')).toBe('true');
  });
});
