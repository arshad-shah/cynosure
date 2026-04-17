import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/index.js';

describe('Popover', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>Popover body</div>
        </PopoverContent>
      </Popover>
    );
  }

  it('opens when the trigger is clicked', () => {
    render(<Harness />);
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Popover body')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Popover body')).not.toBeInTheDocument();
  });
});
