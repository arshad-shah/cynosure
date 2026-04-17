import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../Accordion/index.js';

describe('Accordion', () => {
  it('single type toggles one item at a time', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>One</AccordionTrigger>
          <AccordionContent>first content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Two</AccordionTrigger>
          <AccordionContent>second content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    fireEvent.click(one);
    expect(one).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(one).toHaveAttribute('aria-expanded', 'false');
  });

  it('multiple type keeps multiple items open', () => {
    render(
      <Accordion type="multiple" defaultValue={['one']}>
        <AccordionItem value="one">
          <AccordionTrigger>One</AccordionTrigger>
          <AccordionContent>first</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Two</AccordionTrigger>
          <AccordionContent>second</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    const two = screen.getByRole('button', { name: 'Two' });
    expect(one).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(two);
    expect(one).toHaveAttribute('aria-expanded', 'true');
    expect(two).toHaveAttribute('aria-expanded', 'true');
  });
});
