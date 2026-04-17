import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipProvider } from '../Tooltip/index.js';

describe('Tooltip', () => {
  it('renders its child as the trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip content="Duplicate">
          <button type="button">Trigger</button>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

  it('short-circuits to the bare child when disabled', () => {
    render(
      <Tooltip content="Duplicate" disabled>
        <button type="button">Naked</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Naked' })).toBeInTheDocument();
  });

  it('renders tooltip content when controlled open', () => {
    render(
      <TooltipProvider>
        <Tooltip content="Duplicate" open>
          <button type="button">Trigger</button>
        </Tooltip>
      </TooltipProvider>,
    );
    const tips = screen.getAllByText('Duplicate');
    expect(tips.length).toBeGreaterThan(0);
  });
});
