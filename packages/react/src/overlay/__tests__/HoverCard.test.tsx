import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../HoverCard/index.js';

describe('HoverCard', () => {
  it('renders the trigger and the content when open is controlled true', () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>@arshad</HoverCardTrigger>
        <HoverCardContent>Profile preview</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText('@arshad')).toBeInTheDocument();
    expect(screen.getByText('Profile preview')).toBeInTheDocument();
  });
});
