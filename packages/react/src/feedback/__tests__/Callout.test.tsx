import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Callout, CalloutContent, CalloutTitle } from '../Callout/index.js';

describe('Callout', () => {
  it('renders title and content slots', () => {
    render(
      <Callout colorScheme="accent" icon={<span data-testid="icon">i</span>}>
        <CalloutTitle>Pro tip</CalloutTitle>
        <CalloutContent>Use asChild.</CalloutContent>
      </Callout>,
    );
    expect(screen.getByText('Pro tip')).toBeInTheDocument();
    expect(screen.getByText('Use asChild.')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('omits icon when icon={false}', () => {
    const { container } = render(
      <Callout icon={false}>
        <CalloutContent>Plain</CalloutContent>
      </Callout>,
    );
    expect(container.querySelector('svg')).toBeNull();
  });
});
