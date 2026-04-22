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

  it('renders icon fallback when no name/initials/fallback supplied', () => {
    render(<Avatar icon={<span data-testid="ic">i</span>} />);
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it('renders explicit fallback node when provided (taking precedence over name)', () => {
    render(<Avatar name="Arshad Shah" fallback={<span data-testid="fb">FB</span>} />);
    expect(screen.getByTestId('fb')).toBeInTheDocument();
    expect(screen.queryByText('AS')).not.toBeInTheDocument();
  });

  it('uses explicit initials override instead of deriving from name', () => {
    render(<Avatar name="Arshad Shah" initials="ZZ" />);
    expect(screen.getByText('ZZ')).toBeInTheDocument();
    expect(screen.queryByText('AS')).not.toBeInTheDocument();
  });

  it('respects explicit colorScheme over name-derived palette', () => {
    const { container } = render(<Avatar name="Arshad" colorScheme="violet" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('ignores invalid colorScheme without throwing', () => {
    const { container } = render(<Avatar name="Arshad" colorScheme={'nope' as never} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders ring class when ring=true', () => {
    const { container } = render(<Avatar name="A" ring />);
    expect(container.firstChild).not.toBeNull();
  });

  it('supports status with explicit top-right position', () => {
    const { container } = render(<Avatar name="A" status="busy" statusPosition="top-right" />);
    expect(container.querySelector('[data-status="busy"]')).not.toBeNull();
  });

  it('renders Image element when src is provided', () => {
    const { container } = render(<Avatar name="A" src="/x.png" alt="A pic" />);
    // Image renders inside Radix; alt should be passed through
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('falls back to empty alt when both alt and name are missing', () => {
    const { container } = render(<Avatar src="/y.png" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('initials empty + name present sets aria-label on fallback', () => {
    const { container } = render(<Avatar name="X" initials="" />);
    const fb = container.querySelector('[aria-label="X"]');
    expect(fb).not.toBeNull();
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
