import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { outlineAccent, solidAccent } from '../Button/Button.css.js';
import { Button } from '../Button/index.js';
import { ButtonGroup } from '../ButtonGroup/index.js';

describe('ButtonGroup', () => {
  it('provides variant/size/colorScheme to nested buttons via context', () => {
    render(
      <ButtonGroup variant="outline" size="sm">
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    for (const btn of buttons) {
      expect(btn.className).toContain(outlineAccent);
      expect(btn.className).not.toContain(solidAccent);
    }
  });

  it('renders role="group" by default', () => {
    render(
      <ButtonGroup aria-label="toolbar">
        <Button>A</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group', { name: 'toolbar' })).toBeInTheDocument();
  });
});
