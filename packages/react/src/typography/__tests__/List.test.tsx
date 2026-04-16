import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  List,
  ListItem,
  OrderedList,
} from '../List/index.js';

describe('List', () => {
  it('renders a <ul> with <li> children', () => {
    const { container } = render(
      <List>
        <ListItem>one</ListItem>
        <ListItem>two</ListItem>
      </List>,
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(ul?.querySelectorAll('li').length).toBe(2);
  });

  it('sets the list-style marker via CSS custom property', () => {
    const { container } = render(
      <List marker="square" data-testid="l">
        <ListItem>x</ListItem>
      </List>,
    );
    const el = container.querySelector('[data-testid="l"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-list-marker-base')).toBe('square');
  });

  it('marker="none" hides the marker via data attribute', () => {
    const { container } = render(
      <List marker="none" data-testid="l">
        <ListItem>x</ListItem>
      </List>,
    );
    const el = container.querySelector('[data-testid="l"]') as HTMLElement;
    expect(el.getAttribute('data-marker-hidden')).toBe('true');
  });

  it('applies markerColor as a CSS custom property', () => {
    const { container } = render(
      <List markerColor="accent.solid" data-testid="l">
        <ListItem>x</ListItem>
      </List>,
    );
    const el = container.querySelector('[data-testid="l"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-list-marker-color')).toBe(
      'var(--lumen-color-accent-solid)',
    );
  });

  it('warns when `as` is passed to List and renders <ul> anyway', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const { container } = render(
        // @ts-expect-error intentional misuse to test fail-fast behaviour
        <List as="ol" data-testid="l">
          <ListItem>x</ListItem>
        </List>,
      );
      const el = container.querySelector('[data-testid="l"]') as HTMLElement;
      expect(el.tagName).toBe('UL');
      expect(errorSpy).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe('OrderedList', () => {
  it('renders an <ol> and forwards `start` / `reversed`', () => {
    const { container } = render(
      <OrderedList start={3} reversed>
        <ListItem>a</ListItem>
        <ListItem>b</ListItem>
      </OrderedList>,
    );
    const ol = container.querySelector('ol') as HTMLOListElement;
    expect(ol).not.toBeNull();
    expect(ol.getAttribute('start')).toBe('3');
    expect(ol.hasAttribute('reversed')).toBe(true);
  });

  it('defaults marker to decimal', () => {
    const { container } = render(
      <OrderedList data-testid="ol">
        <ListItem>x</ListItem>
      </OrderedList>,
    );
    const el = container.querySelector('[data-testid="ol"]') as HTMLElement;
    expect(el.style.getPropertyValue('--lumen-list-marker-base')).toBe('decimal');
  });
});

describe('DescriptionList', () => {
  it('renders <dl>/<dt>/<dd>', () => {
    const { container } = render(
      <DescriptionList>
        <DescriptionTerm>Cost</DescriptionTerm>
        <DescriptionDetails>$10</DescriptionDetails>
      </DescriptionList>,
    );
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelector('dt')?.textContent).toBe('Cost');
    expect(container.querySelector('dd')?.textContent).toBe('$10');
  });
});
