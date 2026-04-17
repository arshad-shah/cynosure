import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stat, StatArrow, StatHelp, StatLabel, StatValue } from '../Stat/index.js';

describe('Stat', () => {
  it('renders label, value, arrow + help', () => {
    render(
      <Stat>
        <StatLabel>Revenue</StatLabel>
        <StatValue>£12,450</StatValue>
        <StatHelp>
          <StatArrow direction="increase" />
          23.36%
        </StatHelp>
      </Stat>,
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('£12,450')).toBeInTheDocument();
    expect(screen.getByLabelText('Increased by')).toHaveAttribute('data-direction', 'increase');
  });
});
