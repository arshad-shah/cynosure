import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Link } from '../Link/index.js';

describe('Link', () => {
  it('renders an <a>', () => {
    const { getByRole } = render(<Link href="/x">docs</Link>);
    const a = getByRole('link') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/x');
    expect(a.textContent).toBe('docs');
  });

  it('adds rel="noopener noreferrer" and target="_blank" for external', () => {
    const { getByRole } = render(
      <Link href="https://example.com" external>
        External
      </Link>,
    );
    const a = getByRole('link') as HTMLAnchorElement;
    const rel = (a.getAttribute('rel') ?? '').split(/\s+/);
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    expect(a.getAttribute('target')).toBe('_blank');
  });

  it('merges user-provided rel with noopener/noreferrer and dedupes', () => {
    const { getByRole } = render(
      <Link href="https://example.com" external rel="author noopener">
        External
      </Link>,
    );
    const a = getByRole('link') as HTMLAnchorElement;
    const rel = (a.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean);
    expect(rel).toContain('author');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    // no duplicate `noopener`
    expect(rel.filter((r) => r === 'noopener')).toHaveLength(1);
  });

  it('renders a decorative external icon with aria-hidden', () => {
    const { container } = render(
      <Link href="https://example.com" external>
        Link
      </Link>,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('suppresses clicks when disabled and sets aria-disabled', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Link href="/x" disabled onClick={onClick}>
        docs
      </Link>,
    );
    const a = getByRole('link') as HTMLAnchorElement;
    expect(a.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(a);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild projects Link onto a framework routing component', () => {
    const { container } = render(
      <Link asChild>
        <a href="/routing">next</a>
      </Link>,
    );
    const a = container.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/routing');
  });
});
