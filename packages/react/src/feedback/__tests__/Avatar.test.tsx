import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AVATAR_PALETTE, Avatar, colorFromName, initialsFromName } from '../Avatar/index.js';
import { AvatarGroup } from '../AvatarGroup/index.js';

describe('Avatar', () => {
  it('renders initials derived from the name', () => {
    render(<Avatar name="Arshad Shah" />);
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('renders a status dot when requested', () => {
    const { container } = render(<Avatar name="A" status="online" />);
    expect(container.querySelector('[data-status="online"]')).not.toBeNull();
  });

  it('colorFromName is deterministic', () => {
    const a = colorFromName('Arshad Shah');
    const b = colorFromName('Arshad Shah');
    expect(a).toBe(b);
    expect(AVATAR_PALETTE).toContain(a);
  });

  it('colorFromName distributes across the palette for common names', () => {
    const seen = new Set(
      ['Alice', 'Bob', 'Cara', 'Diana', 'Eli', 'Fay', 'Greg', 'Hana'].map(colorFromName),
    );
    // Expect more than one palette entry hit — not a perfect distribution test,
    // but catches obvious "always returns palette[0]" regressions.
    expect(seen.size).toBeGreaterThan(1);
  });

  it('initialsFromName handles single names, multi-names, and empty input', () => {
    expect(initialsFromName('Arshad Shah')).toBe('AS');
    expect(initialsFromName('Cher')).toBe('CH');
    expect(initialsFromName('')).toBe('');
    expect(initialsFromName('  First  Middle  Last  ')).toBe('FL');
  });
});

describe('AvatarGroup', () => {
  it('collapses avatars past `max` into a +N tile', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
        <Avatar name="D" />
      </AvatarGroup>,
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('omits the overflow tile when max equals or exceeds child count', () => {
    render(
      <AvatarGroup max={5}>
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>,
    );
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
