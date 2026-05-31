import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { CheckboxGroup } from './CheckboxGroup.js';

/**
 * Real-browser test: each grouped checkbox is a custom button with a measurable
 * hit target, and selection state flows through context. Confirming the boxes
 * render real layout boxes and that clicks update the shared value needs an
 * actual layout engine. Runs across the Chromium/Firefox/WebKit matrix in CI.
 */
test('CheckboxGroup updates its value as boxes are toggled', () => {
  const values: string[][] = [];
  render(
    <CheckboxGroup defaultValue={['en']} onChange={(v) => values.push(v)} aria-label="Languages">
      <Checkbox value="en">English</Checkbox>
      <Checkbox value="fr">French</Checkbox>
    </CheckboxGroup>,
  );

  const [english, french] = screen.getAllByRole('checkbox');
  expect(english.getBoundingClientRect().width).toBeGreaterThan(0);
  expect(english).toHaveAttribute('data-state', 'checked');
  expect(french).toHaveAttribute('data-state', 'unchecked');

  fireEvent.click(french);
  expect(french).toHaveAttribute('data-state', 'checked');
  expect(values.at(-1)).toEqual(['en', 'fr']);

  fireEvent.click(english);
  expect(english).toHaveAttribute('data-state', 'unchecked');
  expect(values.at(-1)).toEqual(['fr']);
});
