import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from '../Collapsible/index.js';

describe('Collapsible', () => {
  it('opens and closes content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>toggle</CollapsibleTrigger>
        <CollapsibleContent>body</CollapsibleContent>
      </Collapsible>,
    );
    const btn = screen.getByRole('button', { name: 'toggle' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('Disclosure is an alias for Collapsible', () => {
    expect(Disclosure).toBe(Collapsible);
    expect(DisclosureTrigger).toBe(CollapsibleTrigger);
    expect(DisclosureContent).toBe(CollapsibleContent);
  });
});
