import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Pagination,
  PaginationNext,
  PaginationPages,
  PaginationPrevious,
} from '../Pagination/index.js';

describe('Pagination', () => {
  function Harness({ initial = 1, total = 10 }: { initial?: number; total?: number } = {}) {
    const [page, setPage] = useState(initial);
    return (
      <Pagination totalPages={total} currentPage={page} onPageChange={setPage} showFirstLast />
    );
  }

  it('renders a nav with an accessible label', () => {
    render(<Harness />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('fires onPageChange when a page button is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination totalPages={10} currentPage={1} onPageChange={onPageChange}>
        <PaginationPrevious />
        <PaginationPages />
        <PaginationNext />
      </Pagination>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('marks the active page with aria-current', () => {
    render(<Harness initial={4} />);
    const current = screen.getByRole('button', { name: /current page/i });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveTextContent('4');
  });

  it('disables previous/first on the first page', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
  });

  it('disables next/last on the last page', () => {
    render(<Harness initial={10} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('advances when Next is clicked', () => {
    render(<Harness initial={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('button', { name: /current page/i })).toHaveTextContent('2');
  });
});
